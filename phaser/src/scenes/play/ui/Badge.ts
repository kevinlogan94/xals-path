import Phaser from 'phaser';
import { fitInBox } from './fit';

export function createBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  depth?: number,
): Phaser.GameObjects.Image {
  const badge = fitInBox(scene, 'ui-exclaim', size, size).setPosition(x, y).setVisible(false);
  if (depth !== undefined) badge.setDepth(depth);
  return badge;
}

export function showBadge(badge: Phaser.GameObjects.Image | undefined, visible: boolean): void {
  badge?.setVisible(visible);
}
