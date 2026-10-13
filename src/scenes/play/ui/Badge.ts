import Phaser from 'phaser';
import { DARK_STROKE, FONT } from './constants';

/** Red bang on the nav badges. */
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
      fontStyle: 'bold',
      fontSize: `${size}px`,
      color: '#ff3a3a',
      stroke: DARK_STROKE,
      strokeThickness: 1,
    })
    .setOrigin(0.5)
    .setVisible(false);
  if (depth !== undefined) badge.setDepth(depth);
  return badge;
}

const BASE_Y = 'badgeBaseY';

export function showBadge(badge: Phaser.GameObjects.Text | undefined, visible: boolean): void {
  if (!badge) return;
  const was = badge.visible;
  badge.setVisible(visible);
  if (!visible) {
    badge.scene.tweens.killTweensOf(badge);
    const base = badge.getData(BASE_Y) as number | undefined;
    if (base !== undefined) badge.y = base;
    return;
  }
  if (!was) bounce(badge);
}

function bounce(badge: Phaser.GameObjects.Text): void {
  const base = (badge.getData(BASE_Y) as number | undefined) ?? badge.y;
  badge.setData(BASE_Y, base);
  badge.scene.tweens.killTweensOf(badge);
  badge.y = base;
  badge.scene.tweens.add({
    targets: badge,
    y: base - 4,
    duration: 420,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}
