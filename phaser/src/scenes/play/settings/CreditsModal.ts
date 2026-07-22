import Phaser from 'phaser';
import { NAV_H, PANEL_TOP } from '../ui/constants';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';

const CREDITS_NAME = 'credits-modal';

/** Simple credits overlay (web stand-in for Unity Credits panel). Single instance. */
export function showCreditsModal(scene: Phaser.Scene, parent: Phaser.GameObjects.Container): void {
  const prior = parent.getByName(CREDITS_NAME);
  if (prior) prior.destroy(true);

  const w = scene.scale.width;
  const h = scene.scale.height;
  const overlay = scene.add.container(0, 0).setName(CREDITS_NAME);
  const close = () => overlay.destroy(true);
  const dim = scene.add
    .rectangle(w / 2, (h - NAV_H) / 2, w, h - NAV_H, 0x0d140d, 0.72)
    .setInteractive();
  dim.on('pointerup', close);
  const boxW = w - 48;
  const boxH = 220;
  const cy = PANEL_TOP + 160;
  overlay.add([
    dim,
    scene.add.rectangle(w / 2, cy, boxW, boxH, 0x2a2218).setStrokeStyle(2, 0x8a7040),
    scene.add.text(w / 2, cy - 70, 'Credits', whiteText('12px', { strokeThickness: 4 })).setOrigin(0.5),
    scene.add
      .text(
        w / 2,
        cy - 20,
        "Xal's Path\nWeb remake\n\nOriginal by Intrigue Games",
        whiteText('8px', { align: 'center', lineSpacing: 6 }),
      )
      .setOrigin(0.5),
    createImageButton(scene, w / 2, cy + 70, 'ui-btn-blue', 'Close', 120, 34, close),
  ]);
  parent.add(overlay);
}
