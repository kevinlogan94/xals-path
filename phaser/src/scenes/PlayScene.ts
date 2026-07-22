import Phaser from 'phaser';
import { getContext } from '../game/GameContext';
import { formatNumber } from '../utils/format';
import type { RegionId, TabId } from '../types';

const FONT = "'Press Start 2P', 'Courier New', monospace";
const NAV_H = 76;

/** Unity BottomNav: Settings · Rewards · Outlook · Map · Tomes */
const NAV: { id: TabId; label: string; icon: string }[] = [
  { id: 'settings', label: 'Settings', icon: 'ui-gear' },
  { id: 'achievements', label: 'Rewards', icon: 'ui-trophy-nav' },
  { id: 'outlook', label: 'Outlook', icon: 'ui-flower' },
  { id: 'scene', label: 'Map', icon: 'ui-portal-nav' },
  { id: 'shop', label: 'Tomes', icon: 'ui-tomes-nav' },
];

export class PlayScene extends Phaser.Scene {
  private ctx = getContext();
  private tab: TabId = 'outlook';
  private bg!: Phaser.GameObjects.Image;
  private portrait!: Phaser.GameObjects.Image;
  private influenceAmt!: Phaser.GameObjects.Text;
  private influenceRate!: Phaser.GameObjects.Text;
  private levelLabel!: Phaser.GameObjects.Text;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private manaFill!: Phaser.GameObjects.Rectangle;
  private xpBarMax = 70;
  private manaBarMax = 70;
  private exclaim!: Phaser.GameObjects.Image;
  private quoteBox!: Phaser.GameObjects.Container;
  private quoteText!: Phaser.GameObjects.Text;
  private panel!: Phaser.GameObjects.Container;
  private toast!: Phaser.GameObjects.Text;
  private chapterCard!: Phaser.GameObjects.Container;
  private lastLevel = 1;
  private lastBuff = 0;
  private saveTimer = 0;
  private passiveSpawnTimer = 0;
  private navButtons: Phaser.GameObjects.Container[] = [];
  private rewardsBadge!: Phaser.GameObjects.Image;
  private ignoreCastUntil = 0;
  private shopScroll = 0;
  private banterTimer?: Phaser.Time.TimerEvent;
  private persistHidden!: () => void;
  private persistPageHide!: () => void;
  private onResizeBound!: () => void;
  private layoutW = 0;
  private layoutH = 0;

  constructor() {
    super('Play');
  }

  create(): void {
    const { width, height } = this.scale;
    this.layoutW = width;
    this.layoutH = height;
    this.ctx.spawn.clear();
    this.ctx.audio.attach(this);
    this.ctx.spawn.attach(this);
    this.ctx.spawn.setTapHandler((hit) => this.onCreatureTap(hit));
    this.lastLevel = this.ctx.state.playerLevel;
    this.lastBuff = this.ctx.state.buffRemaining;

    this.bg = this.add
      .image(width / 2, height / 2, `bg-${this.ctx.state.region}`)
      .setDepth(0);
    this.fitBackground();

    // Xal expression sprites ARE the full Map/tower scene (Unity SceneBackgroundController)
    this.portrait = this.add
      .image(width / 2, (height - NAV_H) / 2, 'xal-generic')
      .setDepth(2)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    this.fitPortrait();
    this.portrait.on('pointerdown', () => {
      this.ignoreCastUntil = this.time.now + 50;
      this.onPortraitTap();
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.tab !== 'outlook') return;
      if (this.time.now < this.ignoreCastUntil) return;
      if (pointer.y > this.scale.height - NAV_H) return;
      if (pointer.y < 100) return;
      if (this.ctx.spawn.hits(pointer.x, pointer.y)) return;
      this.castAt(pointer.x, pointer.y);
    });

    this.buildHud();

    this.toast = this.add
      .text(width / 2, 118, '', {
        fontFamily: FONT,
        fontSize: '12px',
        color: '#ffe6a8',
        stroke: '#1a1208',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.chapterCard = this.add.container(width / 2, height - NAV_H - 110).setDepth(22).setVisible(false);

    this.buildQuoteBox();
    this.panel = this.add.container(0, 0).setDepth(25).setVisible(false);
    this.buildNav();

    this.persistHidden = () => {
      if (document.visibilityState === 'hidden') this.ctx.persist();
    };
    this.persistPageHide = () => this.ctx.persist();
    document.addEventListener('visibilitychange', this.persistHidden);
    window.addEventListener('pagehide', this.persistPageHide);
    this.onResizeBound = () => this.onResize();
    this.scale.on('resize', this.onResizeBound);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', this.persistHidden);
      window.removeEventListener('pagehide', this.persistPageHide);
      this.scale.off('resize', this.onResizeBound);
      this.ctx.audio.attach(null);
      this.ctx.spawn.clear();
    });

    if (this.ctx.offlineGained > 0) {
      this.showToast(
        `While you were away… +${formatNumber(this.ctx.offlineGained)} influence`,
      );
      this.ctx.offlineGained = 0;
    }

    const ch1 = this.ctx.state.chapters.find((c) => c.id === 1);
    const startTab: TabId = ch1 && !ch1.sceneViewed ? 'scene' : 'outlook';
    this.setTab(startTab, true);

    if (this.ctx.story.reading) {
      this.setTab('scene', true);
      this.renderQuote();
    }

    this.refreshHud();
  }

  update(_t: number, delta: number): void {
    const dt = delta / 1000;
    const prevBuff = this.ctx.state.buffRemaining;
    this.ctx.economy.tick(this.ctx.state, dt);

    if (this.tab === 'outlook') {
      const h = this.scale.height;
      this.ctx.spawn.tick(this.ctx.state, dt, {
        x: 0,
        y: 100,
        w: this.scale.width,
        h: h - NAV_H - 110,
      });

      this.passiveSpawnTimer += dt;
      if (this.passiveSpawnTimer >= 1) {
        this.passiveSpawnTimer = 0;
        this.ctx.spawn.onPassiveTick(this.ctx.state);
      }
    }

    if (this.ctx.state.playerLevel > this.lastLevel) {
      this.ctx.audio.playSfx('levelup');
      this.showToast(`Level ${this.ctx.state.playerLevel}`);
      this.lastLevel = this.ctx.state.playerLevel;
      this.refreshChapterCard();
    }

    if (prevBuff <= 0 && this.ctx.state.buffRemaining > 0) {
      this.ctx.audio.playSfx('buff');
      this.showToast('Buff! Infinite mana');
    }
    if (this.lastBuff > 0 && this.ctx.state.buffRemaining <= 0) {
      this.ctx.audio.playSfx('debuff');
    }
    this.lastBuff = this.ctx.state.buffRemaining;

    this.saveTimer += dt;
    if (this.saveTimer >= 2) {
      this.saveTimer = 0;
      this.ctx.persist();
    }
    this.refreshHud();
  }

  private buildHud(): void {
    const w = this.scale.width;

    // Left influence cloud
    const leftCloud = this.add
      .image(0, 0, 'ui-cloud')
      .setDisplaySize(150, 78);
    const inflIcon = this.add.image(-48, -8, 'ui-influence').setDisplaySize(22, 22);
    this.influenceAmt = this.add
      .text(-30, -14, '', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#ffffff',
        stroke: '#1a1208',
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);
    this.influenceRate = this.add
      .text(-30, 16, '', {
        fontFamily: FONT,
        fontSize: '7px',
        color: '#b8e0a8',
        stroke: '#1a1208',
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
    this.add
      .container(78, 48, [leftCloud, inflIcon, this.influenceAmt, this.influenceRate])
      .setDepth(20);

    // Right level cloud
    const rightCloud = this.add
      .image(0, 0, 'ui-level-cloud')
      .setDisplaySize(168, 88);
    this.levelLabel = this.add
      .text(0, -28, '', {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#ffffff',
        stroke: '#1a1208',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    const star = this.add.image(-62, -6, 'ui-star').setDisplaySize(14, 14);
    const xpTrack = this.add.rectangle(-8, -6, this.xpBarMax, 8, 0x1a2a18).setOrigin(0, 0.5);
    this.xpFill = this.add.rectangle(-8, -6, 4, 8, 0x5ecf5a).setOrigin(0, 0.5);
    const manaIcon = this.add.image(-62, 14, 'ui-mana-icon').setDisplaySize(14, 14);
    const manaTrack = this.add.rectangle(-8, 14, this.manaBarMax, 8, 0x1a2030).setOrigin(0, 0.5);
    this.manaFill = this.add.rectangle(-8, 14, 4, 8, 0x5aa0ff).setOrigin(0, 0.5);
    this.exclaim = this.add
      .image(70, -28, 'ui-exclaim')
      .setDisplaySize(18, 18)
      .setVisible(false);
    this.add
      .container(w - 90, 52, [
        rightCloud,
        this.levelLabel,
        star,
        xpTrack,
        this.xpFill,
        manaIcon,
        manaTrack,
        this.manaFill,
        this.exclaim,
      ])
      .setDepth(20);
  }

  private castAt(x: number, y: number): void {
    const gained = this.ctx.economy.tryCast(this.ctx.state);
    if (gained <= 0) {
      this.showToast('Not enough mana');
      return;
    }
    this.ctx.audio.playSfx('cast', 0.35);
    this.floatText(x, y, `+${formatNumber(gained)}`);
    this.ctx.spawn.schedule(this.ctx.state, { delay: 0 });
  }

  private onCreatureTap(hit: {
    sprite: Phaser.GameObjects.Image;
    magic: boolean;
    setMagic: () => void;
    hideCreature: () => void;
  }): void {
    this.ignoreCastUntil = this.time.now + 50;
    const gained = this.ctx.economy.tryCreatureTap(this.ctx.state, hit.magic);
    if (gained <= 0) {
      this.showToast('Not enough mana');
      return;
    }
    this.ctx.audio.playSfx('cast', 0.4);
    if (!hit.magic) {
      hit.setMagic();
      this.time.delayedCall(400, () => hit.hideCreature());
    }
    const mult = Math.round(gained / Math.max(1, this.ctx.state.clickerIncrement));
    this.floatText(
      hit.sprite.x,
      hit.sprite.y - 20,
      `+${formatNumber(gained)}${mult > 1 ? ` ×${mult}` : ''}`,
    );
  }

  private floatText(x: number, y: number, msg: string): void {
    const floater = this.add
      .text(x, y, msg, {
        fontFamily: FONT,
        fontSize: '14px',
        color: '#fff4c8',
        stroke: '#3a2a10',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(15);
    this.tweens.add({
      targets: floater,
      y: y - 60,
      alpha: 0,
      duration: 700,
      onComplete: () => floater.destroy(),
    });
  }

  private onPortraitTap(): void {
    if (this.tab !== 'scene') return;

    if (this.ctx.story.reading) {
      const result = this.ctx.story.advance(this.ctx.state);
      if (result.regionChanged) {
        this.applyRegionVisual();
        this.ctx.spawn.clear();
      }
      if (result.finished) {
        this.hideQuote();
        this.setPortraitExpression('generic');
        this.refreshChapterCard();
        if (result.portalJustUnlocked) {
          this.showToast('The path closes… The portal opens.');
        }
        this.ctx.audio.playBgm('xals-theme');
      } else {
        this.renderQuote();
      }
      return;
    }

    this.clearBanterTimer();
    this.setPortraitExpression('angry');
    const line = this.ctx.story.banterLine();
    this.quoteBox.setVisible(true);
    this.quoteText.setText(line);
    this.banterTimer = this.time.delayedCall(5000, () => {
      this.hideQuote();
      this.setPortraitExpression('generic');
    });
  }

  private clearBanterTimer(): void {
    this.banterTimer?.remove(false);
    this.banterTimer = undefined;
  }

  private onChapterButton(): void {
    const next = this.nextChapter();
    if (!next) return;
    if (!this.ctx.story.canStart(this.ctx.state, next.id)) {
      this.showToast(`Requires level ${next.levelRequirement}`);
      return;
    }
    if (!this.ctx.story.start(this.ctx.state, next.id)) return;
    if (next.id >= 2 && next.id <= 4) {
      this.ctx.state.manaLevel += 1;
      this.ctx.state.manaMax = 100 * this.ctx.state.manaLevel;
      this.ctx.state.mana = this.ctx.state.manaMax;
    }
    this.clearBanterTimer();
    this.setTab('scene', true);
    this.renderQuote();
  }

  private nextChapter() {
    return this.ctx.story.chapters.find((ch) => {
      const save = this.ctx.state.chapters.find((c) => c.id === ch.id);
      return save && !save.sceneViewed;
    });
  }

  private refreshChapterCard(): void {
    this.chapterCard.removeAll(true);
    this.chapterCard.disableInteractive();
    const next = this.nextChapter();
    if (!next || this.tab !== 'scene' || this.ctx.story.reading) {
      this.chapterCard.setVisible(false);
      return;
    }
    const locked = !this.ctx.story.canStart(this.ctx.state, next.id);
    const cardW = 260;
    const cardH = 92;
    const bg = this.add
      .image(0, 0, locked ? 'ui-achiev-box-pressed' : 'ui-achiev-box')
      .setDisplaySize(cardW, cardH);
    const parts: Phaser.GameObjects.GameObject[] = [bg];
    parts.push(
      this.add
        .image(-92, 0, locked ? 'ui-lock' : 'ui-portal-nav')
        .setDisplaySize(36, 36),
    );
    parts.push(
      this.add
        .text(-64, -22, `Chapter ${next.id}`, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#c8b89a',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0, 0.5),
      this.add
        .text(-64, 0, next.name, {
          fontFamily: FONT,
          fontSize: '9px',
          color: locked ? '#888' : '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
          wordWrap: { width: 150 },
        })
        .setOrigin(0, 0.5),
    );
    if (locked) {
      parts.push(
        this.add
          .text(-64, 24, `Lvl ${next.levelRequirement}`, {
            fontFamily: FONT,
            fontSize: '8px',
            color: '#e08080',
            stroke: '#1a1208',
            strokeThickness: 3,
          })
          .setOrigin(0, 0.5),
      );
    } else if (next.id >= 2 && next.id <= 4) {
      parts.push(
        this.add
          .text(-64, 24, '2x Mana Increase', {
            fontFamily: FONT,
            fontSize: '7px',
            color: '#9ec9ff',
            stroke: '#1a1208',
            strokeThickness: 3,
          })
          .setOrigin(0, 0.5),
      );
    }
    this.chapterCard.add(parts);
    this.chapterCard.setSize(cardW, cardH);
    this.chapterCard.off('pointerdown');
    if (!locked) {
      this.chapterCard.setInteractive(
        new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH),
        Phaser.Geom.Rectangle.Contains,
      );
      this.chapterCard.on('pointerdown', () => this.onChapterButton());
    }
    this.chapterCard.setAlpha(locked ? 0.85 : 1);
    this.chapterCard.setVisible(true);
  }

  private buildQuoteBox(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const boxH = 120;
    const y = h - NAV_H - boxH / 2 - 8;
    const bg = this.textures.exists('ui-quote-box')
      ? this.add.image(w / 2, y, 'ui-quote-box').setDisplaySize(w - 24, boxH)
      : this.add
          .rectangle(w / 2, y, w - 24, boxH, 0x1a140c, 0.92)
          .setStrokeStyle(2, 0xc4a35a);
    this.quoteText = this.add
      .text(w / 2, y, '', {
        fontFamily: FONT,
        fontSize: '12px',
        color: '#f3ead7',
        align: 'center',
        wordWrap: { width: w - 56 },
        stroke: '#1a1208',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    this.quoteBox = this.add
      .container(0, 0, [bg, this.quoteText])
      .setDepth(22)
      .setVisible(false);
  }

  private renderQuote(): void {
    const line = this.ctx.story.currentLine();
    if (!line) return;
    this.clearBanterTimer();
    this.quoteBox.setVisible(true);
    this.quoteText.setText(line.text);
    this.chapterCard.setVisible(false);
    if (line.speaker === 'barlog') {
      // Barlog uses a separate overlay in Unity; keep Xal tower scene underneath for now
      this.ctx.audio.playBgm('barlogs-theme');
    } else {
      this.setPortraitExpression(line.expression);
    }
  }

  private hideQuote(): void {
    this.quoteBox.setVisible(false);
  }

  private setPortraitExpression(expr: string): void {
    const key = `xal-${expr}`;
    this.portrait.setTexture(
      this.textures.exists(key) ? key : 'xal-generic',
    );
    this.fitPortrait();
  }

  private buildNav(): void {
    const h = this.scale.height;
    const w = this.scale.width;
    this.add
      .image(w / 2, h - NAV_H / 2, 'ui-stone')
      .setDisplaySize(w, NAV_H)
      .setDepth(40);

    this.navButtons = NAV.map((item, i) => {
      const x = (w / NAV.length) * (i + 0.5);
      const slotW = Math.min(68, w / NAV.length - 4);
      const bg = this.add
        .image(0, -6, 'ui-nav-default')
        .setDisplaySize(slotW, 44);
      const iconKey = this.textures.exists(item.icon) ? item.icon : 'ui-gear';
      const icon = this.add.image(0, -10, iconKey);
      const src = icon.texture.getSourceImage() as { width: number; height: number };
      const max = 26;
      const s = Math.min(max / Math.max(1, src.width), max / Math.max(1, src.height));
      icon.setDisplaySize(Math.round(src.width * s), Math.round(src.height * s));
      const label = this.add
        .text(0, 22, item.label, {
          fontFamily: FONT,
          fontSize: '6px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      const c = this.add
        .container(x, h - NAV_H / 2, [bg, icon, label])
        .setDepth(41)
        .setSize(slotW, 56)
        .setInteractive(
          new Phaser.Geom.Rectangle(-slotW / 2, -28, slotW, 56),
          Phaser.Geom.Rectangle.Contains,
        );
      c.on('pointerdown', () => this.setTab(item.id));
      return c;
    });

    const rewardsX = (w / NAV.length) * 1.5;
    this.rewardsBadge = this.add
      .image(rewardsX + 22, h - NAV_H / 2 - 28, 'ui-exclaim')
      .setDisplaySize(16, 16)
      .setDepth(42)
      .setVisible(false);
  }

  /** Unity SelectView: re-tapping active tab returns to Outlook. */
  private setTab(tab: TabId, force = false): void {
    if (!force && this.tab === tab) {
      tab = 'outlook';
    }

    this.clearBanterTimer();
    if (tab !== 'scene') this.hideQuote();

    this.tab = tab;
    this.navButtons.forEach((btn, i) => {
      const active = NAV[i].id === tab;
      const img = btn.list[0] as Phaser.GameObjects.Image;
      const label = btn.list[2] as Phaser.GameObjects.Text;
      img.setTexture(active ? 'ui-nav-active' : 'ui-nav-default');
      label.setColor(active ? '#ffe6a8' : '#ffffff');
    });

    this.panel.removeAll(true);
    this.panel.setVisible(tab === 'shop' || tab === 'achievements' || tab === 'settings');
    this.ctx.audio.playSfx('pop', 0.35);

    this.bg.setVisible(tab !== 'scene');
    this.portrait.setVisible(tab === 'scene');

    if (tab === 'outlook') {
      this.chapterCard.setVisible(false);
      this.ctx.audio.playRegion(this.ctx.state.region);
      return;
    }

    if (tab === 'scene') {
      this.fitPortrait();
      this.ctx.spawn.clear();
      this.ctx.audio.playBgm('xals-theme');
      if (this.ctx.story.reading) this.renderQuote();
      else this.refreshChapterCard();
      return;
    }

    this.chapterCard.setVisible(false);
    this.ctx.spawn.clear();
    if (tab === 'shop') this.renderShop();
    if (tab === 'achievements') this.renderAchievements();
    if (tab === 'settings') this.renderSettings();
  }

  /** Framed modal: panel + banner. Returns content start Y. */
  private addFramedPanel(title: string): number {
    const w = this.scale.width;
    const h = this.scale.height;
    const top = 96;
    const panelH = h - NAV_H - top - 6;
    const panelW = w - 20;
    const cy = top + panelH / 2;
    const bannerW = panelW * 0.78;
    // Unity PanelTop is ~4.5:1; keep banner readable without crushing gem corners.
    const bannerH = Math.round(bannerW / 4.5);
    const bannerY = top + 10 + bannerH / 2;
    this.panel.add(
      this.add
        .rectangle(w / 2, (h - NAV_H) / 2, w, h - NAV_H, 0x0d140d, 0.55)
        .setInteractive(),
    );
    this.panel.add(
      this.add.image(w / 2, cy, 'ui-panel').setDisplaySize(panelW, panelH),
    );
    this.panel.add(
      this.add
        .image(w / 2, bannerY, 'ui-banner')
        .setDisplaySize(panelW * 0.78, bannerH),
    );
    this.panel.add(
      this.add
        .text(w / 2, bannerY, title, {
          fontFamily: FONT,
          fontSize: '13px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 4,
        })
        .setOrigin(0.5),
    );
    // Leave clear margin under the banner before the first row (Unity).
    return bannerY + bannerH / 2 + 14;
  }

  /** Fit a texture into a box without distorting aspect ratio. */
  private fitInBox(
    key: string,
    maxW: number,
    maxH: number,
  ): Phaser.GameObjects.Image {
    const img = this.add.image(0, 0, key);
    const src = img.texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const tw = Math.max(1, src.width);
    const th = Math.max(1, src.height);
    const scale = Math.min(maxW / tw, maxH / th);
    img.setDisplaySize(Math.round(tw * scale), Math.round(th * scale));
    return img;
  }

  private renderShop(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const listTop = this.addFramedPanel('Tomes');
    // Tome box art is 840×260; keep that aspect so rows aren't vertically squashed.
    const scrollGutter = 18;
    const sidePad = 14;
    const innerW = w - sidePad * 2 - scrollGutter;
    const boxH = Math.round(innerW * (260 / 840));
    const rowGap = 8;
    const rowH = boxH + rowGap;
    const listBottom = h - NAV_H - 10;
    const visibleH = listBottom - listTop;
    const maxScroll = Math.max(
      0,
      this.ctx.economy.helpers.length * rowH - visibleH,
    );
    this.shopScroll = Phaser.Math.Clamp(this.shopScroll, 0, maxScroll);

    const cards: Phaser.GameObjects.Container[] = [];
    const scrollX = w - sidePad - 4;
    const scrollTrack = this.add
      .rectangle(scrollX, listTop + visibleH / 2, 6, visibleH, 0x1a140c, 0.85)
      .setStrokeStyle(1, 0x5a4030);
    const scrollThumb = this.add
      .image(scrollX, listTop + 20, 'ui-scroll')
      .setDisplaySize(8, 28);
    this.panel.add(scrollTrack);
    this.panel.add(scrollThumb);

    const applyScroll = () => {
      cards.forEach((card, i) => {
        const y = listTop + i * rowH - this.shopScroll + rowH / 2;
        card.setY(y);
        card.setVisible(y > listTop - boxH / 2 && y < listBottom + boxH / 2);
      });
      if (maxScroll > 0) {
        const t = this.shopScroll / maxScroll;
        const thumbTravel = visibleH - 32;
        scrollThumb.setY(listTop + 16 + t * thumbTravel);
        scrollThumb.setVisible(true);
        scrollTrack.setVisible(true);
      } else {
        scrollThumb.setVisible(false);
        scrollTrack.setVisible(false);
      }
    };

    let dragY = 0;
    let dragMoved = 0;
    const onDragStart = (p: Phaser.Input.Pointer) => {
      dragY = p.y;
      dragMoved = 0;
    };
    const onDragMove = (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      const dy = dragY - p.y;
      dragY = p.y;
      dragMoved += Math.abs(dy);
      this.shopScroll = Phaser.Math.Clamp(this.shopScroll + dy, 0, maxScroll);
      applyScroll();
    };

    // achiev_box art bakes in a 160×160 avatar well at (46,46) inside 840×260.
    const slotFracX = (46 + 205) / 2 / 840;
    const slotFracY = (46 + 205) / 2 / 260;
    const slotSize = Math.round(innerW * (160 / 840));
    const avatarMax = Math.round(slotSize * 0.92);
    const textLeft = -innerW / 2 + innerW * (205 / 840) + 10;
    const textRight = innerW / 2 - 12;

    this.ctx.economy.helpers.forEach((def, i) => {
      const save = this.ctx.state.helpers.find((hh) => hh.id === def.id)!;
      const locked = this.ctx.state.playerLevel < def.unlockLevel;
      const y = listTop + i * rowH - this.shopScroll + rowH / 2;

      const boxKey = locked ? 'ui-tome-locked' : 'ui-tome-box';
      const box = this.add.image(0, 0, boxKey).setDisplaySize(innerW, boxH);

      // Sit emblems/lock inside the card art's inset square (Unity Avatar slot).
      const avatarX = -innerW / 2 + innerW * slotFracX;
      const avatarY = -boxH / 2 + boxH * slotFracY;
      const emblemKey = `tome-${def.id}`;
      let avatar: Phaser.GameObjects.GameObject;
      if (locked && this.textures.exists('ui-lock')) {
        const lockImg = this.fitInBox('ui-lock', avatarMax, avatarMax);
        lockImg.setPosition(avatarX, avatarY);
        avatar = lockImg;
      } else if (this.textures.exists(emblemKey)) {
        const emblem = this.fitInBox(emblemKey, avatarMax, avatarMax);
        emblem.setPosition(avatarX, avatarY);
        avatar = emblem;
      } else {
        avatar = this.add.circle(avatarX, avatarY, avatarMax / 2, 0x445544);
      }

      const titleColor = locked ? '#4a4038' : '#1a1208';
      const metaColor = locked ? '#5a5048' : '#1a1208';

      const title = this.add
        .text(textLeft, -boxH * 0.22, def.name, {
          fontFamily: FONT,
          fontSize: '12px',
          color: titleColor,
        })
        .setOrigin(0, 0.5);

      // Cost row: influence gem + price (shown for locked and unlocked, like Unity).
      const costIcon = this.fitInBox('ui-influence', 16, 14);
      costIcon.setPosition(textLeft + costIcon.displayWidth / 2, boxH * 0.2);
      const costText = this.add
        .text(
          textLeft + costIcon.displayWidth + 4,
          boxH * 0.2,
          formatNumber(save.dynamicCost),
          {
            fontFamily: FONT,
            fontSize: '10px',
            color: metaColor,
          },
        )
        .setOrigin(0, 0.5);

      // Right column: owned count (large) or "Lvl N", with /sec underneath.
      const countLabel = locked
        ? `Lvl ${def.unlockLevel}`
        : String(save.amountOwned);
      const count = this.add
        .text(textRight, -boxH * 0.2, countLabel, {
          fontFamily: FONT,
          fontSize: locked ? '11px' : '16px',
          color: titleColor,
        })
        .setOrigin(1, 0.5);

      const rate = this.add
        .text(
          textRight,
          boxH * 0.22,
          `${formatNumber(save.dynamicIncrement)}/sec`,
          {
            fontFamily: FONT,
            fontSize: '9px',
            color: metaColor,
          },
        )
        .setOrigin(1, 0.5);

      const parts: Phaser.GameObjects.GameObject[] = [
        box,
        avatar,
        title,
        costIcon,
        costText,
        count,
        rate,
      ];
      const card = this.add.container(w / 2 - scrollGutter / 2, y, parts).setSize(innerW, boxH);
      card.setInteractive(
        new Phaser.Geom.Rectangle(-innerW / 2, -boxH / 2, innerW, boxH),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerdown', onDragStart);
      card.on('pointermove', onDragMove);
      if (!locked) {
        card.on('pointerup', () => {
          if (dragMoved > 10) return;
          if (this.ctx.economy.buyHelper(this.ctx.state, def.id)) {
            this.ctx.audio.playSfx('coin');
            const owned = this.ctx.state.helpers.find((hh) => hh.id === def.id)!;
            if (owned.amountOwned === 1) {
              this.showToast(`${def.name} tome — ${def.creatureId} unbound`);
            }
            this.setTab('shop', true);
          } else {
            this.showToast('Not enough influence');
          }
        });
      }
      cards.push(card);
      this.panel.add(card);
    });
    applyScroll();

    const dim = this.panel.list[0] as Phaser.GameObjects.Rectangle;
    dim.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, dy: number) => {
      this.shopScroll = Phaser.Math.Clamp(
        this.shopScroll + dy * 0.4,
        0,
        maxScroll,
      );
      applyScroll();
    });
    dim.on('pointerdown', onDragStart);
    dim.on('pointermove', onDragMove);
  }

  private renderAchievements(): void {
    const w = this.scale.width;
    const contentTop = this.addFramedPanel('Rewards');
    const a = this.ctx.state.achievements;
    const rows: {
      id: 'clicker' | 'helper' | 'login' | 'story';
      title: string;
      n: number;
      goal: number;
      hint: string;
      icon: string;
    }[] = [
      {
        id: 'clicker',
        title: `Cast ${a.clickerGoal} spells`,
        n: a.clickerCount,
        goal: a.clickerGoal,
        hint: '×15 influence per click',
        icon: 'ui-reward-star',
      },
      {
        id: 'helper',
        title: `Buy ${a.helperGoal} Tomes`,
        n: a.helperCount,
        goal: a.helperGoal,
        hint: '×3 influence from tomes',
        icon: 'ui-reward-shop',
      },
      {
        id: 'login',
        title: `Log in for ${a.loginGoal} days`,
        n: a.loginCount,
        goal: a.loginGoal,
        hint: '1 hour of influence',
        icon: 'ui-reward-notepad',
      },
      {
        id: 'story',
        title: 'Finish the Story',
        n: a.storyCount,
        goal: a.storyGoal,
        hint: '10 hours of influence',
        icon: 'ui-reward-portal',
      },
    ];

    const colW = (w - 40) / 2;
    const cardH = 148;
    rows.forEach((r, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 20 + col * (colW + 4) + colW / 2;
      const y = contentTop + 16 + row * (cardH + 10) + cardH / 2;
      const ready = r.n >= r.goal;

      const box = this.add
        .image(x, y, 'ui-achiev-box')
        .setDisplaySize(colW - 4, cardH);
      this.panel.add(box);

      const icon = this.add
        .image(x - colW / 2 + 28, y - 40, r.icon)
        .setDisplaySize(28, 28);
      this.panel.add(icon);

      this.panel.add(
        this.add
          .text(x, y - 48, r.title, {
            fontFamily: FONT,
            fontSize: '7px',
            color: '#ffffff',
            stroke: '#1a1208',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: colW - 20 },
          })
          .setOrigin(0.5),
      );

      const barW = colW - 28;
      const track = this.add
        .rectangle(x, y - 8, barW, 10, 0x1a140c)
        .setStrokeStyle(1, 0x5a4030);
      const fill = this.add
        .rectangle(
          x - barW / 2,
          y - 8,
          Math.max(2, barW * Math.min(1, r.n / Math.max(1, r.goal))),
          10,
          0x5ecf5a,
        )
        .setOrigin(0, 0.5);
      this.panel.add(track);
      this.panel.add(fill);

      this.panel.add(
        this.add
          .text(x, y - 8, `${r.n}/${r.goal}`, {
            fontFamily: FONT,
            fontSize: '7px',
            color: '#ffffff',
            stroke: '#1a1208',
            strokeThickness: 3,
          })
          .setOrigin(0.5),
      );

      this.panel.add(
        this.add
          .text(x, y + 18, r.hint, {
            fontFamily: FONT,
            fontSize: '6px',
            color: '#ffe6a8',
            stroke: '#1a1208',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: colW - 16 },
          })
          .setOrigin(0.5),
      );

      const btn = this.add
        .image(x, y + 48, 'ui-btn-green')
        .setDisplaySize(colW - 36, 28)
        .setAlpha(ready ? 1 : 0.45);
      const btnLabel = this.add
        .text(x, y + 48, 'Receive', {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      this.panel.add(btn);
      this.panel.add(btnLabel);

      if (ready) {
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerdown', () => {
          const ok =
            r.id === 'clicker'
              ? this.ctx.economy.claimClicker(this.ctx.state)
              : r.id === 'helper'
                ? this.ctx.economy.claimHelper(this.ctx.state)
                : r.id === 'login'
                  ? this.ctx.economy.claimLogin(this.ctx.state)
                  : this.ctx.economy.claimStory(this.ctx.state);
          if (ok) {
            this.ctx.audio.playSfx('coin');
            this.showToast('Reward received');
            this.setTab('achievements', true);
          }
        });
      }
    });
  }

  private renderSettings(): void {
    const w = this.scale.width;
    const contentTop = this.addFramedPanel('Settings');
    let y = contentTop + 28;

    const section = (label: string) => {
      this.panel.add(
        this.add
          .text(w / 2, y, label, {
            fontFamily: FONT,
            fontSize: '7px',
            color: '#ffffff',
            stroke: '#1a1208',
            strokeThickness: 3,
          })
          .setOrigin(0.5),
      );
      y += 22;
    };

    const mkToggle = (initial: string, muted: boolean, onToggle: () => string) => {
      const speaker = this.add
        .image(w / 2 - 70, y, muted ? 'ui-speaker-off' : 'ui-speaker-on')
        .setDisplaySize(28, 28)
        .setInteractive({ useHandCursor: true });
      const btn = this.add
        .image(w / 2 + 24, y, 'ui-btn-blue')
        .setDisplaySize(140, 36)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(w / 2 + 24, y, initial, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      const apply = () => {
        const text = onToggle();
        const nowMuted = text.endsWith('Off');
        speaker.setTexture(nowMuted ? 'ui-speaker-off' : 'ui-speaker-on');
        label.setText(text);
      };
      speaker.on('pointerdown', apply);
      btn.on('pointerdown', apply);
      this.panel.add([speaker, btn, label]);
      y += 48;
    };

    section('Background Music');
    mkToggle(
      this.ctx.audio.muteBgm ? 'Music Off' : 'Music On',
      this.ctx.audio.muteBgm,
      () => (this.ctx.audio.toggleMuteBgm() ? 'Music Off' : 'Music On'),
    );

    section('Sound Effects');
    mkToggle(
      this.ctx.audio.muteSfx ? 'SFX Off' : 'SFX On',
      this.ctx.audio.muteSfx,
      () => (this.ctx.audio.toggleMuteSfx() ? 'SFX Off' : 'SFX On'),
    );

    const mkImgBtn = (key: string, label: string, fn: () => void) => {
      const btn = this.add
        .image(w / 2, y, key)
        .setDisplaySize(180, 40)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', fn);
      this.panel.add(btn);
      this.panel.add(
        this.add
          .text(w / 2, y, label, {
            fontFamily: FONT,
            fontSize: '9px',
            color: '#ffffff',
            stroke: '#1a1208',
            strokeThickness: 3,
          })
          .setOrigin(0.5),
      );
      y += 52;
    };

    mkImgBtn('ui-btn-green', 'Credits', () => {
      this.showToast("Xal's Path — web remake");
    });

    if (this.ctx.state.portalUnlocked) {
      (['meadow', 'river', 'altar'] as RegionId[]).forEach((r) => {
        mkImgBtn('ui-btn-blue', `Portal: ${r}`, () => {
          if (this.ctx.state.region === r) return;
          this.ctx.state.region = r;
          this.ctx.economy.drainMana(this.ctx.state);
          this.ctx.spawn.clear();
          this.applyRegionVisual();
          this.ctx.audio.playSfx('cast');
          this.setTab('outlook', true);
        });
      });
    } else {
      this.panel.add(
        this.add
          .text(w / 2, y, 'Portal sealed', {
            fontFamily: FONT,
            fontSize: '8px',
            color: '#888',
            stroke: '#1a1208',
            strokeThickness: 3,
          })
          .setOrigin(0.5),
      );
      y += 40;
    }

    mkImgBtn('ui-btn-orange', 'New Game', () => {
      this.ctx.reset();
      this.lastLevel = 1;
      this.applyRegionVisual();
      this.showToast('Save cleared');
      this.setTab('scene', true);
    });
  }

  private applyRegionVisual(): void {
    const key = `bg-${this.ctx.state.region}`;
    if (this.textures.exists(key)) this.bg.setTexture(key);
    this.fitBackground();
  }

  private refreshHud(): void {
    const s = this.ctx.state;
    this.influenceAmt.setText(formatNumber(s.influence));
    this.influenceRate.setText(
      `${formatNumber(this.ctx.economy.passivePerSecond(s))}/sec`,
    );
    this.levelLabel.setText(`Lvl ${s.playerLevel}`);
    const xpPct = Math.min(1, s.totalInfluenceEarned / Math.max(1, s.experienceRequired));
    this.xpFill.width = Math.max(2, this.xpBarMax * xpPct);
    const manaPct =
      s.buffRemaining > 0 ? 1 : Math.min(1, s.mana / Math.max(1, s.manaMax));
    this.manaFill.width = Math.max(2, this.manaBarMax * manaPct);
    this.exclaim.setVisible(s.buffRemaining > 0 || s.mana >= s.manaMax);
    if (this.rewardsBadge) {
      this.rewardsBadge.setVisible(this.ctx.economy.anyClaimable(s));
    }
  }

  private showToast(msg: string): void {
    this.toast.setText(msg);
    this.tweens.killTweensOf(this.toast);
    this.toast.setAlpha(1);
    this.tweens.add({
      targets: this.toast,
      alpha: 0,
      delay: 2200,
      duration: 500,
    });
  }

  private fitBackground(): void {
    const { width, height } = this.scale;
    const tex = this.textures.get(this.bg.texture.key).getSourceImage() as {
      width: number;
      height: number;
    };
    if (!tex.width || !tex.height) return;
    const scale = Math.max(width / tex.width, (height - NAV_H) / tex.height);
    this.bg.setPosition(width / 2, (height - NAV_H) / 2);
    this.bg.setScale(scale);
  }

  private fitPortrait(): void {
    const { width, height } = this.scale;
    const src = this.portrait.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    if (!src.width || !src.height) return;
    // Cover the playfield above the nav — Xal PNGs are full tower scenes
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

  private onResize(): void {
    const { width, height } = this.scale;
    if (width === this.layoutW && height === this.layoutH) return;
    this.layoutW = width;
    this.layoutH = height;
    this.ctx.persist();
    this.scene.restart();
  }
}
