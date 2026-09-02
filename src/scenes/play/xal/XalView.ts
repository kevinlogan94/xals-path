import Phaser from 'phaser';
import type { ChapterDef, RegionId } from '../../../types';
import { NAV_H } from '../ui/constants';
import { createImageButton, createStoryBack, showButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import { renderChapterCard } from './ChapterCard';
import { QuoteBox } from './QuoteBox';

const IDLE_SHEET = 'xal-idle-sheet';
const BOOK_SHEET = 'xal-book-sheet';
const IDLE_ANIM = 'xal-idle';
const BOOK_TURN = 'xal-book-turn';
const SCENE_W = 1344;
const SCENE_H = 3072;
// Overlay origins in the remaster 1344×3072 scene (template-matched).
const IDLE_X = 304;
const IDLE_Y = 1520;
const IDLE_W = 730;
const IDLE_H = 677;
const BOOK_X = 425;
const BOOK_Y = 1880;
const BOOK_W = 750;
const BOOK_H = 500;
const BOOK_SX = 0.66;
// Same 12-beat loop as the eyes: scan, then turn the page.
const BOOK_IDLE_FRAMES = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6];

function ensureXalAnims(scene: Phaser.Scene): void {
  const idleTex = scene.textures.get(IDLE_SHEET);
  if (!idleTex.has('idle-0')) {
    for (let i = 0; i < 12; i++) idleTex.add(`idle-${i}`, 0, 90 + i * 920, 24, IDLE_W, IDLE_H);
  }
  const bookTex = scene.textures.get(BOOK_SHEET);
  if (!bookTex.has('book-0')) {
    for (let i = 0; i < 7; i++) bookTex.add(`book-${i}`, 0, i * BOOK_W, 0, BOOK_W, BOOK_H);
  }
  if (!scene.anims.exists(IDLE_ANIM)) {
    scene.anims.create({
      key: IDLE_ANIM,
      frames: Array.from({ length: 12 }, (_, i) => ({ key: IDLE_SHEET, frame: `idle-${i}` })),
      frameRate: 6,
      repeat: -1,
    });
  }
  if (!scene.anims.exists(BOOK_TURN)) {
    scene.anims.create({
      key: BOOK_TURN,
      frames: BOOK_IDLE_FRAMES.map((i) => ({ key: BOOK_SHEET, frame: `book-${i}` })),
      frameRate: 6,
      repeat: -1,
    });
  }
}

export class XalView {
  private tapZone!: Phaser.GameObjects.Rectangle;
  private portrait!: Phaser.GameObjects.Image;
  private idle!: Phaser.GameObjects.Sprite;
  private book!: Phaser.GameObjects.Sprite;
  private quoteBox: QuoteBox;
  private chapterCard!: Phaser.GameObjects.Container;
  private portalBar!: Phaser.GameObjects.Container;
  private backBtn!: Phaser.GameObjects.Container;
  private onPortalTravel?: (region: RegionId) => void;
  private quoteOpen = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onPortraitTap: () => void,
    private readonly onChapterButton: () => void,
    private readonly onStoryBack: () => void,
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
    ensureXalAnims(this.scene);
    this.book = this.scene.add
      .sprite(width / 2, playH / 2, BOOK_SHEET, 'book-0')
      // Flip rises into the idle torso; book has to paint over that overlay.
      .setDepth(5)
      .setOrigin(0)
      .setVisible(false);
    this.idle = this.scene.add
      .sprite(width / 2, playH / 2, IDLE_SHEET, 'idle-0')
      .setDepth(4)
      .setOrigin(0)
      .setVisible(false);
    this.fitPortrait();
    this.chapterCard = this.scene.add
      .container(width / 2, height - NAV_H - 120)
      .setDepth(22)
      .setVisible(false);
    this.portalBar = this.scene.add.container(width / 2, height - NAV_H - 36).setDepth(23).setVisible(false);
    this.backBtn = createStoryBack(this.scene, this.onStoryBack, 24);
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
    if (!visible) {
      this.stopIdle();
      this.book.setVisible(false);
      this.portalBar.setVisible(false);
      this.setBackVisible(false);
    } else if (!this.quoteOpen) {
      this.playIdle();
    }
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
    const left = width / 2 - (SCENE_W * scale) / 2;
    const top = playH / 2 - (SCENE_H * scale) / 2;
    this.idle.setScale(scale).setPosition(left + IDLE_X * scale, top + IDLE_Y * scale);
    this.book
      .setScale(scale * BOOK_SX, scale)
      .setPosition(left + BOOK_X * scale, top + BOOK_Y * scale);
    this.tapZone.setPosition(width / 2, playH / 2);
    this.tapZone.setSize(width, playH);
  }

  setPortraitExpression(expr: string): void {
    if (!this.quoteOpen && (expr === 'generic' || expr === 'genericDown')) {
      this.playIdle();
      return;
    }
    this.stopIdle();
    const key = `xal-${expr}`;
    this.portrait.setTexture(this.scene.textures.exists(key) ? key : 'xal-generic');
    this.fitPortrait();
    this.sitBook();
  }

  showQuote(text: string): void {
    this.quoteOpen = true;
    this.quoteBox.show(text);
  }

  hideQuote(): void {
    this.quoteOpen = false;
    this.quoteBox.hide();
    this.setBackVisible(false);
    if (this.portrait.visible) this.playIdle();
  }

  private playIdle(): void {
    if (!this.scene.textures.exists(IDLE_SHEET) || !this.scene.textures.exists(BOOK_SHEET)) return;
    this.portrait.setTexture('xal-genericDown');
    this.fitPortrait();
    this.idle.setVisible(true).play(IDLE_ANIM, true);
    this.book.setVisible(true).play(BOOK_TURN, true);
  }

  private stopIdle(): void {
    this.idle.stop();
    this.idle.setVisible(false);
    this.book.stop();
  }

  private sitBook(): void {
    if (!this.portrait.visible) return;
    this.book.setVisible(true).stop().setFrame('book-0');
  }

  setBackVisible(visible: boolean): void {
    showButton(this.backBtn, visible);
  }

  quoteVisible(): boolean {
    return this.quoteOpen;
  }

  hideChapterCard(): void {
    this.teardownChapterCard();
  }

  chapterCardCenter(): { x: number; y: number } {
    const m = this.chapterCard.getWorldTransformMatrix();
    return { x: m.tx, y: m.ty };
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
    this.chapterCard.removeInteractive();
    this.chapterCard.setVisible(false);
  }
}
