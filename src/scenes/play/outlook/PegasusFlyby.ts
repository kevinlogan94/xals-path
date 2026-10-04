import Phaser from 'phaser';
import { createFingerPointer } from '../ui/FingerPointer';

/** Full pegasus-animation.png sheet: 4 columns × 3 rows. */
const FLY_FRAMES = 12;
const CROSS_SECONDS = 2.5;
const GAP_SECONDS = 10;

type Bounds = { x: number; y: number; w: number; h: number };

/** One blessing Pegasus. Waits offscreen between passes; the wait holds while Outlook is hidden. */
export class PegasusFlyby {
  private sprite?: Phaser.GameObjects.Sprite;
  private pointer?: Phaser.GameObjects.Container;
  private dir = 1;
  private shown = false;
  private wait = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onTap: () => void,
  ) {}

  hits(x: number, y: number): boolean {
    if (this.sprite?.visible && this.sprite.getBounds().contains(x, y)) return true;
    return !!this.pointer?.visible && this.pointer.getBounds().contains(x, y);
  }

  sync(opts: {
    pending: boolean;
    flying: boolean;
    showPointer: boolean;
    bounds: Bounds;
  }): void {
    if (!opts.pending) {
      if (this.sprite) this.destroy();
      return;
    }
    if (!this.ensure(opts.bounds, opts.showPointer)) return;
    if (this.shown !== opts.flying) {
      this.shown = opts.flying;
      this.sprite!.setVisible(opts.flying);
      if (opts.flying) this.sprite!.setInteractive({ useHandCursor: true });
      else this.sprite!.disableInteractive();
    }
    const point = opts.flying && opts.showPointer;
    if (this.pointer && this.pointer.visible !== point) {
      this.pointer.setVisible(point);
      const glove = this.pointer.list[0] as Phaser.GameObjects.Image;
      if (point) glove.setInteractive({ useHandCursor: true });
      else glove.disableInteractive();
    }
  }

  tick(dt: number, bounds: Bounds): void {
    const s = this.sprite;
    if (!s || !this.shown) return;
    if (this.wait > 0) {
      this.wait = Math.max(0, this.wait - dt);
      s.setVisible(false);
      this.pointer?.setVisible(false);
      return;
    }
    s.setVisible(true);
    if (this.pointer) this.pointer.setVisible(true);
    const y = bounds.y + s.displayHeight / 2 + 4;
    s.y = y + Math.sin(this.scene.time.now / 280) * 6;
    const speed = (bounds.w + s.displayWidth) / CROSS_SECONDS;
    s.x += this.dir * speed * dt;
    const half = s.displayWidth / 2;
    const left = bounds.x;
    const right = bounds.x + bounds.w;
    if (this.dir > 0 && s.x - half >= right) {
      this.dir = -1;
      s.setFlipX(true);
      s.x = right + half;
      this.wait = GAP_SECONDS;
    } else if (this.dir < 0 && s.x + half <= left) {
      this.dir = 1;
      s.setFlipX(false);
      s.x = left - half;
      this.wait = GAP_SECONDS;
    }
    if (this.pointer?.visible) {
      this.pointer.setPosition(s.x, s.y + s.displayHeight / 2 + 4);
    }
  }

  destroy(): void {
    this.sprite?.destroy();
    this.pointer?.destroy();
    this.sprite = undefined;
    this.pointer = undefined;
    this.dir = 1;
    this.shown = false;
    this.wait = 0;
  }

  private ensure(bounds: Bounds, showPointer: boolean): boolean {
    if (this.sprite) return true;
    if (!this.scene.textures.exists('pegasus')) return false;
    if (!this.scene.anims.exists('pegasus-fly')) {
      this.scene.anims.create({
        key: 'pegasus-fly',
        frames: this.scene.anims.generateFrameNumbers('pegasus', { start: 0, end: FLY_FRAMES - 1 }),
        frameRate: 10,
        repeat: -1,
      });
    }
    const sprite = this.scene.add.sprite(0, 0, 'pegasus', 0).setDepth(8).setVisible(false);
    sprite.play('pegasus-fly');
    sprite.setScale(180 / sprite.width);
    sprite.x = bounds.x - sprite.displayWidth / 2;
    sprite.on('pointerdown', () => this.onTap());
    this.sprite = sprite;

    if (showPointer) {
      const pointer = createFingerPointer(this.scene, sprite.x, sprite.y, 9);
      (pointer.list[0] as Phaser.GameObjects.Image).on('pointerdown', () => this.onTap());
      this.pointer = pointer;
    }
    return true;
  }
}
