import Phaser from 'phaser';
import { getContext } from '../game/GameContext';
import { formatNumber } from '../utils/format';
import type { RegionId, TabId } from '../types';
import { HudView } from './play/hud/HudView';
import { BottomNav } from './play/nav/BottomNav';
import { XalView } from './play/xal/XalView';
import { OutlookView } from './play/outlook/OutlookView';
import { renderRewardsPanel } from './play/rewards/RewardsPanel';
import { showCreditsModal } from './play/settings/CreditsModal';
import { renderSettingsPanel } from './play/settings/SettingsPanel';
import { buildAchievementSplash } from './play/splash/achievementSplash';
import { buildBuffSplash } from './play/splash/buffSplash';
import { buildCreatureSplash } from './play/splash/creatureSplash';
import { buildEndGameSplash } from './play/splash/endGameSplash';
import { buildInfluenceOverTimeSplash } from './play/splash/influenceOverTimeSplash';
import { buildLevelUpSplash } from './play/splash/levelUpSplash';
import { buildNewGameSplash } from './play/splash/newGameSplash';
import { buildPortalSplash } from './play/splash/portalSplash';
import { createSplash } from './play/splash/SplashView';
import { renderTomesPanel } from './play/tomes/TomesPanel';
import { FONT, NAV_H } from './play/ui/constants';
import { aimFinger, createFingerPointer } from './play/ui/FingerPointer';

export class PlayScene extends Phaser.Scene {
  private ctx = getContext();
  private tab: TabId = 'outlook';
  private hud!: HudView;
  private nav!: BottomNav;
  private map!: XalView;
  private outlook!: OutlookView;
  private panel!: Phaser.GameObjects.Container;
  private toast!: Phaser.GameObjects.Container;
  private toastBg!: Phaser.GameObjects.Graphics;
  private toastText!: Phaser.GameObjects.Text;
  private lastBuff = 0;
  private levelJinglePlayed = false;
  private saveTimer = 0;
  private passiveSpawnTimer = 0;
  private ignoreCastUntil = 0;
  private shopScroll = 0;
  private rewardsScroll = 0;
  private banterTimer?: Phaser.Time.TimerEvent;
  private persistHidden!: () => void;
  private persistPageHide!: () => void;
  private onFrozenResume!: () => void;
  private onPageShow!: (e: PageTransitionEvent) => void;
  private onResizeBound!: () => void;
  private layoutW = 0;
  private layoutH = 0;
  private splash!: ReturnType<typeof createSplash>;
  private finger!: Phaser.GameObjects.Container;
  private natureRow?: Phaser.GameObjects.Container;

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
    this.lastBuff = this.ctx.state.buffRemaining;

    this.outlook = new OutlookView(this, this.ctx);
    this.outlook.build();
    this.map = new XalView(
      this,
      () => {
        this.ignoreCastUntil = this.time.now + 50;
        this.onPortraitTap();
      },
      () => this.onChapterButton(),
    );
    this.map.build();
    this.map.setPortalTravelHandler((region) => this.onPortalTravel(region));

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.splash.isOpen()) return;
      if (this.tab !== 'outlook') return;
      if (!this.outlook.canCast(pointer, this.ignoreCastUntil)) return;
      this.castAt(pointer.x, pointer.y);
    });

    this.hud = new HudView(this, this.ctx, () => this.openLevelUpSplash());
    this.hud.build();
    this.toastText = this.add.text(0, 0, '', {
      fontFamily: FONT,
      fontSize: '12px',
      color: '#ffe6a8',
      align: 'center',
      wordWrap: { width: width - 56 },
    }).setOrigin(0.5);
    this.toastBg = this.add.graphics();
    this.toast = this.add
      .container(width / 2, 118, [this.toastBg, this.toastText])
      .setDepth(30)
      .setAlpha(0);
    this.panel = this.add.container(0, 0).setDepth(25).setVisible(false);
    this.nav = new BottomNav(this, this.ctx, (tab) => this.setTab(tab));
    this.nav.build();
    this.splash = createSplash(this, this.add.container(0, 0).setDepth(50), {
      playPop: () => this.ctx.audio.playSfx('pop'),
    });
    this.finger = createFingerPointer(this, 0, 0);
    this.ctx.tutorial.bootstrap(this.ctx.state, this.ctx.economy);
    this.applyNavLock();

    this.persistHidden = () => {
      if (document.visibilityState === 'hidden') this.ctx.persist();
    };
    this.persistPageHide = () => this.ctx.persist();
    this.onFrozenResume = () => {
      this.ctx.offlineGained = this.ctx.economy.applyOffline(this.ctx.state);
      if (this.ctx.offlineGained > 0) this.ctx.persist();
      this.openOfflineSplash();
    };
    this.onPageShow = (e) => {
      if (e.persisted) this.onFrozenResume();
    };
    document.addEventListener('visibilitychange', this.persistHidden);
    window.addEventListener('pagehide', this.persistPageHide);
    document.addEventListener('freeze', this.persistPageHide);
    document.addEventListener('resume', this.onFrozenResume);
    window.addEventListener('pageshow', this.onPageShow);
    this.onResizeBound = () => this.onResize();
    this.scale.on('resize', this.onResizeBound);
    this.events.once('shutdown', () => {
      document.removeEventListener('visibilitychange', this.persistHidden);
      window.removeEventListener('pagehide', this.persistPageHide);
      document.removeEventListener('freeze', this.persistPageHide);
      document.removeEventListener('resume', this.onFrozenResume);
      window.removeEventListener('pageshow', this.onPageShow);
      this.scale.off('resize', this.onResizeBound);
      this.splash.dismiss();
      this.ctx.audio.attach(null);
      this.ctx.spawn.clear();
    });

    const ch1 = this.ctx.state.chapters.find((c) => c.id === 1);
    const startTab: TabId = ch1 && !ch1.sceneViewed ? 'scene' : 'outlook';
    this.setTab(startTab, true);

    if (this.ctx.story.reading) {
      this.setTab('scene', true);
      this.renderQuote();
    }

    this.openOfflineSplash();

    this.refreshHud();
    this.refreshTutorialPointers();
  }

  private openOfflineSplash(): void {
    const pending = Math.floor(this.ctx.offlineGained);
    if (pending <= 0) return;
    this.splash.open('influenceOverTime', {
      build: buildInfluenceOverTimeSplash(pending, () => {
        this.ctx.economy.addInfluence(this.ctx.state, pending);
        this.ctx.state.pendingOffline = 0;
        this.ctx.offlineGained = 0;
        this.ctx.persist();
        this.refreshHud();
      }),
    });
  }

  update(_t: number, delta: number): void {
    const dt = delta / 1000;
    this.ctx.economy.tick(this.ctx.state, dt, this.ctx.tutorial);
    this.ctx.tutorial.tickEarlyPointer(
      dt,
      this.ctx.state,
      this.ctx.story.reading,
      this.tab === 'scene',
    );

    if (this.tab === 'outlook' && !this.ctx.tutorial.shouldPausePassive(this.ctx.state)) {
      this.ctx.spawn.tick(this.ctx.state, dt, this.outlook.spawnBounds());
      this.passiveSpawnTimer += dt;
      if (this.passiveSpawnTimer >= 1) {
        this.passiveSpawnTimer = 0;
        this.ctx.spawn.onPassiveTick(this.ctx.state);
      }
    }

    const ready = this.ctx.economy.readyToLevelUp(this.ctx.state);
    if (ready && !this.ctx.story.reading && !this.levelJinglePlayed) {
      this.ctx.audio.playSfx('levelup');
      this.levelJinglePlayed = true;
    }
    if (!ready) this.levelJinglePlayed = false;

    if (this.ctx.state.buffOfferPending && !this.splash.isOpen()) {
      this.openBuffSplash();
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
    this.refreshTutorialPointers();
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
    if (this.splash.isOpen()) return;
    this.ignoreCastUntil = this.time.now + 50;
    const gained = this.ctx.economy.tryCreatureTap(this.ctx.state, hit.magic);
    if (gained <= 0) {
      this.showToast('Not enough mana');
      return;
    }
    this.ctx.audio.playSfx('cast', 0.4);
    if (!hit.magic) {
      hit.setMagic();
      this.time.delayedCall(500, () => hit.hideCreature());
    }
    this.floatText(hit.sprite.x, hit.sprite.y - 20, `+${formatNumber(gained)}`);
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
      const finishingCh1 = this.ctx.story.activeChapter?.id === 1;
      const result = this.ctx.story.advance(this.ctx.state);
      if (result.regionChanged) {
        this.outlook.applyRegionVisual();
        this.ctx.spawn.clear();
      }
      if (result.finished) {
        this.map.hideQuote();
        this.map.setPortraitExpression('generic');
        this.refreshChapterCard();
        const chId = result.finishedChapterId;
        if (chId === 7) {
          this.splash.open('endGame', {
            build: buildEndGameSplash(() =>
              showCreditsModal(this, this.add.container(0, 0).setDepth(55)),
            ),
          });
        } else if (chId != null && chId >= 2 && chId <= 4) {
          const lvl = this.ctx.state.manaLevel;
          this.splash.open('achievement', {
            build: buildAchievementSplash({
              title: '2x Mana Increase',
              description: 'Your maximum mana has doubled.',
              iconKey: 'ui-mana-icon',
              before: `${(lvl - 1) * 100}`,
              after: `${lvl * 100}`,
            }),
          });
        } else if (result.portalJustUnlocked) {
          this.splash.open('portal', { build: buildPortalSplash() });
        }
        if (finishingCh1) {
          this.ctx.tutorial.startAfterChapter1(this.ctx.state);
          const line = this.ctx.tutorial.advanceLine(this.ctx.state, this.ctx.economy);
          if (line) {
            this.map.showQuote(line);
            this.map.setPortraitExpression('generic');
          }
          this.applyNavLock();
          this.refreshTutorialPointers();
        }
      } else {
        this.renderQuote();
      }
      return;
    }

    // Unity TriggerChat: first interaction always starts chapter 1.
    const ch1 = this.ctx.state.chapters.find((c) => c.id === 1);
    if (ch1 && !ch1.sceneViewed) {
      this.onChapterButton();
      return;
    }

    if (this.ctx.tutorial.active) {
      const line = this.ctx.tutorial.advanceLine(this.ctx.state, this.ctx.economy);
      if (line) {
        this.clearBanterTimer();
        this.map.showQuote(line);
        this.map.setPortraitExpression('generic');
      } else if (!this.ctx.tutorial.waitingNature) {
        this.map.hideQuote();
      }
      this.applyNavLock();
      this.refreshTutorialPointers();
      return;
    }

    // Banter only after the tutorial tour is done.
    if (!this.ctx.state.tutorialCompleted) return;

    this.clearBanterTimer();
    this.map.setPortraitExpression('angry');
    this.map.showQuote(this.ctx.story.banterLine());
    this.banterTimer = this.time.delayedCall(5000, () => {
      this.map.hideQuote();
      this.map.setPortraitExpression('generic');
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
    const next = this.nextChapter();
    const chapterVisible = !!next && this.tab === 'scene' && !this.ctx.story.reading;
    this.map.refreshChapterCard(
      next,
      next ? !this.ctx.story.canStart(this.ctx.state, next.id) : false,
      chapterVisible,
    );
    // Portal bar sits under the chapter card — hide while the card is up.
    this.map.refreshPortalBar(
      this.ctx.state.portalUnlocked,
      this.tab === 'scene' && !this.ctx.story.reading && !chapterVisible,
      this.ctx.state.region,
    );
  }

  private renderQuote(): void {
    const line = this.ctx.story.currentLine();
    if (!line) return;
    this.clearBanterTimer();
    this.map.showQuote(line.text);
    this.map.hideChapterCard();
    this.map.refreshPortalBar(false, false, this.ctx.state.region);
    if (line.speaker !== 'barlog') {
      this.map.setPortraitExpression(line.expression);
    }
  }

  /** Unity SelectView: re-tapping active tab returns to Outlook. */
  private setTab(tab: TabId, force = false): void {
    if (
      !force &&
      !this.ctx.tutorial.isTabAllowed(this.ctx.state, tab)
    ) {
      return;
    }

    const requested = tab;
    if (!force && this.tab === tab) {
      tab = 'outlook';
    }

    if (this.splash.isOpen()) this.splash.dismiss();
    if (tab === 'outlook' && this.ctx.tutorial.outlookTutorial) {
      this.ctx.tutorial.dismissOutlookTutorial();
    }

    this.clearBanterTimer();
    if (tab !== 'scene') this.map.hideQuote();

    this.tab = tab;
    this.nav.setActive(tab);
    this.panel.removeAll(true);
    this.panel.setVisible(tab === 'shop' || tab === 'achievements' || tab === 'settings');
    this.ctx.audio.playSfx('pop', 0.35);

    this.outlook.setVisible(tab !== 'scene');
    this.map.setVisible(tab === 'scene');

    if (tab === 'outlook') {
      this.map.hideChapterCard();
      this.map.refreshPortalBar(false, false, this.ctx.state.region);
      if (requested === tab) this.ctx.audio.playRegion(this.ctx.state.region);
      this.applyNavLock();
      this.refreshTutorialPointers();
      return;
    }

    if (tab === 'scene') {
      this.map.fitPortrait();
      this.ctx.spawn.clear();
      this.ctx.audio.playBgm('xals-theme');
      if (this.ctx.story.reading) this.renderQuote();
      else this.refreshChapterCard();
      this.applyNavLock();
      this.refreshTutorialPointers();
      return;
    }

    this.map.hideChapterCard();
    this.map.refreshPortalBar(false, false, this.ctx.state.region);
    this.ctx.spawn.clear();
    if (tab === 'shop') this.renderShop();
    if (tab === 'achievements') this.renderAchievements();
    if (tab === 'settings') this.renderSettings();

    this.applyNavLock();
    this.refreshTutorialPointers();
  }

  private renderShop(): void {
    this.natureRow = undefined;
    renderTomesPanel({
      scene: this,
      panel: this.panel,
      ctx: this.ctx,
      shopScroll: this.shopScroll,
      onScroll: (scroll) => {
        this.shopScroll = scroll;
      },
      showToast: (message) => this.showToast(message),
      onCreatureUnlock: (creatureId) => {
        const creature = this.ctx.spawn.creatures.find((c) => c.id === creatureId);
        if (creature) {
          this.splash.open('creature', { build: buildCreatureSplash(creature), deferChrome: true });
        }
      },
      rerender: () => {
        this.ctx.tutorial.onNaturePurchased(this.ctx.state);
        this.setTab('shop', true);
      },
      onNatureRow: (card) => {
        this.natureRow = card;
      },
    });
  }

  private applyNavLock(): void {
    this.nav.setTabAllowed((tab) =>
      this.ctx.tutorial.isTabAllowed(this.ctx.state, tab),
    );
  }

  private refreshTutorialPointers(): void {
    const next = this.nextChapter();
    const chapterVisible = !!next && this.tab === 'scene' && !this.ctx.story.reading;
    const target = this.ctx.tutorial.pointerTarget(
      this.ctx.state,
      this.tab,
      this.ctx.story.reading,
      this.tab === 'shop',
      chapterVisible,
    );
    if (target === 'xal' && this.map.quoteVisible()) {
      this.finger.setVisible(false);
      return;
    }

    if (target === 'none') {
      this.finger.setVisible(false);
      return;
    }

    // Flip upside-down so the tip points at the target (nav buttons, Xal portrait).
    const pointDown = target === 'tomesNav' || target === 'outlookNav' || target === 'xal';
    aimFinger(this.finger, pointDown);

    let x = 0;
    let y = 0;
    switch (target) {
      case 'chapter': {
        const p = this.map.chapterCardCenter();
        x = p.x;
        // Sit under the title so the glove doesn't cover Chapter / name.
        y = p.y + 52;
        break;
      }
      case 'tomesNav': {
        const p = this.nav.navButtonCenter('shop');
        if (p) {
          x = p.x;
          y = p.y - 56;
        }
        break;
      }
      case 'natureRow': {
        if (this.natureRow) {
          const m = this.natureRow.getWorldTransformMatrix();
          x = m.tx;
          // Sit on the lower half so the glove doesn't cover the tome name.
          y = m.ty + 48;
        }
        break;
      }
      case 'xal': {
        const { width, height } = this.scale;
        const playMid = (height - NAV_H) / 2;
        x = width / 2;
        // Sit above the portrait so the flipped glove points down at Xal, not over his face.
        y = playMid - 56;
        break;
      }
      case 'outlookNav': {
        const p = this.nav.navButtonCenter('outlook');
        if (p) {
          x = p.x;
          y = p.y - 56;
        }
        break;
      }
      case 'cast': {
        const bounds = this.outlook.spawnBounds();
        x = bounds.x + bounds.w / 2;
        y = bounds.y + bounds.h / 2;
        break;
      }
    }
    this.finger.setPosition(x, y);
    this.finger.setVisible(true);
  }

  private renderAchievements(): void {
    renderRewardsPanel({
      scene: this,
      panel: this.panel,
      ctx: this.ctx,
      rewardsScroll: this.rewardsScroll,
      onScroll: (scroll) => {
        this.rewardsScroll = scroll;
      },
      onAchievementClaim: (info) => {
        this.splash.open('achievement', {
          build: buildAchievementSplash({
            title: info.title,
            description: info.description,
            iconKey: info.iconKey,
            before: info.before,
            after: info.after,
          }),
        });
      },
      rerender: () => this.setTab('achievements', true),
    });
  }

  private renderSettings(): void {
    renderSettingsPanel({
      scene: this,
      panel: this.panel,
      ctx: this.ctx,
      onCredits: () => showCreditsModal(this, this.panel),
      onNewGame: () => this.onNewGame(),
    });
  }

  private onPortalTravel(region: RegionId): void {
    if (this.ctx.state.region === region) return;
    this.ctx.state.region = region;
    this.ctx.economy.drainMana(this.ctx.state);
    this.ctx.spawn.clear();
    this.outlook.applyRegionVisual();
    this.ctx.audio.playSfx('cast');
    this.setTab('outlook', true);
  }

  private openBuffSplash(): void {
    this.splash.open('buff', {
      build: buildBuffSplash(() => {
        if (this.ctx.economy.acceptBuffOffer(this.ctx.state)) {
          this.ctx.audio.playSfx('buff');
          this.lastBuff = this.ctx.state.buffRemaining;
        }
        this.ctx.persist();
      }),
    });
  }

  private onNewGame(): void {
    this.splash.open('newGame', { build: buildNewGameSplash(() => this.confirmNewGame()) });
  }

  private confirmNewGame(): void {
    this.ctx.reset();
    this.lastBuff = 0;
    this.levelJinglePlayed = false;
    this.shopScroll = 0;
    this.rewardsScroll = 0;
    this.splash.dismiss();
    this.outlook.applyRegionVisual();
    this.applyNavLock();
    this.setTab('scene', true);
  }

  private openLevelUpSplash(): void {
    if (this.splash.isOpen()) return;
    if (!this.ctx.economy.readyToLevelUp(this.ctx.state) || this.ctx.story.reading) return;
    this.ctx.audio.playSfx('levelup');
    const reward = this.ctx.economy.levelReward(this.ctx.state);
    this.splash.open('levelUp', {
      build: buildLevelUpSplash(reward, () => {
        if (this.ctx.economy.levelUp(this.ctx.state)) {
          this.refreshChapterCard();
          this.ctx.persist();
        }
      }),
    });
  }

  private refreshHud(): void {
    this.hud.setLevelReady(
      this.ctx.economy.readyToLevelUp(this.ctx.state) && !this.ctx.story.reading,
    );
    this.hud.refresh();
    this.nav.refreshBadges(this.ctx.story.reading);
  }

  private showToast(msg: string): void {
    this.toastText.setText(msg);
    const padX = 10;
    const padY = 6;
    const w = this.toastText.width + padX * 2;
    const h = this.toastText.height + padY * 2;
    this.toastBg.clear();
    this.toastBg.fillStyle(0x000000, 0.85);
    this.toastBg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.tweens.killTweensOf(this.toast);
    this.toast.setAlpha(1);
    this.tweens.add({
      targets: this.toast,
      alpha: 0,
      delay: 2200,
      duration: 500,
    });
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
