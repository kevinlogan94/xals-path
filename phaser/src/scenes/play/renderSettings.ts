import Phaser from 'phaser';
import type { GameContext } from '../../game/GameContext';
import type { RegionId } from '../../types';
import { FONT } from './constants';
import { addFramedPanel } from './framedPanel';

export function renderSettings(opts: {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  showToast: (msg: string) => void;
  applyRegionVisual: () => void;
  goOutlook: () => void;
  onNewGame: () => void;
}): void {
  const { scene, panel, ctx, showToast, applyRegionVisual, goOutlook, onNewGame } =
    opts;
  const w = scene.scale.width;
  const contentTop = addFramedPanel(scene, panel, 'Settings');
  let y = contentTop + 28;

  const section = (label: string) => {
    panel.add(
      scene.add
        .text(w / 2, y, label, {
          fontFamily: FONT,
          fontSize: '7px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5),
    );
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
    const label = scene.add
      .text(w / 2 + 24, y, initial, {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#ffffff',
        stroke: '#1a1208',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
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

  const mkImgBtn = (key: string, label: string, fn: () => void) => {
    const btn = scene.add
      .image(w / 2, y, key)
      .setDisplaySize(180, 40)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerdown', fn);
    panel.add(btn);
    panel.add(
      scene.add
        .text(w / 2, y, label, {
          fontFamily: FONT,
          fontSize: '9px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5),
    );
    y += 52;
  };

  mkImgBtn('ui-btn-green', 'Credits', () => {
    showToast("Xal's Path — web remake");
  });

  if (ctx.state.portalUnlocked) {
    (['meadow', 'river', 'altar'] as RegionId[]).forEach((r) => {
      mkImgBtn('ui-btn-blue', `Portal: ${r}`, () => {
        if (ctx.state.region === r) return;
        ctx.state.region = r;
        ctx.economy.drainMana(ctx.state);
        ctx.spawn.clear();
        applyRegionVisual();
        ctx.audio.playSfx('cast');
        goOutlook();
      });
    });
  } else {
    panel.add(
      scene.add
        .text(w / 2, y, 'Portal sealed', {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#888',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5),
    );
    y += 40;
  }

  mkImgBtn('ui-btn-orange', 'New Game', () => {
    ctx.reset();
    onNewGame();
    showToast('Save cleared');
  });
}
