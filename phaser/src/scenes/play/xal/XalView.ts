import Phaser from 'phaser';
import type { ChapterDef, RegionId } from '../../../types';
import { NAV_H } from '../ui/constants';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import { renderChapterCard } from './ChapterCard';
import { QuoteBox } from './QuoteBox';

export class XalView {
  private tapZone!: Phaser.GameObjects.Rectangle;
  private portrait!: Phaser.GameObjects.Image;
  private quoteBox: QuoteBox;
  private chapterCard!: Phaser.GameObjects.Container;
  private portalBar!: Phaser.GameObjects.Container;
  private onPortalTravel?: (region: RegionId) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onPortraitTap: () => void,
    private readonly onChapterButton: () => void,
  ) {
    this.quoteBox = new QuoteBox(scene);
  }

  build(): void {
    const { width, height } = this.scene.scale;
    const playH = height - NAV_H;
    // Full-scene tap target behind map UI + nav (depth order resolves hits).
    this.tapZone = this.scene.add
      .rectangle(width / 2, playH / 2, width, playH, 0x000000, 0)
      .setDepth(1)
      .setInteractive({ useHandCursor: true });
    this.tapZone.on('pointerdown', this.onPortraitTap);
    // Intentionally no Scene.png base — xal-* expressions are full tower scenes.
    this.portrait = this.scene.add
      .image(width / 2, playH / 2, 'xal-generic')
      .setDepth(2)
      .setVisible(false);
    this.fitPortrait();
    this.chapterCard = this.scene.add
      .container(width / 2, height - NAV_H - 120)
      .setDepth(22)
      .setVisible(false);
    this.portalBar = this.scene.add.container(width / 2, height - NAV_H - 36).setDepth(23).setVisible(false);
    this.quoteBox.build();
  }

  setPortalTravelHandler(handler: (region: RegionId) => void): void {
    this.onPortalTravel = handler;
  }

  setVisible(visible: boolean): void {
    this.tapZone.setVisible(visible);
    if (visible) this.tapZone.setInteractive({ useHandCursor: true });
    else this.tapZone.disableInteractive();
    this.portrait.setVisible(visible);
    if (!visible) this.portalBar.setVisible(false);
  }

  fitPortrait(): void {
    const { width, height } = this.scene.scale;
    const src = this.portrait.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    if (!src.width || !src.height) return;
    const playH = height - NAV_H;
    const scale = Math.max(width / src.width, playH / src.height);
    this.portrait.setScale(scale);
    this.portrait.setPosition(width / 2, playH / 2);
    this.tapZone.setPosition(width / 2, playH / 2);
    this.tapZone.setSize(width, playH);
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
    this.teardownChapterCard();
  }

  refreshChapterCard(chapter: ChapterDef | undefined, locked: boolean, visible: boolean): void {
    if (!visible) {
      this.teardownChapterCard();
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

  /** Portal region travel after story unlock (rehomed from Settings). */
  refreshPortalBar(unlocked: boolean, visible: boolean, current: RegionId): void {
    this.portalBar.removeAll(true);
    if (!unlocked || !visible) {
      this.portalBar.setVisible(false);
      return;
    }
    const regions: RegionId[] = ['meadow', 'river', 'altar'];
    const label = this.scene.add
      .text(0, -22, 'Portal', whiteText('7px', { color: '#c8b89a' }))
      .setOrigin(0.5);
    this.portalBar.add(label);
    regions.forEach((r, i) => {
      const x = (i - 1) * 108;
      const active = r === current;
      this.portalBar.add(
        createImageButton(
          this.scene,
          x,
          6,
          active ? 'ui-btn-green' : 'ui-btn-blue',
          r,
          96,
          28,
          active
            ? undefined
            : () => {
                this.onPortalTravel?.(r);
              },
          active ? 0.7 : 1,
          '6px',
        ),
      );
    });
    this.portalBar.setVisible(true);
  }

  private teardownChapterCard(): void {
    this.chapterCard.removeAll(true);
    this.chapterCard.disableInteractive();
    this.chapterCard.setVisible(false);
  }
}
