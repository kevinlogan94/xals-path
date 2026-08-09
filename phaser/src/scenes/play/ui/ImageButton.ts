import Phaser from 'phaser';
import { whiteText } from './textStyles';

/**
 * Image + centered label with an explicit display-sized hit rect.
 * Click fires on pointerup so scroll lists can suppress after a drag.
 */
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
  onPressStart?: () => void,
): Phaser.GameObjects.Container {
  const image = scene.add.image(0, 0, key).setDisplaySize(width, height).setAlpha(alpha);
  const text = scene.add.text(0, 0, label, whiteText(fontSize)).setOrigin(0.5);
  const button = scene.add.container(x, y, [image, text]).setSize(width, height);

  if (onClick || onPressStart) {
    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    button.input!.cursor = 'pointer';
    if (onPressStart) button.on('pointerdown', onPressStart);
    if (onClick) button.on('pointerup', onClick);
  }

  return button;
}
