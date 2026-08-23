import Phaser from 'phaser';
import { NAV_H } from '../ui/constants';
import { darkText } from '../ui/textStyles';

const QUOTE_PAD_X = 24;
const QUOTE_ASPECT = 300 / 460;
/** Just above Xal's head — bubble tail points down toward him. */
const QUOTE_Y_RATIO = 0.36;

export class QuoteBox {
  private container!: Phaser.GameObjects.Container;
  private text!: Phaser.GameObjects.Text;
  private bubbleY = 0;
  private boxH = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  build(depth = 22): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const playH = h - NAV_H;
    const boxW = w - QUOTE_PAD_X;
    const boxH = Math.min(Math.round(boxW * QUOTE_ASPECT), 132);
    const y = playH * QUOTE_Y_RATIO;
    const textWrap = boxW - 64;
    this.bubbleY = y;
    this.boxH = boxH;
    const bg = this.scene.textures.exists('ui-quote-box')
      ? this.scene.add.image(w / 2, y, 'ui-quote-box').setDisplaySize(boxW, boxH)
      : this.scene.add
          .rectangle(w / 2, y, boxW, boxH, 0x1a140c, 0.92)
          .setStrokeStyle(2, 0xc4a35a);
    this.text = this.scene.add
      .text(
        w / 2,
        y,
        '',
        darkText('10px', undefined, {
          align: 'center',
          wordWrap: { width: textWrap },
        }),
      )
      .setOrigin(0.5);
    this.container = this.scene.add
      .container(0, 0, [bg, this.text])
      .setDepth(depth)
      .setVisible(false);
  }

  show(line: string): void {
    this.container.setVisible(true);
    this.text.setText(line);
    this.layoutText();
  }

  /** Center copy in the bubble body (above the tail). */
  private layoutText(): void {
    const bodyTop = this.bubbleY - this.boxH * 0.36;
    const bodyBottom = this.bubbleY + this.boxH * 0.04;
    this.text.setY((bodyTop + bodyBottom) / 2);
  }

  hide(): void {
    this.container.setVisible(false);
  }
}
