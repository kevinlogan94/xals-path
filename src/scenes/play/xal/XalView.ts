import Phaser from 'phaser';
import { NAV_H } from '../ui/constants';
import { QuoteBox } from './QuoteBox';

const IDLE_SHEET = 'xal-idle-sheet';
const BOOK_SHEET = 'xal-book-sheet';
const PORTAL_TEX = 'xal-portal-shimmer';
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
const PORTAL_X = 945;
const PORTAL_Y = 1372;
const PORTAL_W = 343;
const PORTAL_H = 621;
const GRID_W = 69;
const GRID_H = 125;
// Same 12-beat loop as the eyes: scan, then turn the page.
const BOOK_IDLE_FRAMES = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6];

interface PortalShimmerBuffer {
  origGrid: Uint8ClampedArray;
  vortexCanvas: HTMLCanvasElement;
  vortexCtx: CanvasRenderingContext2D;
  vortexImgData: ImageData;
  maskCanvas: HTMLCanvasElement;
}

let shimmerBuf: PortalShimmerBuffer | null = null;

function ensurePortalBuffer(scene: Phaser.Scene): PortalShimmerBuffer | null {
  if (shimmerBuf) return shimmerBuf;
  if (!scene.textures.exists('xal-generic')) return null;
  const src = scene.textures.get('xal-generic').getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  if (!src || !src.width) return null;

  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = PORTAL_W;
  patchCanvas.height = PORTAL_H;
  const patchCtx = patchCanvas.getContext('2d')!;
  patchCtx.imageSmoothingEnabled = false;
  patchCtx.drawImage(src, PORTAL_X, PORTAL_Y, PORTAL_W, PORTAL_H, 0, 0, PORTAL_W, PORTAL_H);
  const patchData = patchCtx.getImageData(0, 0, PORTAL_W, PORTAL_H);
  const px = patchData.data;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = PORTAL_W;
  maskCanvas.height = PORTAL_H;
  const maskCtx = maskCanvas.getContext('2d')!;
  const maskImgData = maskCtx.createImageData(PORTAL_W, PORTAL_H);
  const mx = maskImgData.data;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const b = px[i + 2];
    if (b > r + 30 && b > 56) {
      mx[i] = 255;
      mx[i + 1] = 255;
      mx[i + 2] = 255;
      mx[i + 3] = 255;
    }
  }
  maskCtx.putImageData(maskImgData, 0, 0);

  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = GRID_W;
  gridCanvas.height = GRID_H;
  const gridCtx = gridCanvas.getContext('2d')!;
  gridCtx.imageSmoothingEnabled = false;
  gridCtx.drawImage(patchCanvas, 0, 0, GRID_W, GRID_H);
  const origGrid = gridCtx.getImageData(0, 0, GRID_W, GRID_H).data;

  const vortexCanvas = document.createElement('canvas');
  vortexCanvas.width = GRID_W;
  vortexCanvas.height = GRID_H;
  const vortexCtx = vortexCanvas.getContext('2d')!;
  const vortexImgData = vortexCtx.createImageData(GRID_W, GRID_H);

  shimmerBuf = { origGrid, vortexCanvas, vortexCtx, vortexImgData, maskCanvas };
  return shimmerBuf;
}

function ensureXalAnims(scene: Phaser.Scene): void {
  const idleTex = scene.textures.get(IDLE_SHEET);
  if (!idleTex.has('idle-0')) {
    for (let i = 0; i < 12; i++) idleTex.add(`idle-${i}`, 0, (i % 4) * IDLE_W, Math.floor(i / 4) * IDLE_H, IDLE_W, IDLE_H);
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
  private portal!: Phaser.GameObjects.Image;
  private portalTex: Phaser.Textures.CanvasTexture | null = null;
  private lastPortalStep = -1;
  private idle!: Phaser.GameObjects.Sprite;
  private book!: Phaser.GameObjects.Sprite;
  private quoteBox: QuoteBox;
  private quoteOpen = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onPortraitTap: (pointer: Phaser.Input.Pointer) => void,
  ) {
    this.quoteBox = new QuoteBox(scene);
  }

  build(): void {
    const { width, height } = this.scene.scale;
    const playH = height - NAV_H;
    this.tapZone = this.scene.add
      .rectangle(width / 2, playH / 2, width, playH, 0x000000, 0)
      .setDepth(1)
      .setInteractive({ useHandCursor: true });
    this.tapZone.on('pointerdown', this.onPortraitTap);
    // Intentionally no Scene.png base — xal-* expressions are full tower scenes.
    this.portrait = this.scene.add
      .image(width / 2, height / 2, 'xal-generic')
      .setDepth(2)
      .setVisible(false);
    ensureXalAnims(this.scene);
    this.portalTex = this.scene.textures.exists(PORTAL_TEX)
      ? (this.scene.textures.get(PORTAL_TEX) as Phaser.Textures.CanvasTexture)
      : this.scene.textures.createCanvas(PORTAL_TEX, PORTAL_W, PORTAL_H);
    this.portal = this.scene.add
      .image(width / 2, height / 2, PORTAL_TEX)
      .setDepth(3)
      .setOrigin(0)
      .setVisible(false);
    this.book = this.scene.add
      .sprite(width / 2, height / 2, BOOK_SHEET, 'book-0')
      // Flip rises into the idle torso; book has to paint over that overlay.
      .setDepth(5)
      .setOrigin(0)
      .setVisible(false);
    this.idle = this.scene.add
      .sprite(width / 2, height / 2, IDLE_SHEET, 'idle-0')
      .setDepth(4)
      .setOrigin(0)
      .setVisible(false);
    this.fitPortrait();
    this.tickPortal(0, false);
    this.quoteBox.build();
  }

  setVisible(visible: boolean): void {
    this.tapZone.setVisible(visible);
    if (visible) this.tapZone.setInteractive({ useHandCursor: true });
    else this.tapZone.disableInteractive();
    this.portrait.setVisible(visible);
    this.portal.setVisible(visible);
    if (!visible) {
      this.stopIdle();
      this.book.setVisible(false);
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
    const scale = Math.max(width / src.width, height / src.height);
    this.portrait.setScale(scale);
    this.portrait.setPosition(width / 2, height / 2);
    const left = width / 2 - (SCENE_W * scale) / 2;
    const top = height / 2 - (SCENE_H * scale) / 2;
    this.portal.setScale(scale).setPosition(left + PORTAL_X * scale, top + PORTAL_Y * scale);
    this.idle.setScale(scale).setPosition(left + IDLE_X * scale, top + IDLE_Y * scale);
    this.book
      .setScale(scale * BOOK_SX, scale)
      .setPosition(left + BOOK_X * scale, top + BOOK_Y * scale);
    const playH = height - NAV_H;
    this.tapZone.setPosition(width / 2, playH / 2);
    this.tapZone.setSize(width, playH);
  }

  /** Original-art liquid ripple + inward spiral highlight pulse inside the exact portal mask. */
  tickPortal(timeMs: number, unlocked: boolean): void {
    if (!this.portal.visible && timeMs > 0) return;
    const step = Math.floor(timeMs / 60);
    if (step === this.lastPortalStep && timeMs > 0) return;
    this.lastPortalStep = step;

    const buf = ensurePortalBuffer(this.scene);
    if (!buf || !this.portalTex) return;

    const timeSec = timeMs / 1000;
    const speedMult = unlocked ? 1.2 : 0.65;
    const breath = Math.sin(timeSec * (unlocked ? 2.6 : 1.6));
    const waveAmt = unlocked ? 1.35 : 0.85;
    const { origGrid, vortexCanvas, vortexCtx, vortexImgData, maskCanvas } = buf;
    const data = vortexImgData.data;

    const cx = 33.4;
    const cy = 60.6;
    const rx = 34.2;
    const ry = 62.0;

    let ptr = 0;
    for (let gy = 0; gy < GRID_H; gy++) {
      const dy = gy - cy;
      const dyEll = (gy - 62.0) / ry;
      for (let gx = 0; gx < GRID_W; gx++) {
        const dx = gx - cx;
        const dxEll = (gx - 34.2) / rx;
        const rEll = Math.hypot(dxEll, dyEll);
        const theta = Math.atan2(dy / (rx * 1.15), dx / rx);

        const damp = Math.max(0, 1 - rEll * 0.5);
        const ox = Math.round(gx + Math.sin(gy * 0.22 - timeSec * 2.4 * speedMult) * waveAmt * damp);
        const oy = Math.round(gy + Math.cos(gx * 0.22 - timeSec * 2.0 * speedMult) * waveAmt * damp);
        const sx = Math.max(0, Math.min(GRID_W - 1, ox));
        const sy = Math.max(0, Math.min(GRID_H - 1, oy));
        const sPtr = (sy * GRID_W + sx) * 4;

        const r = origGrid[sPtr];
        const g = origGrid[sPtr + 1];
        const b = origGrid[sPtr + 2];

        const spiralWave = Math.sin(theta - rEll * 14.0 - timeSec * 2.8 * speedMult);
        const centerPulse = (1.0 - Math.min(1.0, rEll)) * (0.12 + 0.12 * breath);
        const boost =
          (Math.max(0, spiralWave) * (unlocked ? 0.24 : 0.14) + centerPulse) *
          Math.max(0, 1.0 - rEll * 0.45);

        data[ptr] = Math.min(255, Math.round(r * (1 - boost * 0.3)));
        data[ptr + 1] = Math.min(255, Math.round(g + boost * 85));
        data[ptr + 2] = Math.min(255, Math.round(b + boost * 55));
        data[ptr + 3] = 255;
        ptr += 4;
      }
    }

    vortexCtx.putImageData(vortexImgData, 0, 0);

    const ctx = this.portalTex.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, PORTAL_W, PORTAL_H);
    ctx.drawImage(vortexCanvas, 0, 0, PORTAL_W, PORTAL_H);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0, PORTAL_W, PORTAL_H);
    this.portalTex.refresh();
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

  quoteVisible(): boolean {
    return this.quoteOpen;
  }
}
