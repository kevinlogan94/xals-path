/** Unity FingerPointerPanel — white glove bobbing pointer. */
export function createFingerPointer(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth = 55,
): Phaser.GameObjects.Image {
  const img = scene.add.image(x, y, 'ui-pointer').setDepth(depth).setVisible(false);
  scene.tweens.add({
    targets: img,
    y: y - 10,
    duration: 550,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
  return img;
}
