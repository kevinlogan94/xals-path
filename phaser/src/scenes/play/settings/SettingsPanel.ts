import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import type { RegionId } from '../../../types';
import { addFramedPanel } from '../ui/FramedPanel';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';

interface SettingsPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  showToast: (message: string) => void;
  onPortalTravel: (region: RegionId) => void;
  onNewGame: () => void;
}

export function renderSettingsPanel({
  scene,
  panel,
  ctx,
  showToast,
  onPortalTravel,
  onNewGame,
}: SettingsPanelConfig): void {
  const w = scene.scale.width;
  const contentTop = addFramedPanel(scene, panel, 'Settings').listTop;
  let y = contentTop + 28;

  const section = (label: string) => {
    panel.add(scene.add.text(w / 2, y, label, whiteText('7px')).setOrigin(0.5));
    y += 22;
  };

  const mkToggle = (initial: string, muted: boolean, onToggle: () => string) => {
    const speaker = scene.add
      .image(w / 2 - 70, y, muted ? 'ui-speaker-off' : 'ui-speaker-on')
      .setDisplaySize(28, 28)
      .setInteractive({ useHandCursor: true });
    const btn = scene.add
      .image(w / 2 + 24, y, 'ui-btn-blue')
      .setDisplaySize(140, 36)
      .setInteractive({ useHandCursor: true });
    const label = scene.add.text(w / 2 + 24, y, initial, whiteText('8px')).setOrigin(0.5);
    const apply = () => {
      const text = onToggle();
      const nowMuted = text.endsWith('Off');
      speaker.setTexture(nowMuted ? 'ui-speaker-off' : 'ui-speaker-on');
      label.setText(text);
    };
    speaker.on('pointerdown', apply);
    btn.on('pointerdown', apply);
    panel.add([speaker, btn, label]);
    y += 48;
  };

  const mkImgBtn = (key: string, label: string, fn: () => void) => {
    panel.add(createImageButton(scene, w / 2, y, key, label, 180, 40, fn, 1, '9px'));
    y += 52;
  };

  section('Background Music');
  mkToggle(
    ctx.audio.muteBgm ? 'Music Off' : 'Music On',
    ctx.audio.muteBgm,
    () => (ctx.audio.toggleMuteBgm() ? 'Music Off' : 'Music On'),
  );

  section('Sound Effects');
  mkToggle(
    ctx.audio.muteSfx ? 'SFX Off' : 'SFX On',
    ctx.audio.muteSfx,
    () => (ctx.audio.toggleMuteSfx() ? 'SFX Off' : 'SFX On'),
  );

  mkImgBtn('ui-btn-green', 'Credits', () => {
    showToast("Xal's Path — web remake");
  });

  if (ctx.state.portalUnlocked) {
    (['meadow', 'river', 'altar'] as RegionId[]).forEach((r) => {
      mkImgBtn('ui-btn-blue', `Portal: ${r}`, () => onPortalTravel(r));
    });
  } else {
    panel.add(scene.add.text(w / 2, y, 'Portal sealed', whiteText('8px', { color: '#888' })).setOrigin(0.5));
    y += 40;
  }

  mkImgBtn('ui-btn-orange', 'New Game', onNewGame);
}
