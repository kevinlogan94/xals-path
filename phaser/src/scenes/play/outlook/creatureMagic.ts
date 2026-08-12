import type Phaser from 'phaser';

const EXPLODE = 'magic-explode';
const IDLE = 'magic-idle-sheet';
export const MAGIC_EFFECT = 'magic-effect';
export const MAGIC_IDLE = 'magic-idle';

export function preloadCreatureMagic(load: Phaser.Loader.LoaderPlugin): void {
  load.image(EXPLODE, 'assets/ui/energyBallExploding.png');
  load.image(IDLE, 'assets/ui/energyBallSpriteSheet.png');
}

function slice(tex: Phaser.Textures.Texture, prefix: string, xs: number[]): void {
  if (tex.has(`${prefix}-0`)) return;
  xs.forEach((x, i) => tex.add(`${prefix}-${i}`, 0, x, 10, 170, 170));
}

export function ensureMagicAnims(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists(EXPLODE) || !scene.textures.exists(IDLE)) return false;
  slice(scene.textures.get(EXPLODE), 'ex', [5, 183, 361, 539]);
  slice(scene.textures.get(IDLE), 'id', [5, 184, 360]);
  if (!scene.anims.exists(MAGIC_EFFECT)) {
    const idle = [0, 1, 2].map((i) => ({ key: IDLE, frame: `id-${i}` }));
    scene.anims.create({
      key: MAGIC_EFFECT,
      frames: [
        { key: EXPLODE, frame: 'ex-3' },
        { key: EXPLODE, frame: 'ex-2' },
        { key: EXPLODE, frame: 'ex-1' },
        { key: EXPLODE, frame: 'ex-0' },
        ...idle,
        ...idle,
      ],
      frameRate: 12,
      repeat: 0,
    });
  }
  if (!scene.anims.exists(MAGIC_IDLE)) {
    scene.anims.create({
      key: MAGIC_IDLE,
      frames: [0, 1, 2].map((i) => ({ key: IDLE, frame: `id-${i}` })),
      frameRate: 6,
      repeat: -1,
    });
  }
  return true;
}

export function makeMagicSprite(scene: Phaser.Scene): Phaser.GameObjects.Sprite | null {
  if (!ensureMagicAnims(scene)) return null;
  return scene.add.sprite(0, 0, EXPLODE, 'ex-3').setDepth(6).setVisible(false);
}
