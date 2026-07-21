import Phaser from 'phaser';
import { getContext } from '../game/GameContext';
import { formatNumber } from '../utils/format';
import type { RegionId, TabId } from '../types';

const FONT = "'Courier New', monospace";
const NAV_H = 76;

/** Unity BottomNav: Settings · Rewards · Outlook · Map · Tomes */
const NAV: { id: TabId; label: string; icon: string }[] = [
  { id: 'settings', label: 'Settings', icon: 'ui-gear' },
  { id: 'achievements', label: 'Rewards', icon: 'ui-trophy' },
  { id: 'outlook', label: 'Outlook', icon: 'ui-flower' },
  { id: 'scene', label: 'Map', icon: 'ui-portal' },
  { id: 'shop', label: 'Tomes', icon: 'ui-tomes-icon' },
];

export class PlayScene extends Phaser.Scene {
  private ctx = getContext();
  private tab: TabId = 'outlook';
  private bg!: Phaser.GameObjects.Image;
  private sceneBg!: Phaser.GameObjects.Image;
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

    this.sceneBg = this.add
      .image(width / 2, (height - NAV_H) / 2, 'ui-scene-bg')
      .setDepth(1)
      .setVisible(false);
    this.fitSceneBg();

    this.portrait = this.add
      .image(width * 0.5, height * 0.4, 'xal-generic')
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

    this.chapterCard = this.add.container(width / 2, height - NAV_H - 70).setDepth(22).setVisible(false);

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
        fontSize: '11px',
        color: '#f3ead7',
        stroke: '#1a1208',
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
    this.influenceRate = this.add
      .text(-30, 16, '', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#b8e0a8',
        stroke: '#1a1208',
        strokeThickness: 2,
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
        fontSize: '10px',
        color: '#f3ead7',
        stroke: '#1a1208',
        strokeThickness: 3,
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
    const cardW = 220;
    const cardH = 88;
    const bg = this.add
      .rectangle(0, 0, cardW, cardH, 0x1a140c, 0.92)
      .setStrokeStyle(2, 0xc4a35a);
    const parts: Phaser.GameObjects.GameObject[] = [bg];
    if (locked) {
      parts.push(this.add.image(-78, 0, 'ui-lock').setDisplaySize(28, 28));
    }
    parts.push(
      this.add
        .text(locked ? -50 : -90, -26, `Chapter ${next.id}`, {
          fontFamily: FONT,
          fontSize: '11px',
          color: '#c8b89a',
          stroke: '#1a1208',
          strokeThickness: 2,
        })
        .setOrigin(0, 0.5),
      this.add
        .text(locked ? -50 : -90, -4, next.name, {
          fontFamily: FONT,
          fontSize: '12px',
          color: locked ? '#888' : '#ffe6a8',
          stroke: '#1a1208',
          strokeThickness: 2,
          wordWrap: { width: 160 },
        })
        .setOrigin(0, 0.5),
    );
    if (locked) {
      parts.push(
        this.add
          .text(locked ? -50 : -90, 22, `Lvl ${next.levelRequirement}`, {
            fontFamily: FONT,
            fontSize: '10px',
            color: '#e08080',
            stroke: '#1a1208',
            strokeThickness: 2,
          })
          .setOrigin(0, 0.5),
      );
    } else if (next.id >= 2 && next.id <= 4) {
      parts.push(
        this.add
          .text(-90, 22, '2x Mana Increase', {
            fontFamily: FONT,
            fontSize: '9px',
            color: '#9ec9ff',
            stroke: '#1a1208',
            strokeThickness: 2,
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
    this.chapterCard.setAlpha(locked ? 0.75 : 1);
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
      this.portrait.setTexture('barlog');
      this.fitPortrait();
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
      .rectangle(w / 2, h - NAV_H / 2, w, NAV_H, 0x2a1810, 0.96)
      .setDepth(40)
      .setStrokeStyle(1, 0x4a3020);

    this.navButtons = NAV.map((item, i) => {
      const x = (w / NAV.length) * (i + 0.5);
      const slotW = Math.min(68, w / NAV.length - 4);
      const bg = this.add
        .image(0, -6, 'ui-nav-default')
        .setDisplaySize(slotW, 44);
      const icon = this.add.image(0, -10, item.icon);
      const src = icon.texture.getSourceImage() as { width: number; height: number };
      const max = 26;
      const s = Math.min(max / Math.max(1, src.width), max / Math.max(1, src.height));
      icon.setDisplaySize(Math.round(src.width * s), Math.round(src.height * s));
      const label = this.add
        .text(0, 22, item.label, {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#c8b89a',
          stroke: '#1a1208',
          strokeThickness: 2,
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
      label.setColor(active ? '#ffe6a8' : '#c8b89a');
    });

    this.panel.removeAll(true);
    this.panel.setVisible(tab === 'shop' || tab === 'achievements' || tab === 'settings');
    this.ctx.audio.playSfx('pop', 0.35);

    this.sceneBg.setVisible(tab === 'scene');
    this.bg.setVisible(tab !== 'scene');

    if (tab === 'outlook') {
      this.portrait.setVisible(false);
      this.chapterCard.setVisible(false);
      this.ctx.audio.playRegion(this.ctx.state.region);
      return;
    }

    if (tab === 'scene') {
      this.portrait.setVisible(true);
      this.ctx.spawn.clear();
      this.ctx.audio.playBgm('xals-theme');
      if (this.ctx.story.reading) this.renderQuote();
      else this.refreshChapterCard();
      return;
    }

    this.portrait.setVisible(false);
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
    const top = 100;
    const panelH = h - NAV_H - top - 8;
    const panelW = w - 16;
    const cy = top + panelH / 2;
    this.panel.add(
      this.add
        .rectangle(w / 2, (h - NAV_H) / 2, w, h - NAV_H, 0x0d140d, 0.55)
        .setInteractive(),
    );
    this.panel.add(
      this.add.image(w / 2, cy, 'ui-panel').setDisplaySize(panelW, panelH),
    );
    this.panel.add(
      this.add.image(w / 2, top + 18, 'ui-banner').setDisplaySize(panelW * 0.72, 34),
    );
    this.panel.add(
      this.add
        .text(w / 2, top + 18, title, {
          fontFamily: FONT,
          fontSize: '14px',
          color: '#f3ead7',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5),
    );
    return top + 44;
  }

  private renderShop(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const listTop = this.addFramedPanel('Tomes');
    const rowH = 72;
    const visibleH = h - NAV_H - listTop - 12;
    const maxScroll = Math.max(
      0,
      this.ctx.economy.helpers.length * rowH - visibleH,
    );
    this.shopScroll = Phaser.Math.Clamp(this.shopScroll, 0, maxScroll);

    const cards: Phaser.GameObjects.Container[] = [];
    const applyScroll = () => {
      cards.forEach((card, i) => {
        const y = listTop + i * rowH - this.shopScroll + rowH / 2;
        card.setY(y);
        card.setVisible(y > listTop - 10 && y < h - NAV_H - 4);
      });
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

    const innerW = w - 36;
    this.ctx.economy.helpers.forEach((def, i) => {
      const save = this.ctx.state.helpers.find((hh) => hh.id === def.id)!;
      const locked = this.ctx.state.playerLevel < def.unlockLevel;
      const y = listTop + i * rowH - this.shopScroll + rowH / 2;

      const boxKey = locked ? 'ui-tome-locked' : 'ui-tome-box';
      const box = this.add.image(0, 0, boxKey).setDisplaySize(innerW, 66);
      const emblemKey = `tome-${def.id}`;
      const emblem = this.textures.exists(emblemKey)
        ? this.add.image(-innerW / 2 + 36, 0, emblemKey).setDisplaySize(36, 36)
        : this.add.circle(-innerW / 2 + 36, 0, 18, 0x445544);

      const lockImg =
        locked && this.textures.exists('ui-lock')
          ? this.add.image(-innerW / 2 + 36, 0, 'ui-lock').setDisplaySize(22, 22)
          : null;

      const title = this.add.text(-innerW / 2 + 64, -14, def.name, {
        fontFamily: FONT,
        fontSize: '11px',
        color: locked ? '#888' : '#f3ead7',
        stroke: '#1a1208',
        strokeThickness: 2,
      });

      const costIcon = !locked
        ? this.add.image(-innerW / 2 + 72, 12, 'ui-influence').setDisplaySize(12, 12)
        : null;
      const meta = this.add.text(
        -innerW / 2 + (locked ? 64 : 82),
        6,
        locked
          ? `Lvl ${def.unlockLevel}`
          : `${formatNumber(save.dynamicCost)}  ×${save.amountOwned}  +${formatNumber(save.dynamicIncrement)}/s`,
        {
          fontFamily: FONT,
          fontSize: '9px',
          color: locked ? '#666' : '#c8b89a',
          stroke: '#1a1208',
          strokeThickness: 2,
        },
      );

      const parts: Phaser.GameObjects.GameObject[] = [box, emblem, title, meta];
      if (lockImg) parts.push(lockImg);
      if (costIcon) parts.push(costIcon);
      const card = this.add.container(w / 2, y, parts).setSize(innerW, 66);
      card.setInteractive(
        new Phaser.Geom.Rectangle(-innerW / 2, -33, innerW, 66),
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
    const rows: { title: string; n: number; goal: number; hint: string }[] = [
      { title: 'Clicker', n: a.clickerCount, goal: a.clickerGoal, hint: '×15 click' },
      { title: 'Helper', n: a.helperCount, goal: a.helperGoal, hint: '×3 tome income' },
      { title: 'Login', n: a.loginCount, goal: a.loginGoal, hint: 'daily streak' },
      { title: 'Story', n: a.storyCount, goal: a.storyGoal, hint: 'playthroughs' },
    ];
    const colW = (w - 48) / 2;
    rows.forEach((r, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 24 + col * (colW + 8) + colW / 2;
      const y = contentTop + 28 + row * 100;
      const card = this.add
        .rectangle(x, y, colW, 84, 0x1a140c, 0.85)
        .setStrokeStyle(1, 0xc4a35a);
      this.panel.add(card);
      this.panel.add(
        this.add
          .text(x, y - 24, r.title, {
            fontFamily: FONT,
            fontSize: '12px',
            color: '#ffe6a8',
            stroke: '#1a1208',
            strokeThickness: 2,
          })
          .setOrigin(0.5),
      );
      this.panel.add(
        this.add
          .text(x, y, `${r.n}/${r.goal}`, {
            fontFamily: FONT,
            fontSize: '14px',
            color: '#f3ead7',
            stroke: '#1a1208',
            strokeThickness: 2,
          })
          .setOrigin(0.5),
      );
      this.panel.add(
        this.add
          .text(x, y + 22, r.hint, {
            fontFamily: FONT,
            fontSize: '9px',
            color: '#c8b89a',
            stroke: '#1a1208',
            strokeThickness: 2,
          })
          .setOrigin(0.5),
      );
    });
  }

  private renderSettings(): void {
    const w = this.scale.width;
    const contentTop = this.addFramedPanel('Settings');
    let y = contentTop + 36;

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
          fontSize: '10px',
          color: '#f3ead7',
          stroke: '#1a1208',
          strokeThickness: 2,
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
      y += 52;
    };

    mkToggle(this.ctx.audio.muteBgm ? 'BGM Off' : 'BGM On', this.ctx.audio.muteBgm, () => {
      const muted = this.ctx.audio.toggleMuteBgm();
      return muted ? 'BGM Off' : 'BGM On';
    });

    mkToggle(this.ctx.audio.muteSfx ? 'SFX Off' : 'SFX On', this.ctx.audio.muteSfx, () => {
      const muted = this.ctx.audio.toggleMuteSfx();
      return muted ? 'SFX Off' : 'SFX On';
    });

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
            fontSize: '11px',
            color: '#f3ead7',
            stroke: '#1a1208',
            strokeThickness: 2,
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
            fontSize: '10px',
            color: '#888',
            stroke: '#1a1208',
            strokeThickness: 2,
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

  private fitSceneBg(): void {
    const { width, height } = this.scale;
    const tex = this.textures.get('ui-scene-bg').getSourceImage() as {
      width: number;
      height: number;
    };
    if (!tex.width || !tex.height) return;
    const scale = Math.max(width / tex.width, (height - NAV_H) / tex.height);
    this.sceneBg.setPosition(width / 2, (height - NAV_H) / 2);
    this.sceneBg.setScale(scale);
  }

  private fitPortrait(): void {
    const { width, height } = this.scale;
    const src = this.portrait.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    if (!src.width || !src.height) return;
    const scale = Math.min((width * 0.7) / src.width, (height * 0.5) / src.height);
    this.portrait.setScale(scale);
    this.portrait.setPosition(width * 0.5, height * 0.38);
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
