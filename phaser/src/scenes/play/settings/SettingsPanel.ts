import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { addFramedPanel } from '../ui/FramedPanel';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';

interface SettingsPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  onAchievements: () => void;
  onCredits: () => void;
  onNewGame: () => void;
}

export function renderSettingsPanel({
  scene,
  panel,
  ctx,
  onAchievements,
  onCredits,
  onNewGame,
}: SettingsPanelConfig): void {
  const w = scene.scale.width;
  const contentTop = addFramedPanel(scene, panel, 'Settings').listTop;
  let y = contentTop + 28;

  const section = (label: string) => {
    panel.add(scene.add.text(w / 2, y, label, whiteText('7px')).setOrigin(0.5));
    y += 22;
  };

  /** Unity audio row: label + speaker + thick black mute line (boolean toggle). */
  const mkMuteRow = (muted: boolean, onToggle: () => boolean) => {
    let isMuted = muted;
    const speaker = scene.add
      .image(w / 2 - 78, y, isMuted ? 'ui-speaker-off' : 'ui-speaker-on')
      .setDisplaySize(28, 28)
      .setInteractive({ useHandCursor: true });
    const line = scene.add
      .rectangle(w / 2 + 20, y, 150, 10, 0x0a0a0a)
      .setStrokeStyle(2, 0x1a1a1a)
      .setInteractive({ useHandCursor: true });
    const apply = () => {
      isMuted = onToggle();
      speaker.setTexture(isMuted ? 'ui-speaker-off' : 'ui-speaker-on');
      line.setFillStyle(isMuted ? 0x3a3a3a : 0x0a0a0a);
    };
    speaker.on('pointerdown', apply);
    line.on('pointerdown', apply);
    if (isMuted) line.setFillStyle(0x3a3a3a);
    panel.add([speaker, line]);
    y += 44;
  };

  const mkImgBtn = (key: string, label: string, fn: () => void) => {
    panel.add(createImageButton(scene, w / 2, y, key, label, 180, 40, fn, 1, '9px'));
    y += 52;
  };

  section('Background Music');
  mkMuteRow(ctx.audio.muteBgm, () => ctx.audio.toggleMuteBgm());

  section('Sound Effects');
  mkMuteRow(ctx.audio.muteSfx, () => ctx.audio.toggleMuteSfx());

  mkImgBtn('ui-btn-green', 'Achievements', onAchievements);
  mkImgBtn('ui-btn-blue', 'Credits', onCredits);
  mkImgBtn('ui-btn-orange', 'New Game', onNewGame);
}
