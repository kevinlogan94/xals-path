import Phaser from 'phaser';
import { NAV_H } from '../ui/constants';
import { whiteText } from '../ui/textStyles';

export class QuoteBox {
  private container!: Phaser.GameObjects.Container;
  private text!: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {}

  build(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const boxH = 120;
    const y = h - NAV_H - boxH / 2 - 8;
    const bg = this.scene.textures.exists('ui-quote-box')
      ? this.scene.add.image(w / 2, y, 'ui-quote-box').setDisplaySize(w - 24, boxH)
      : this.scene.add
          .rectangle(w / 2, y, w - 24, boxH, 0x1a140c, 0.92)
          .setStrokeStyle(2, 0xc4a35a);
    this.text = this.scene.add
      .text(
        w / 2,
        y,
        '',
        whiteText('12px', {
          color: '#f3ead7',
          align: 'center',
          wordWrap: { width: w - 56 },
          strokeThickness: 2,
        }),
      )
      .setOrigin(0.5);
    this.container = this.scene.add
      .container(0, 0, [bg, this.text])
      .setDepth(22)
      .setVisible(false);
  }

  show(line: string): void {
    this.container.setVisible(true);
    this.text.setText(line);
  }

  hide(): void {
    this.container.setVisible(false);
  }
}
