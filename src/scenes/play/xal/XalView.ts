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
  dormantCanvas: HTMLCanvasElement;
  vortexCanvas: HTMLCanvasElement;
  vortexCtx: CanvasRenderingContext2D;
  vortexImgData: ImageData;
  maskCanvas: HTMLCanvasElement;
}

let shimmerBuf: PortalShimmerBuffer | null = null;

function offscreenCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

/** Sample a clean 2-course brick tile directly from the tower wall in xal-generic. */
function buildDormantWallCanvas(src: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
  const [tx, ty, tw, th] = [890, 766, 243, 86];
  const [, tileCtx] = offscreenCanvas(tw, th);
  tileCtx.drawImage(src, tx, ty, tw, th, 0, 0, tw, th);
  const tilePx = tileCtx.getImageData(0, 0, tw, th).data;

  const [outCanvas, outCtx] = offscreenCanvas(PORTAL_W, PORTAL_H);
  const outImg = outCtx.createImageData(PORTAL_W, PORTAL_H);
  const dst = outImg.data;

  for (let y = 0; y < PORTAL_H; y++) {
    const syTile = (y + 4) % th;
    const xShift = Math.floor((y + 4) / th) % 2 === 1 ? 178 : 55;
    const dyEll = (y - 310) / 310;
    for (let x = 0; x < PORTAL_W; x++) {
      const rEll = Math.hypot((x - 171) / 171, dyEll);
      const rimShade = Math.max(0.45, 1 - Math.max(0, rEll - 0.62) * 0.95);
      const sp = (syTile * tw + ((x + xShift) % tw)) * 4;
      const dp = (y * PORTAL_W + x) * 4;
      dst[dp] = Math.round(tilePx[sp] * rimShade);
      dst[dp + 1] = Math.round(tilePx[sp + 1] * rimShade);
      dst[dp + 2] = Math.round(tilePx[sp + 2] * rimShade);
      dst[dp + 3] = 255;
    }
  }
  outCtx.putImageData(outImg, 0, 0);
  return outCanvas;
}

function buildPortalMask(px: Uint8ClampedArray): HTMLCanvasElement {
  const [maskCanvas, maskCtx] = offscreenCanvas(PORTAL_W, PORTAL_H);
  const maskImgData = maskCtx.createImageData(PORTAL_W, PORTAL_H);
  const mx = maskImgData.data;

  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 2] > px[i] + 30 && px[i + 2] > 56) mx.fill(255, i, i + 4);
  }
  // Fill dark interior pinholes unreachable from the patch borders.
  const total = PORTAL_W * PORTAL_H;
  const outside = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const seed = (idx: number) => {
    if (!mx[idx * 4 + 3] && !outside[idx]) {
      outside[idx] = 1;
      queue[tail++] = idx;
    }
  };
  for (let x = 0; x < PORTAL_W; x++) {
    seed(x);
    seed((PORTAL_H - 1) * PORTAL_W + x);
  }
  for (let y = 0; y < PORTAL_H; y++) {
    seed(y * PORTAL_W);
    seed(y * PORTAL_W + PORTAL_W - 1);
  }
  while (head < tail) {
    const cur = queue[head++];
    const x = cur % PORTAL_W;
    const y = Math.floor(cur / PORTAL_W);
    if (x > 0) seed(cur - 1);
    if (x + 1 < PORTAL_W) seed(cur + 1);
    if (y > 0) seed(cur - PORTAL_W);
    if (y + 1 < PORTAL_H) seed(cur + PORTAL_W);
  }
  for (let idx = 0; idx < total; idx++) {
    if (!outside[idx]) mx.fill(255, idx * 4, idx * 4 + 4);
  }
  maskCtx.putImageData(maskImgData, 0, 0);
  return maskCanvas;
}

function ensurePortalBuffer(scene: Phaser.Scene): PortalShimmerBuffer | null {
  if (shimmerBuf) return shimmerBuf;
  if (!scene.textures.exists('xal-generic')) return null;
  const src = scene.textures.get('xal-generic').getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  if (!src || !src.width) return null;

  const [patchCanvas, patchCtx] = offscreenCanvas(PORTAL_W, PORTAL_H);
  patchCtx.drawImage(src, PORTAL_X, PORTAL_Y, PORTAL_W, PORTAL_H, 0, 0, PORTAL_W, PORTAL_H);
  const px = patchCtx.getImageData(0, 0, PORTAL_W, PORTAL_H).data;

  const [, gridCtx] = offscreenCanvas(GRID_W, GRID_H);
  gridCtx.drawImage(patchCanvas, 0, 0, GRID_W, GRID_H);

  const [vortexCanvas, vortexCtx] = offscreenCanvas(GRID_W, GRID_H);
  shimmerBuf = {
    origGrid: gridCtx.getImageData(0, 0, GRID_W, GRID_H).data,
    dormantCanvas: buildDormantWallCanvas(src),
    vortexCanvas,
    vortexCtx,
    vortexImgData: vortexCtx.createImageData(GRID_W, GRID_H),
    maskCanvas: buildPortalMask(px),
  };
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
  private lastPortalUnlocked: boolean | null = null;
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

  /** Original-art liquid ripple when unlocked, or recessed tower brick wall when dormant. */
  tickPortal(timeMs: number, unlocked: boolean): void {
    if (!this.portal.visible && timeMs > 0) return;
    if (!unlocked && this.lastPortalUnlocked === false && timeMs > 0) return;
    const step = Math.floor(timeMs / 60);
    if (unlocked && this.lastPortalUnlocked === true && step === this.lastPortalStep && timeMs > 0) {
      return;
    }

    const buf = ensurePortalBuffer(this.scene);
    if (!buf || !this.portalTex) return;
    this.lastPortalStep = step;
    this.lastPortalUnlocked = unlocked;

    const { origGrid, dormantCanvas, vortexCanvas, vortexCtx, vortexImgData, maskCanvas } = buf;
    const ctx = this.portalTex.getContext();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, PORTAL_W, PORTAL_H);

    if (!unlocked) {
      ctx.drawImage(dormantCanvas, 0, 0, PORTAL_W, PORTAL_H);
    } else {
      const data = vortexImgData.data;
      const timeSec = timeMs / 1000;
      const speedMult = 1.2;
      const breath = Math.sin(timeSec * 2.6);
      const waveAmt = 1.35;

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
            (Math.max(0, spiralWave) * 0.24 + centerPulse) * Math.max(0, 1.0 - rEll * 0.45);

          data[ptr] = Math.min(255, Math.round(r * (1 - boost * 0.3)));
          data[ptr + 1] = Math.min(255, Math.round(g + boost * 85));
          data[ptr + 2] = Math.min(255, Math.round(b + boost * 55));
          data[ptr + 3] = 255;
          ptr += 4;
        }
      }
      vortexCtx.putImageData(vortexImgData, 0, 0);
      ctx.drawImage(vortexCanvas, 0, 0, PORTAL_W, PORTAL_H);
    }

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
