import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { NAV_H } from '../ui/constants';

export class OutlookView {
  private bg!: Phaser.GameObjects.Image;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ctx: GameContext,
  ) {}

  build(): void {
    const { width, height } = this.scene.scale;
    this.bg = this.scene.add
      .image(width / 2, height / 2, `bg-${this.ctx.state.region}`)
      .setDepth(0);
    this.fitBackground();
  }

  setVisible(visible: boolean): void {
    this.bg.setVisible(visible);
  }

  applyRegionVisual(): void {
    const key = `bg-${this.ctx.state.region}`;
    if (this.scene.textures.exists(key)) this.bg.setTexture(key);
    this.fitBackground();
  }

  spawnBounds(): { x: number; y: number; w: number; h: number } {
    const h = this.scene.scale.height;
    return {
      x: 0,
      y: 100,
      w: this.scene.scale.width,
      h: h - NAV_H - 110,
    };
  }

  canCast(pointer: Phaser.Input.Pointer, ignoreCastUntil: number): boolean {
    if (this.scene.time.now < ignoreCastUntil) return false;
    if (pointer.y > this.scene.scale.height - NAV_H) return false;
    if (pointer.y < 100) return false;
    return !this.ctx.spawn.hits(pointer.x, pointer.y);
  }

  private fitBackground(): void {
    const { width, height } = this.scene.scale;
    const tex = this.scene.textures.get(this.bg.texture.key).getSourceImage() as {
      width: number;
      height: number;
    };
    if (!tex.width || !tex.height) return;
    const scale = Math.max(width / tex.width, (height - NAV_H) / tex.height);
    this.bg.setPosition(width / 2, (height - NAV_H) / 2);
    this.bg.setScale(scale);
  }
}
