import Phaser from 'phaser';
import { DARK_STROKE, FONT } from './constants';

/** Pixel-font bang with stroke so it stays crisp at HUD/nav sizes. */
export function createBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  depth?: number,
): Phaser.GameObjects.Text {
  const badge = scene.add
    .text(x, y, '!', {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color: '#ff3a3a',
      stroke: DARK_STROKE,
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setVisible(false);
  if (depth !== undefined) badge.setDepth(depth);
  return badge;
}

export function showBadge(badge: Phaser.GameObjects.Text | undefined, visible: boolean): void {
  badge?.setVisible(visible);
}
