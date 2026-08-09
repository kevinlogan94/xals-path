import Phaser from 'phaser';
import { NAV_H } from '../ui/constants';
import { createImageButton } from '../ui/ImageButton';

const SPLASH_NAME = 'splash-shell';
const PANEL_KEY = 'ui-panel';

export type SplashType =
  | 'creature'
  | 'achievement'
  | 'influenceOverTime'
  | 'buff'
  | 'endGame'
  | 'newGame'
  | 'portal';

export type SplashContentApi = { close: () => void };

export type SplashContentBuilder = (
  content: Phaser.GameObjects.Container,
  api: SplashContentApi,
) => void;

export type SplashOpenOpts = {
  build?: SplashContentBuilder;
  data?: unknown;
};

/** Shared splash shell: dim + panel bg + content host. Single instance; pop on close. */
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
      overlay.add(scene.add.image(cx, cy, PANEL_KEY).setDisplaySize(displayW, displayH));
    }

    const content = scene.add.container(cx, cy).setName('splash-content');
    overlay.add(content);

    const api: SplashContentApi = { close };
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
