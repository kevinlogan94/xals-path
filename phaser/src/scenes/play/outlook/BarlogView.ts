import Phaser from 'phaser';
import { NAV_H } from '../ui/constants';
import { createStoryBack, showButton } from '../ui/ImageButton';
import { QuoteBox } from '../xal/QuoteBox';

export class BarlogView {
  private root!: Phaser.GameObjects.Container;
  private backBtn!: Phaser.GameObjects.Container;
  private quoteBox: QuoteBox;
  private open = false;
  private inputReady = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onTap: () => void,
    private readonly onBack: () => void,
  ) {
    this.quoteBox = new QuoteBox(scene);
  }

  build(): void {
    const { width, height } = this.scene.scale;
    const playH = height - NAV_H;
    const portrait = this.scene.add.sprite(width / 2, playH / 2, 'barlog', 0);
    const fw = portrait.frame.width;
    const fh = portrait.frame.height;
    if (fw && fh) portrait.setScale(Math.max(width / fw, playH / fh));
    const tap = this.scene.add
      .rectangle(width / 2, playH / 2, width, playH, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    tap.on('pointerdown', () => {
      if (this.inputReady) this.onTap();
    });
    this.root = this.scene.add.container(0, 0, [portrait, tap]).setDepth(32).setVisible(false);
    this.backBtn = createStoryBack(this.scene, this.onBack, 34);
    this.quoteBox.build(33);
  }

  active(): boolean {
    return this.open;
  }

  begin(onReady: () => void): void {
    this.open = true;
    this.inputReady = false;
    this.quoteBox.hide();
    this.setBackVisible(false);
    this.root.setVisible(true).setAlpha(0);
    this.fade(1, () => {
      this.inputReady = true;
      onReady();
    });
  }

  showQuote(text: string): void {
    this.quoteBox.show(text);
  }

  setBackVisible(visible: boolean): void {
    showButton(this.backBtn, visible);
  }

  hide(): void {
    this.scene.tweens.killTweensOf(this.root);
    this.quoteBox.hide();
    this.setBackVisible(false);
    this.root.setVisible(false);
    this.open = false;
    this.inputReady = false;
  }

  fadeOut(onDone: () => void): void {
    this.inputReady = false;
    this.quoteBox.hide();
    this.setBackVisible(false);
    this.fade(0, () => {
      this.root.setVisible(false);
      this.open = false;
      onDone();
    });
  }

  private fade(alpha: number, onComplete: () => void): void {
    this.scene.tweens.killTweensOf(this.root);
    this.scene.tweens.add({ targets: this.root, alpha, duration: 500, onComplete });
  }
}
