import Phaser from 'phaser';

/** Fit a texture into a box without distorting aspect ratio. */
export function fitInBox(
  scene: Phaser.Scene,
  key: string,
  maxW: number,
  maxH: number,
): Phaser.GameObjects.Image {
  const img = scene.add.image(0, 0, key);
  const src = img.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const tw = Math.max(1, src.width);
  const th = Math.max(1, src.height);
  const scale = Math.min(maxW / tw, maxH / th);
  img.setDisplaySize(Math.round(tw * scale), Math.round(th * scale));
  return img;
}

/** Locked well: emblem as a dark silhouette with a lock badge in the bottom-right corner. */
export function lockedEmblem(
  scene: Phaser.Scene,
  key: string,
  size: number,
): Phaser.GameObjects.Container {
  // Pixel-art lock: whole-number scale + nearest filtering keeps its edges sharp.
  scene.textures.get('ui-lock').setFilter(Phaser.Textures.FilterMode.NEAREST);
  const lock = scene.add.image(0, 0, 'ui-lock');
  lock.setScale(Math.max(1, Math.round((size * 0.4) / lock.height)));
  const offset = Math.round(size / 2 - lock.displayHeight * 0.6);
  return scene.add.container(0, 0, [
    fitInBox(scene, key, size, size).setTintFill(0x4a4038).setAlpha(0.85),
    lock.setPosition(offset, offset),
  ]);
}
