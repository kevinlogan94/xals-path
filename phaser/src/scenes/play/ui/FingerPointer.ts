/** Unity FingerPointerPanel — white glove bobbing pointer. */
export function createFingerPointer(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth = 55,
): Phaser.GameObjects.Container {
  const img = scene.add.image(0, 0, 'ui-pointer');
  const root = scene.add.container(x, y, [img]).setDepth(depth).setVisible(false);
  bob(scene, img, false);
  return root;
}

/** Unity FingerPointerShop uses scale.y = -1 to point down at bottom-nav targets. */
export function aimFinger(root: Phaser.GameObjects.Container, pointDown: boolean): void {
  const img = root.list[0] as Phaser.GameObjects.Image;
  if (img.flipY === pointDown) return;
  img.setFlipY(pointDown);
  img.setY(0);
  bob(root.scene, img, pointDown);
}

function bob(scene: Phaser.Scene, img: Phaser.GameObjects.Image, pointDown: boolean): void {
  scene.tweens.killTweensOf(img);
  scene.tweens.add({
    targets: img,
    y: pointDown ? 10 : -10,
    duration: 550,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}
