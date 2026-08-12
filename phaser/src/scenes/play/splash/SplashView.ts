import Phaser from 'phaser';
import { NAV_H } from '../ui/constants';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';

const SPLASH_NAME = 'splash-shell';
const PANEL_KEY = 'ui-panel';
const BANNER_KEY = 'ui-splash-banner';

const SPLASH_TITLES: Record<SplashType, string> = {
  creature: 'New Creature Unlocked',
  achievement: 'Reward Received',
  influenceOverTime: 'Influence Earned',
  buff: 'Blessing of the Gods',
  endGame: 'Congratulations',
  newGame: 'New Game',
  portal: 'Portal',
  levelUp: 'Level Up Rewards',
};

export type SplashType =
  | 'creature'
  | 'achievement'
  | 'influenceOverTime'
  | 'buff'
  | 'endGame'
  | 'newGame'
  | 'portal'
  | 'levelUp';

export type SplashContentApi = {
  close: () => void;
  /** Reveal panel + banner (used after lock unlock). No-op when chrome was not deferred. */
  showChrome: () => void;
  bodyWidth: number;
  /** Content-local Y range below the banner, inside the panel. */
  bodyTop: number;
  bodyBottom: number;
};

const SPLASH_GAP = 22;

function splashItemH(obj: Phaser.GameObjects.GameObject): number {
  if (obj instanceof Phaser.GameObjects.Text) return obj.height;
  const sized = obj as Phaser.GameObjects.Image;
  return sized.displayHeight || sized.height || 0;
}

/** Center a column in the splash body with even gaps. */
export function stackSplash(
  items: Phaser.GameObjects.GameObject[],
  api: SplashContentApi,
  gap = SPLASH_GAP,
): void {
  const hs = items.map(splashItemH);
  const total = hs.reduce((a, b) => a + b, 0) + gap * Math.max(0, items.length - 1);
  let y = api.bodyTop + Math.max(0, (api.bodyBottom - api.bodyTop - total) / 2);
  items.forEach((item, i) => {
    (item as Phaser.GameObjects.Image).setY(y + hs[i] / 2);
    y += hs[i] + gap;
  });
}

export type SplashContentBuilder = (
  content: Phaser.GameObjects.Container,
  api: SplashContentApi,
) => void;

export type SplashOpenOpts = {
  build?: SplashContentBuilder;
  data?: unknown;
  title?: string;
  /** Dim only until content calls showChrome (creature lock beat). */
  deferChrome?: boolean;
};

/** Shared splash shell: dim + panel + green banner + content host. Single instance; pop on close. */
export function createSplash(
  scene: Phaser.Scene,
  parent: Phaser.GameObjects.Container,
  deps: { playPop: () => void },
) {
  let overlay: Phaser.GameObjects.Container | null = null;

  const destroy = () => {
    overlay?.destroy(true);
    overlay = null;
  };

  const close = () => {
    if (!overlay) return;
    destroy();
    deps.playPop();
  };

  const dismiss = () => destroy();

  const open = (type: SplashType, opts?: SplashOpenOpts) => {
    destroy();

    const w = scene.scale.width;
    const h = scene.scale.height;
    const playH = h - NAV_H;
    const cx = w / 2;
    const cy = playH / 2;

    overlay = scene.add.container(0, 0).setName(`${SPLASH_NAME}-${type}`);
    overlay.add(scene.add.rectangle(cx, h / 2, w, h, 0x0d140d, 0.72).setInteractive());

    const frame = scene.textures.exists(PANEL_KEY) ? scene.textures.getFrame(PANEL_KEY) : null;
    const displayW = w - 48;
    let displayH = 0;
    if (frame?.width) {
      displayH = Math.min(frame.height * (displayW / frame.width), playH);
    }
    const deferChrome = opts?.deferChrome === true;
    const inset = Math.max(14, Math.round(displayW * 0.045));
    // Unity TopPanel: wider/taller, anchored to panel top with ~half overlapping above.
    const bannerW = displayW * 0.88;
    const bannerH = Math.round(bannerW / 3.1);
    const panelTop = cy - displayH / 2;
    const bannerY = panelTop + bannerH * 0.15;
    const contentY = cy + bannerH * 0.12;
    const bodyWidth = displayW - inset * 2;
    const pad = Math.max(22, Math.round((displayH || playH) * 0.045));
    const bodyTop = bannerY + bannerH * 0.5 + 8 - contentY;
    const bodyBottom = cy + (displayH || playH) / 2 - pad - contentY;

    let panelImg: Phaser.GameObjects.Image | null = null;
    let bannerImg: Phaser.GameObjects.Image | null = null;
    let titleText: Phaser.GameObjects.Text | null = null;

    if (displayH > 0) {
      panelImg = scene.add.image(cx, cy, PANEL_KEY).setDisplaySize(displayW, displayH);
      panelImg.setVisible(!deferChrome);
      overlay.add(panelImg);
    }

    const title = opts?.title ?? SPLASH_TITLES[type];
    if (scene.textures.exists(BANNER_KEY)) {
      bannerImg = scene.add.image(cx, bannerY, BANNER_KEY).setDisplaySize(bannerW, bannerH);
      bannerImg.setVisible(!deferChrome);
      overlay.add(bannerImg);
      titleText = scene.add
        .text(cx, bannerY, title, whiteText('14px', { strokeThickness: 4 }))
        .setOrigin(0.5)
        .setVisible(!deferChrome);
      overlay.add(titleText);
    }

    const content = scene.add
      .container(cx, deferChrome ? cy : contentY)
      .setName('splash-content');
    overlay.add(content);

    const showChrome = () => {
      panelImg?.setVisible(true);
      bannerImg?.setVisible(true);
      titleText?.setVisible(true);
      content.setPosition(cx, contentY);
    };

    const api: SplashContentApi = { close, showChrome, bodyWidth, bodyTop, bodyBottom };
    try {
      if (opts?.build) opts.build(content, api);
      else {
        overlay.add(
          createImageButton(scene, cx, cy + displayH / 2 - 36, 'ui-btn-blue', 'Back', 100, 32, close),
        );
      }
    } catch (e) {
      destroy();
      throw e;
    }

    parent.add(overlay);
  };

  return { open, close, dismiss, isOpen: () => overlay !== null };
}
