import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { addFramedPanel } from '../ui/FramedPanel';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';

const GITHUB = 'https://github.com/kevinlogan94/xals-path';
const COFFEE = 'https://buymeacoffee.com/kevinmlogan';
const SITE = 'https://kevinmlogan.com';

interface SettingsPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  onCredits: () => void;
  onNewGame: () => void;
}

const openUrl = (url: string) => () => window.open(url, '_blank', 'noopener,noreferrer');

export function renderSettingsPanel({
  scene,
  panel,
  ctx,
  onCredits,
  onNewGame,
}: SettingsPanelConfig): void {
  const { listTop, listLeft, listWidth } = addFramedPanel(scene, panel, 'Settings');
  const midX = listLeft + listWidth / 2;
  const pad = 10;
  const right = listLeft + listWidth - pad;
  let y = listTop + 22;

  const ink = (size: string) => darkText(size);

  const section = (label: string) => {
    panel.add(scene.add.text(listLeft + pad, y, label, ink('9px')).setOrigin(0, 0.5));
    y += 30;
  };

  const mkMuteRow = (label: string, muted: boolean, onToggle: () => boolean) => {
    let isMuted = muted;
    const icon = 26;
    const stateSlot = 54;
    const speaker = scene.add
      .image(right - stateSlot - icon / 2, y, isMuted ? 'ui-speaker-off' : 'ui-speaker-on')
      .setDisplaySize(icon, icon);
    const state = scene.add.text(right, y, isMuted ? 'MUTED' : 'ON', ink('8px')).setOrigin(1, 0.5);
    const apply = () => {
      isMuted = onToggle();
      speaker.setTexture(isMuted ? 'ui-speaker-off' : 'ui-speaker-on');
      state.setText(isMuted ? 'MUTED' : 'ON');
    };
    const hit = scene.add
      .rectangle(midX, y, listWidth, 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', apply);
    panel.add([
      hit,
      scene.add.text(listLeft + pad, y, label, ink('8px')).setOrigin(0, 0.5),
      speaker,
      state,
    ]);
    y += 44;
  };

  section('Audio');
  mkMuteRow('Music', ctx.audio.muteBgm, () => ctx.audio.toggleMuteBgm());
  mkMuteRow('Effects', ctx.audio.muteSfx, () => ctx.audio.toggleMuteSfx());

  y += 20;
  section('About');
  const gap = 12;
  const btnW = (listWidth - gap) / 2;
  const btnH = 40;
  const colL = listLeft + btnW / 2;
  const colR = listLeft + listWidth - btnW / 2;
  const about: [string, () => void][] = [
    ['Credits', onCredits],
    ['GitHub', openUrl(GITHUB)],
    ['Coffee', openUrl(COFFEE)],
    ['Site', openUrl(SITE)],
  ];
  about.forEach(([label, fn], i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    panel.add(
      createImageButton(
        scene,
        col ? colR : colL,
        y + row * (btnH + gap),
        'ui-btn-blue',
        label,
        btnW,
        btnH,
        fn,
        1,
        '8px',
      ),
    );
  });
  y += (btnH + gap) * 2 + 16;

  panel.add(
    createImageButton(scene, midX, y, 'ui-btn-orange', 'New Game', listWidth, 40, onNewGame, 1, '9px'),
  );
}
