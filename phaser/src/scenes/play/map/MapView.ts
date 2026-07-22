import Phaser from 'phaser';
import type { ChapterDef } from '../../../types';
import { NAV_H } from '../ui/constants';
import { renderChapterCard } from './ChapterCard';
import { QuoteBox } from './QuoteBox';

export class MapView {
  private portrait!: Phaser.GameObjects.Image;
  private quoteBox: QuoteBox;
  private chapterCard!: Phaser.GameObjects.Container;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onPortraitTap: () => void,
    private readonly onChapterButton: () => void,
  ) {
    this.quoteBox = new QuoteBox(scene);
  }

  build(): void {
    const { width, height } = this.scene.scale;
    this.portrait = this.scene.add
      .image(width / 2, (height - NAV_H) / 2, 'xal-generic')
      .setDepth(2)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.fitPortrait();
    this.portrait.on('pointerdown', this.onPortraitTap);
    this.chapterCard = this.scene.add
      .container(width / 2, height - NAV_H - 110)
      .setDepth(22)
      .setVisible(false);
    this.quoteBox.build();
  }

  setVisible(visible: boolean): void {
    this.portrait.setVisible(visible);
  }

  fitPortrait(): void {
    const { width, height } = this.scene.scale;
    const src = this.portrait.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    if (!src.width || !src.height) return;
    // Cover the playfield above the nav - Xal PNGs are full tower scenes.
    const playH = height - NAV_H;
    const scale = Math.max(width / src.width, playH / src.height);
    this.portrait.setScale(scale);
    this.portrait.setPosition(width / 2, playH / 2);
    this.portrait.setInteractive(
      new Phaser.Geom.Rectangle(
        -width / (2 * scale),
        -playH / (2 * scale),
        width / scale,
        playH / scale,
      ),
      Phaser.Geom.Rectangle.Contains,
    );
  }

  setPortraitExpression(expr: string): void {
    const key = `xal-${expr}`;
    this.portrait.setTexture(this.scene.textures.exists(key) ? key : 'xal-generic');
    this.fitPortrait();
  }

  showQuote(text: string): void {
    this.quoteBox.show(text);
  }

  hideQuote(): void {
    this.quoteBox.hide();
  }

  hideChapterCard(): void {
    this.chapterCard.setVisible(false);
  }

  refreshChapterCard(chapter: ChapterDef | undefined, locked: boolean, visible: boolean): void {
    if (!visible) {
      this.chapterCard.setVisible(false);
      return;
    }
    renderChapterCard({
      scene: this.scene,
      container: this.chapterCard,
      chapter,
      locked,
      onClick: this.onChapterButton,
    });
  }
}
