import Phaser from 'phaser';
import { getContext } from '../game/GameContext';
import { formatNumber } from '../utils/format';
import type { RegionId, TabId } from '../types';

/** Unity BottomNav order: Settings · Achievements · Scene · Outlook · Shop */
const NAV: { id: TabId; label: string }[] = [
  { id: 'settings', label: 'More' },
  { id: 'achievements', label: 'Goals' },
  { id: 'scene', label: 'Xal' },
  { id: 'outlook', label: 'Outlook' },
  { id: 'shop', label: 'Tomes' },
];

export class PlayScene extends Phaser.Scene {
  private ctx = getContext();
  private tab: TabId = 'outlook';
  private bg!: Phaser.GameObjects.Image;
  private portrait!: Phaser.GameObjects.Image;
  private influenceText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private manaText!: Phaser.GameObjects.Text;
  private passiveText!: Phaser.GameObjects.Text;
  private quoteBox!: Phaser.GameObjects.Container;
  private quoteText!: Phaser.GameObjects.Text;
  private panel!: Phaser.GameObjects.Container;
  private toast!: Phaser.GameObjects.Text;
  private chapterBtn!: Phaser.GameObjects.Text;
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

  constructor() {
    super('Play');
  }

  create(): void {
    const { width, height } = this.scale;
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

    // Outlook empty-ground cast
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.tab !== 'outlook') return;
      if (this.time.now < this.ignoreCastUntil) return;
      if (pointer.y > this.scale.height - 72) return;
      if (pointer.y < 90) return;
      if (this.ctx.spawn.hits(pointer.x, pointer.y)) return;
      this.castAt(pointer.x, pointer.y);
    });

    this.influenceText = this.hudText(16, 16, 22, '#f3ead7');
    this.levelText = this.hudText(16, 44, 16, '#d8c49a');
    this.manaText = this.hudText(16, 68, 14, '#9ec9ff');
    this.passiveText = this.add
      .text(width - 16, 16, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#b8e0a8',
        stroke: '#1a1208',
        strokeThickness: 3,
      })
      .setOrigin(1, 0)
      .setDepth(20);

    this.toast = this.add
      .text(width / 2, 110, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#ffe6a8',
        stroke: '#1a1208',
        strokeThickness: 3,
        align: 'center',
        wordWrap: { width: width - 40 },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.chapterBtn = this.add
      .text(width / 2, height - 100, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '15px',
        color: '#ffe6a8',
        backgroundColor: '#2a3820',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.chapterBtn.on('pointerdown', () => this.onChapterButton());

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
      this.ctx.spawn.clear();
    });

    if (this.ctx.offlineGained > 0) {
      this.showToast(
        `While you were away… +${formatNumber(this.ctx.offlineGained)} influence`,
      );
      this.ctx.offlineGained = 0;
    }

    // First chapter unread → start in the tower (Unity)
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
        h: h - 180,
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
      this.refreshChapterButton();
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

  private hudText(
    x: number,
    y: number,
    size: number,
    color: string,
  ): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, '', {
        fontFamily: 'Georgia, serif',
        fontSize: `${size}px`,
        color,
        stroke: '#1a1208',
        strokeThickness: 3,
      })
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
    // Empty-ground cast also summons a region creature (Unity IncrementPanel)
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
      // Brief delay then hide creature (Unity MagicEffect ~0.5s)
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
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
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
        this.refreshChapterButton();
        if (result.portalJustUnlocked) {
          this.showToast('The path closes… The portal opens.');
        }
        // Stay in tower; player returns to Outlook via nav (Unity)
        this.ctx.audio.playBgm('xals-theme');
      } else {
        this.renderQuote();
      }
      return;
    }

    // Banter (5s auto-hide)
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
    // Unity ChapterButton: mana level +1 when starting chapters 2–4
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

  private refreshChapterButton(): void {
    const next = this.nextChapter();
    if (!next || this.tab !== 'scene' || this.ctx.story.reading) {
      this.chapterBtn.setVisible(false);
      return;
    }
    const locked = this.ctx.state.playerLevel < next.levelRequirement;
    const manaHint =
      next.id >= 2 && next.id <= 4 ? '  ·  2× Mana' : '';
    this.chapterBtn.setText(
      locked
        ? `Chapter ${next.id} locked (lvl ${next.levelRequirement})`
        : `Begin: ${next.name}${manaHint}`,
    );
    this.chapterBtn.setAlpha(locked ? 0.55 : 1);
    this.chapterBtn.setVisible(true);
  }

  private buildQuoteBox(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const boxH = 120;
    const bg = this.add
      .rectangle(w / 2, h - 72 - boxH / 2 - 8, w - 24, boxH, 0x1a140c, 0.92)
      .setStrokeStyle(2, 0xc4a35a);
    this.quoteText = this.add
      .text(w / 2, h - 72 - boxH / 2 - 8, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#f3ead7',
        align: 'center',
        wordWrap: { width: w - 56 },
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
    this.chapterBtn.setVisible(false);
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
      .rectangle(w / 2, h - 36, w, 72, 0x12180f, 0.96)
      .setDepth(40)
      .setStrokeStyle(1, 0x3a4a30);

    this.navButtons = NAV.map((item, i) => {
      const x = (w / NAV.length) * (i + 0.5);
      const bg = this.add
        .image(0, 0, 'ui-nav-default')
        .setDisplaySize(Math.min(64, w / NAV.length - 8), 48);
      const label = this.add
        .text(0, 0, item.label, {
          fontFamily: 'Georgia, serif',
          fontSize: '12px',
          color: '#c8b89a',
        })
        .setOrigin(0.5);
      const c = this.add
        .container(x, h - 36, [bg, label])
        .setDepth(41)
        .setSize(70, 52)
        .setInteractive(
          new Phaser.Geom.Rectangle(-35, -26, 70, 52),
          Phaser.Geom.Rectangle.Contains,
        );
      c.on('pointerdown', () => this.setTab(item.id));
      return c;
    });
  }

  /**
   * Unity SelectView: re-tapping active tab returns to Outlook.
   */
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
      const label = btn.list[1] as Phaser.GameObjects.Text;
      img.setTexture(active ? 'ui-nav-active' : 'ui-nav-default');
      label.setColor(active ? '#ffe6a8' : '#c8b89a');
    });

    this.panel.removeAll(true);
    this.panel.setVisible(tab === 'shop' || tab === 'achievements' || tab === 'settings');
    this.ctx.audio.playSfx('pop', 0.35);

    if (tab === 'outlook') {
      this.portrait.setVisible(false);
      this.chapterBtn.setVisible(false);
      this.ctx.audio.playRegion(this.ctx.state.region);
      return;
    }

    if (tab === 'scene') {
      this.portrait.setVisible(true);
      this.ctx.spawn.clear();
      this.ctx.audio.playBgm('xals-theme');
      if (this.ctx.story.reading) this.renderQuote();
      else this.refreshChapterButton();
      return;
    }

    this.portrait.setVisible(false);
    this.chapterBtn.setVisible(false);
    this.ctx.spawn.clear();
    if (tab === 'shop') this.renderShop();
    if (tab === 'achievements') this.renderAchievements();
    if (tab === 'settings') this.renderSettings();
  }

  private renderShop(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const bg = this.add
      .rectangle(w / 2, (h - 72) / 2, w, h - 72, 0x0d140d, 0.94)
      .setInteractive();
    this.panel.add(bg);
    this.panel.add(
      this.add
        .text(w / 2, 24, 'Tomes', {
          fontFamily: 'Georgia, serif',
          fontSize: '26px',
          color: '#e8dcc8',
        })
        .setOrigin(0.5),
    );

    const listTop = 52;
    const rowH = 78;
    const visibleH = h - 72 - listTop - 8;
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
        card.setVisible(y > listTop - 20 && y < h - 80);
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

    this.ctx.economy.helpers.forEach((def, i) => {
      const save = this.ctx.state.helpers.find((h) => h.id === def.id)!;
      const locked = this.ctx.state.playerLevel < def.unlockLevel;
      const y = listTop + i * rowH - this.shopScroll + rowH / 2;

      const boxKey = locked ? 'ui-tome-locked' : 'ui-tome-box';
      const box = this.add.image(0, 0, boxKey).setDisplaySize(w - 28, 72);
      const emblemKey = `tome-${def.id}`;
      const emblem = this.textures.exists(emblemKey)
        ? this.add.image(-w / 2 + 52, 0, emblemKey).setDisplaySize(44, 44)
        : this.add.circle(-w / 2 + 52, 0, 22, 0x445544);

      const lockImg =
        locked && this.textures.exists('ui-lock')
          ? this.add.image(-w / 2 + 52, 0, 'ui-lock').setDisplaySize(28, 28)
          : null;

      const title = this.add
        .text(-w / 2 + 90, -16, def.name, {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: locked ? '#888' : '#f3ead7',
        });
      const meta = this.add
        .text(
          -w / 2 + 90,
          10,
          locked
            ? `Lvl ${def.unlockLevel}`
            : `×${save.amountOwned}   ${formatNumber(save.dynamicCost)}   +${formatNumber(save.dynamicIncrement)}/s`,
          {
            fontFamily: 'Georgia, serif',
            fontSize: '13px',
            color: locked ? '#666' : '#c8b89a',
          },
        );

      const parts: Phaser.GameObjects.GameObject[] = [box, emblem, title, meta];
      if (lockImg) parts.push(lockImg);
      const card = this.add.container(w / 2, y, parts).setSize(w - 28, 72);
      card.setInteractive(
        new Phaser.Geom.Rectangle(-(w - 28) / 2, -36, w - 28, 72),
        Phaser.Geom.Rectangle.Contains,
      );
      card.on('pointerdown', onDragStart);
      card.on('pointermove', onDragMove);
      if (!locked) {
        card.on('pointerup', () => {
          if (dragMoved > 10) return;
          if (this.ctx.economy.buyHelper(this.ctx.state, def.id)) {
            this.ctx.audio.playSfx('coin');
            const owned = this.ctx.state.helpers.find((h) => h.id === def.id)!;
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

    bg.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, dy: number) => {
      this.shopScroll = Phaser.Math.Clamp(
        this.shopScroll + dy * 0.4,
        0,
        maxScroll,
      );
      applyScroll();
    });
    bg.on('pointerdown', onDragStart);
    bg.on('pointermove', onDragMove);
  }

  private renderAchievements(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const a = this.ctx.state.achievements;
    this.panel.add(
      this.add
        .rectangle(w / 2, (h - 72) / 2, w, h - 72, 0x0d140d, 0.94)
        .setInteractive(),
    );
    const lines = [
      'Goals',
      `Clicker: ${a.clickerCount}/${a.clickerGoal} (×15 click)`,
      `Helper: ${a.helperCount}/${a.helperGoal} (×3 tome income)`,
      `Login: ${a.loginCount}/${a.loginGoal} days`,
      `Story: ${a.storyCount}/${a.storyGoal} playthroughs`,
      '',
      `Click power: ${formatNumber(this.ctx.state.clickerIncrement)}`,
      `Mana level: ${this.ctx.state.manaLevel}`,
      `Region: ${this.ctx.state.region}`,
      `Portal: ${this.ctx.state.portalUnlocked ? 'unlocked' : 'sealed'}`,
    ];
    lines.forEach((line, i) => {
      this.panel.add(
        this.add.text(24, 36 + i * 32, line, {
          fontFamily: 'Georgia, serif',
          fontSize: i === 0 ? '24px' : '15px',
          color: '#e8dcc8',
        }),
      );
    });
  }

  private renderSettings(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.panel.add(
      this.add
        .rectangle(w / 2, (h - 72) / 2, w, h - 72, 0x0d140d, 0.94)
        .setInteractive(),
    );
    this.panel.add(
      this.add
        .text(w / 2, 36, "Xal's Path", {
          fontFamily: 'Georgia, serif',
          fontSize: '26px',
          color: '#e8dcc8',
        })
        .setOrigin(0.5),
    );

    const mkBtn = (y: number, label: string, fn: () => void) => {
      const t = this.add
        .text(w / 2, y, label, {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#ffe6a8',
          backgroundColor: '#243020',
          padding: { x: 16, y: 10 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', fn);
      this.panel.add(t);
    };

    mkBtn(100, this.ctx.audio.muted ? 'Unmute' : 'Mute audio', () => {
      const muted = this.ctx.audio.toggleMute();
      if (!muted) {
        if (this.tab === 'outlook') this.ctx.audio.playRegion(this.ctx.state.region);
        else this.ctx.audio.playBgm('xals-theme');
      }
      this.setTab('settings', true);
    });

    if (this.ctx.state.portalUnlocked) {
      (['meadow', 'river', 'altar'] as RegionId[]).forEach((r, i) => {
        mkBtn(160 + i * 56, `Portal: ${r}`, () => {
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
          .text(w / 2, 180, 'Portal sealed — finish the story', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#888',
          })
          .setOrigin(0.5),
      );
    }

    mkBtn(h - 160, 'Reset save', () => {
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
    this.influenceText.setText(`Influence ${formatNumber(s.influence)}`);
    this.levelText.setText(
      `Level ${s.playerLevel}  ·  ${formatNumber(s.totalInfluenceEarned)}/${formatNumber(s.experienceRequired)}`,
    );
    const buff =
      s.buffRemaining > 0 ? `  BUFF ${Math.ceil(s.buffRemaining)}s` : '';
    this.manaText.setText(`Mana ${Math.floor(s.mana)}/${s.manaMax}${buff}`);
    this.passiveText.setText(
      `${formatNumber(this.ctx.economy.passivePerSecond(s))}/s`,
    );
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
    const scale = Math.max(width / tex.width, (height - 72) / tex.height);
    this.bg.setPosition(width / 2, (height - 72) / 2);
    this.bg.setScale(scale);
  }

  private fitPortrait(): void {
    const { width, height } = this.scale;
    const src = this.portrait.texture.getSourceImage() as {
      width: number;
      height: number;
    };
    if (!src.width || !src.height) return;
    const scale = Math.min((width * 0.7) / src.width, (height * 0.55) / src.height);
    this.portrait.setScale(scale);
    this.portrait.setPosition(width * 0.5, height * 0.38);
  }

  private onResize(): void {
    this.ctx.persist();
    this.scene.restart();
  }
}
