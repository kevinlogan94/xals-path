import Phaser from 'phaser';

/** Exclaim badge with fixed square display (asset is tall; do not aspect-fit). */
export function createBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  depth?: number,
): Phaser.GameObjects.Image {
  const badge = scene.add
    .image(x, y, 'ui-exclaim')
    .setDisplaySize(size, size)
    .setVisible(false);
  if (depth !== undefined) badge.setDepth(depth);
  return badge;
}

export function showBadge(badge: Phaser.GameObjects.Image | undefined, visible: boolean): void {
  badge?.setVisible(visible);
}
