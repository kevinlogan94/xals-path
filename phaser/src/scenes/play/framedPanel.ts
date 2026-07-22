import Phaser from 'phaser';
import { FONT, NAV_H } from './constants';

/** Dimmer + ui-panel + ui-banner + title. */
export function addFramedPanel(
  scene: Phaser.Scene,
  panel: Phaser.GameObjects.Container,
  title: string,
): { contentTop: number; dimmer: Phaser.GameObjects.Rectangle } {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const top = 100;
  const panelH = h - NAV_H - top - 8;
  const panelW = w - 16;
  const cy = top + panelH / 2;
  const dimmer = scene.add
    .rectangle(w / 2, (h - NAV_H) / 2, w, h - NAV_H, 0x0d140d, 0.55)
    .setInteractive();
  panel.add(dimmer);
  panel.add(
    scene.add.image(w / 2, cy, 'ui-panel').setDisplaySize(panelW, panelH),
  );
  panel.add(
    scene.add
      .image(w / 2, top + 18, 'ui-banner')
      .setDisplaySize(panelW * 0.72, 34),
  );
  panel.add(
    scene.add
      .text(w / 2, top + 18, title, {
        fontFamily: FONT,
        fontSize: '11px',
        color: '#ffffff',
        stroke: '#1a1208',
        strokeThickness: 4,
      })
      .setOrigin(0.5),
  );
  return { contentTop: top + 44, dimmer };
}
