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
