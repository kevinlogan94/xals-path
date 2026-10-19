import Phaser from 'phaser';
import helpersData from '../data/helpers.json';
import { version } from '../../package.json';
import { getContext } from '../game/GameContext';
import { preloadCreatureMagic } from './play/outlook/creatureMagic';
import { preloadCreatureSplashAssets } from './play/splash/creatureSplash';
import { wordmarkText } from './play/ui/textStyles';
import type { HelperDef } from '../types';

const TITLE = "Xal's Path";
const PAD = 24;
const ALTAR = 130;

type Mote = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
  color: number;
};

export class TitleScene extends Phaser.Scene {
  private phase: 'loading' | 'ready' | 'leaving' = 'loading';
  private backdrop?: Phaser.GameObjects.Image;
  private motesGfx!: Phaser.GameObjects.Graphics;
  private motes: Mote[] = [];
  private titleRoot!: Phaser.GameObjects.Container;
  private version!: Phaser.GameObjects.Text;
  private footer!: Phaser.GameObjects.Container;
  private loadUi?: Phaser.GameObjects.Container;
  private loadFill?: Phaser.GameObjects.Rectangle;
  private loadTrackW = 160;
  private altar?: Phaser.GameObjects.Container;
  private nodeImage?: Phaser.GameObjects.Image;
  private glyph?: Phaser.GameObjects.Graphics;
  private outerRing?: Phaser.GameObjects.Graphics;
  private innerRing?: Phaser.GameObjects.Graphics;
  private prompt?: Phaser.GameObjects.Text;
  private veil?: Phaser.GameObjects.Rectangle;

  constructor() {
    super('Title');
  }

  preload(): void {
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
    });

    this.paintBackdrop();
    this.motesGfx = this.add.graphics().setDepth(2);
    this.seedMotes();
    paintNode(this, 'title-node-green', false);
    paintNode(this, 'title-node-amber', true);
    this.buildChrome();
    this.showLoading();

    this.load.on('progress', (p: number) => {
      if (!this.loadFill) return;
      this.loadFill.width = Math.max(2, this.loadTrackW * p);
    });

    queueGameAssets(this.load);
  }

  create(): void {
    this.phase = 'ready';
    this.loadUi?.destroy(true);
    this.loadUi = undefined;
    this.loadFill = undefined;
    this.showAltar();

    const audio = getContext().audio;
    audio.attach(this);
    audio.playBgm('xals-theme');
    this.input.on('pointerup', () => {
      audio.playBgm('xals-theme');
      this.closeTitle();
    });
  }

  update(_time: number, delta: number): void {
    const { width, height } = this.scale;
    const step = delta / 16.667;
    const g = this.motesGfx;
    g.clear();
    for (const p of this.motes) {
      p.y += p.vy * step;
      p.x += p.vx * step;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      g.fillStyle(p.color, p.alpha);
      g.fillCircle(p.x, p.y, p.r);
    }

    if (this.outerRing && this.innerRing && this.glyph && this.prompt && this.phase !== 'loading') {
      this.outerRing.angle = (this.time.now / 25000) * 360;
      this.innerRing.angle = -(this.time.now / 18000) * 360;
      const breath = (Math.sin((this.time.now / 2500) * Math.PI * 2) + 1) / 2;
      this.glyph.setScale(0.8 + breath * 0.3);
      this.glyph.setAngle(breath * 45);
      this.glyph.setAlpha(0.8 + breath * 0.2);
      const pulse = (Math.sin((this.time.now / 2200) * Math.PI * 2) + 1) / 2;
      this.prompt.setAlpha(0.45 + pulse * 0.45);
      this.prompt.setScale(0.98 + pulse * 0.04);
    }
  }

  private onResize = (): void => {
    this.paintBackdrop();
    this.layout();
  };

  private paintBackdrop(): void {
    const { width, height } = this.scale;
    const w = Math.max(2, Math.ceil(width));
    const h = Math.max(2, Math.ceil(height));
    if (!this.backdrop) {
      const tex = this.textures.createCanvas('title-backdrop', w, h);
      if (!tex) return;
      const ctx = tex.context;
      const fade = ctx.createLinearGradient(0, 0, 0, h);
      fade.addColorStop(0, '#09050e');
      fade.addColorStop(1, '#060e0a');
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.75);
      glow.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
      glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.03)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      tex.refresh();
      this.backdrop = this.add.image(w / 2, h / 2, 'title-backdrop').setDepth(0);
    }
    this.backdrop.setPosition(width / 2, height / 2).setDisplaySize(width, height);
  }

  private seedMotes(): void {
    const { width, height } = this.scale;
    this.motes = [];
    for (let i = 0; i < 30; i++) {
      this.motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.5,
        vy: -(Math.random() * 0.4 + 0.1),
        vx: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.45 ? 0x10b981 : 0xf59e0b,
      });
    }
  }

  private buildChrome(): void {
    const glow = this.add
      .text(0, 0, TITLE, wordmarkText('44px', 'rgba(0,0,0,0)'))
      .setOrigin(0.5)
      .setShadow(0, 0, 'rgba(16,185,129,0.35)', 16, true, true);
    const face = this.add
      .text(0, 0, TITLE, wordmarkText('44px', '#ffffff'))
      .setOrigin(0.5)
      .setShadow(0, 4, 'rgba(0,0,0,0.9)', 20, true, true);
    this.titleRoot = this.add.container(0, 0, [glow, face]).setDepth(10);

    this.version = this.add
      .text(0, 0, `v${version}`, {
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '11px',
        fontStyle: '500',
        color: 'rgba(16, 185, 129, 0.45)',
        letterSpacing: 1.6,
      })
      .setOrigin(1, 0)
      .setDepth(10);

    const star = this.add
      .text(0, 0, '✦', { fontSize: '14px', color: '#f59e0b' })
      .setOrigin(0.5)
      .setAlpha(0.18);
    const line = (x: number) => this.add.rectangle(x, 0, 32, 1, 0xf59e0b, 0.18);
    const gap = star.width / 2 + 12 + 16;
    this.footer = this.add.container(0, 0, [line(-gap), star, line(gap)]).setDepth(10);
    this.layout();
  }

  private showLoading(): void {
    const barW = Math.min(160, this.scale.width - 80);
    this.loadTrackW = barW;
    const track = this.add.rectangle(0, 0, barW, 2, 0x10b981, 0.28);
    this.loadFill = this.add.rectangle(-barW / 2, 0, 2, 2, 0x10b981, 0.9).setOrigin(0, 0.5);
    const label = this.add
      .text(0, 78, 'Opening the way', promptStyle())
      .setOrigin(0.5)
      .setAlpha(0.7);
    this.loadUi = this.add.container(0, 0, [track, this.loadFill, label]).setDepth(10);
    this.layout();
  }

  private showAltar(): void {
    const outer = this.add.graphics();
    dashedRing(outer, 65, 0x10b981, 0.4);
    const inner = this.add.graphics();
    inner.lineStyle(1.5, 0xf59e0b, 0.25);
    inner.strokeCircle(0, 0, 53);

    const node = this.add.image(0, 0, 'title-node-green').setDisplaySize(110, 110);
    const glyph = this.add.graphics();
    paintGlyph(glyph, 0xf59e0b);
    const nodeWrap = this.add.container(0, 0, [node, glyph]);

    const altar = this.add.container(0, 0, [outer, inner, nodeWrap]).setDepth(10);
    altar.setInteractive(
      new Phaser.Geom.Circle(0, 0, 65),
      Phaser.Geom.Circle.Contains,
    );
    altar.input!.cursor = 'pointer';
    altar.on('pointerover', () => this.setAltarHot(true));
    altar.on('pointerout', () => {
      this.setAltarHot(false);
      nodeWrap.setScale(1);
    });
    altar.on('pointerdown', () => nodeWrap.setScale(0.94));
    altar.on('pointerup', () => nodeWrap.setScale(1));

    const prompt = this.add
      .text(0, 0, 'TAP TO PASS THE BARRIER', promptStyle())
      .setOrigin(0.5)
      .setDepth(10);

    this.outerRing = outer;
    this.innerRing = inner;
    this.nodeImage = node;
    this.glyph = glyph;
    this.altar = altar;
    this.prompt = prompt;
    this.layout();
  }

  private setAltarHot(hot: boolean): void {
    this.nodeImage?.setTexture(hot ? 'title-node-amber' : 'title-node-green');
    if (this.glyph) paintGlyph(this.glyph, hot ? 0xffffff : 0xf59e0b);
  }

  private layout(): void {
    const { width, height } = this.scale;
    const maxW = width - 48;
    const raw = this.titleRoot.list[1] as Phaser.GameObjects.Text;
    const scale = Math.min(1, maxW / raw.width);
    this.titleRoot.setScale(scale);

    const titleH = raw.height * scale;
    const promptH = this.prompt?.height ?? this.loadUi?.height ?? 20;
    const block = titleH + 60 + ALTAR + 24 + promptH;
    const free = Math.max(0, height - PAD * 2 - 28 - block);
    const titleY = PAD + 14 + free / 2 + titleH / 2;
    const altarY = titleY + titleH / 2 + 60 + ALTAR / 2;
    const promptY = altarY + ALTAR / 2 + 24 + (this.prompt?.height ?? 20) / 2;

    this.version.setPosition(width - PAD, PAD);
    this.titleRoot.setPosition(width / 2, titleY);
    this.footer.setPosition(width / 2, height - PAD);
    this.altar?.setPosition(width / 2, altarY);
    this.loadUi?.setPosition(width / 2, altarY);
    this.prompt?.setPosition(width / 2, promptY);
    if (this.veil) {
      this.veil.setPosition(width / 2, height / 2);
      this.veil.setSize(width, height);
    }
  }

  private closeTitle(): void {
    if (this.phase !== 'ready') return;
    this.phase = 'leaving';
    const { width, height } = this.scale;
    this.veil = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 1)
      .setAlpha(0)
      .setDepth(100);
    this.tweens.add({
      targets: this.veil,
      alpha: 1,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => this.scene.start('Play'),
    });
  }
}

function promptStyle(): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '16px',
    fontStyle: 'italic 600',
    color: 'rgba(214, 211, 209, 0.75)',
    letterSpacing: 2,
    align: 'center',
  };
}

function paintGlyph(g: Phaser.GameObjects.Graphics, color: number): void {
  g.clear();
  g.fillStyle(color, 1);
  g.fillPoints(
    [
      new Phaser.Geom.Point(0, -9),
      new Phaser.Geom.Point(9, 0),
      new Phaser.Geom.Point(0, 9),
      new Phaser.Geom.Point(-9, 0),
    ],
    true,
  );
}

function dashedRing(g: Phaser.GameObjects.Graphics, radius: number, color: number, alpha: number): void {
  g.lineStyle(1, color, alpha);
  const circ = Math.PI * 2 * radius;
  const dash = 7;
  const gap = 6;
  const step = dash + gap;
  const count = Math.floor(circ / step);
  const dashAngle = (dash / circ) * Math.PI * 2;
  const stepAngle = (step / circ) * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const a0 = i * stepAngle;
    g.beginPath();
    g.arc(0, 0, radius, a0, a0 + dashAngle, false);
    g.strokePath();
  }
}

function paintNode(scene: Phaser.Scene, key: string, amber: boolean): void {
  const size = 220;
  const tex = scene.textures.createCanvas(key, size, size);
  if (!tex) return;
  const ctx = tex.context;
  const c = size / 2;
  const radius = 70;
  const g = ctx.createRadialGradient(c, c, 0, c, c, radius);
  if (amber) {
    g.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
    g.addColorStop(0.7, 'rgb(120, 53, 4)');
    g.addColorStop(1, '#1e0700');
  } else {
    g.addColorStop(0, 'rgba(16, 185, 129, 0.6)');
    g.addColorStop(0.7, 'rgba(6, 78, 59, 0.8)');
    g.addColorStop(1, '#041d14');
  }
  ctx.shadowColor = amber ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.4)';
  ctx.shadowBlur = 36;
  ctx.beginPath();
  ctx.arc(c, c, radius, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = amber ? 'rgba(245, 158, 11, 0.8)' : 'rgba(16, 185, 129, 0.6)';
  ctx.stroke();
  tex.refresh();
}

function queueGameAssets(load: Phaser.Loader.LoaderPlugin): void {
  load.image('bg-meadow', 'assets/backgrounds/meadow.png');
  load.image('bg-river', 'assets/backgrounds/river.png');
  load.image('bg-altar', 'assets/backgrounds/altar.png');

  const exprs: Record<string, string> = {
    generic: 'xal_generic.png',
    genericDown: 'xal_generic_down.png',
    happy: 'xal_happy.png',
    angry: 'xal_mad.png',
    sad: 'xal_sad.png',
    sadSide: 'xal_sad_side.png',
    shocked: 'xal_shocked.png',
    shockedSide: 'xal_shocked_side.png',
    shockedDown: 'xal_shocked_side.png',
  };
  for (const [key, file] of Object.entries(exprs)) {
    load.image(`xal-${key}`, `assets/xal/${file}`);
  }
  load.image('xal-idle-sheet', 'assets/xal/xal_idle_animation.png');
  load.image('xal-book-sheet', 'assets/xal/xal_book_animation.png');
  load.spritesheet('barlog', 'assets/characters/barlog.png', {
    frameWidth: 532,
    frameHeight: 600,
  });

  preloadCreatureSplashAssets(load);
  preloadCreatureMagic(load);
  load.spritesheet('pegasus', 'assets/creatures/pegasus-animation.png', {
    frameWidth: 464,
    frameHeight: 228,
  });
  load.image('ui-cloud', 'assets/ui/clouds/cloud.png');
  load.image('ui-level-cloud', 'assets/ui/clouds/LevelCloud.png');
  load.image('ui-square-cloud', 'assets/ui/clouds/squareCloud.png');
  load.image('ui-quote-box', 'assets/ui/QuoteBox.png');
  load.image('ui-mana-icon', 'assets/ui/manaIcon.png');
  load.image('ui-btn-green', 'assets/ui/buttons/greenButton.png');
  load.image('ui-btn-blue', 'assets/ui/buttons/blueButton.png');
  load.image('ui-btn-orange', 'assets/ui/buttons/OrangeButton.png');
  load.image('ui-influence', 'assets/ui/influence.png');
  load.image('ui-pointer', 'assets/ui/pointer.png');
  load.image('ui-reward-star', 'assets/ui/reward-star.png');
  load.image('ui-reward-shop', 'assets/ui/reward-shop.png');
  load.image('ui-reward-notepad', 'assets/ui/reward-notepad.png');
  load.image('ui-reward-portal', 'assets/ui/reward-portal.png');
  load.image('ui-reward-trophy', 'assets/ui/reward-trophy.png');
  for (const h of helpersData.helpers as HelperDef[]) {
    load.image(`tome-${h.id}`, `assets/ui/tomes/${h.id}.png`);
  }

  load.audio('xals-theme', 'assets/audio/xals-theme.mp3');
  load.audio('barlogs-theme', 'assets/audio/barlogs-theme.mp3');
  load.audio('meadow', 'assets/audio/meadow.mp3');
  load.audio('river', 'assets/audio/river.mp3');
  load.audio('altar', 'assets/audio/altar.mp3');
  load.audio('cast', 'assets/audio/cast.wav');
  load.audio('pop', 'assets/audio/pop.wav');
  load.audio('levelup', 'assets/audio/levelup.wav');
  load.audio('buff', 'assets/audio/buff.wav');
  load.audio('debuff', 'assets/audio/debuff.wav');
  load.audio('coin', 'assets/audio/coin.mp3');
}
