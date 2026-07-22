import Phaser from 'phaser';
import { whiteText } from './textStyles';

export function createImageButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  label: string,
  width: number,
  height: number,
  onClick?: () => void,
  alpha = 1,
  fontSize = '8px',
): Phaser.GameObjects.Container {
  const image = scene.add.image(0, 0, key).setDisplaySize(width, height).setAlpha(alpha);
  const text = scene.add.text(0, 0, label, whiteText(fontSize)).setOrigin(0.5);
  const button = scene.add
    .container(x, y, [image, text])
    .setSize(width, height);

  if (onClick) {
    button.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    button.input!.cursor = 'pointer';
    button.on('pointerdown', onClick);
  }

  return button;
}
