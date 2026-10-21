import Phaser from 'phaser';
import { getContext } from '../game/GameContext';
import { formatNumber } from '../utils/format';
import type { RegionId, TabId } from '../types';
import { HudOverlay } from '../hud/HudOverlay';
import type { RewardId } from '../hud/panels';
import { XalView } from './play/xal/XalView';
import { NewsBanner } from './play/outlook/NewsBanner';
import { PegasusFlyby } from './play/outlook/PegasusFlyby';
import { BarlogView } from './play/outlook/BarlogView';
import { OutlookView } from './play/outlook/OutlookView';
import { playCastBurst } from './play/outlook/creatureMagic';

export class PlayScene extends Phaser.Scene {
  private ctx = getContext();
  private tab: TabId = 'outlook';
  /** Tab the tutorial had open before Settings, so a second tap returns there. */
  private tutorialReturnTab: TabId = 'scene';
  /** Tutorial line already shown. Leaving Settings must not advance it. */
  private tutorialLine: string | null = null;
  private hud!: HudOverlay;
  private xal!: XalView;
  private outlook!: OutlookView;
  private news!: NewsBanner;
  private barlog!: BarlogView;
  private lastBuff = 0;
  private levelJinglePlayed = false;
  private saveTimer = 0;
  private passiveSpawnTimer = 0;
  private ignoreCastUntil = 0;
  private banterTimer?: Phaser.Time.TimerEvent;
  private persistHidden!: () => void;
  private persistPageHide!: () => void;
  private onFrozenResume!: () => void;
  private onPageShow!: (e: PageTransitionEvent) => void;
  private onResizeBound!: () => void;
  private layoutW = 0;
  private layoutH = 0;
  private pegasus!: PegasusFlyby;

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
    this.news = new NewsBanner(this);
    this.news.build();
    this.barlog = new BarlogView(this, (pointer) => this.onBarlogTap(pointer));
    this.barlog.build();
    this.xal = new XalView(this, (pointer) => {
      this.ignoreCastUntil = this.time.now + 50;
      this.onPortraitTap(pointer);
    });
    this.xal.build();
    this.xal.setPortalTravelHandler((region) => this.onPortalTravel(region));

    this.pegasus = new PegasusFlyby(this, () => this.onPegasusTap());
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.blocked() || this.tab !== 'outlook') return;
      if (this.pegasus.hits(pointer.x, pointer.y)) return;
      if (!this.outlook.canCast(pointer, this.ignoreCastUntil)) return;
      this.castAt(pointer.x, pointer.y);
    });

    this.hud = new HudOverlay(this.game.canvas.parentElement ?? document.getElementById('game')!, this.ctx, {
      onTab: (tab) => this.setTab(tab),
      onLevelTap: () => this.openLevelUpSplash(),
      onNewGame: () => this.onNewGame(),
      onJump: (state) => {
        this.ctx.replace(state);
        this.restartPlay();
      },
      onBuyHelper: (id) => this.buyHelper(id),
      onClaimReward: (info) => {
        this.hud.showAchievementSplash({
          description: info.description,
          iconKey: info.iconKey,
          before: info.before,
          after: info.after,
        });
      },
      onChapter: () => this.onChapterButton(),
      onStoryBack: () => this.onStoryBack(),
      claimReward: (id) => this.claimReward(id),
    });
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
      this.hud.destroy();
      this.pegasus.destroy();
      this.ctx.audio.attach(null);
      this.ctx.spawn.clear();
    });

    const ch1 = this.ctx.state.chapters.find((c) => c.id === 1);
    const startTab: TabId = ch1 && !ch1.sceneViewed ? 'scene' : 'outlook';
    this.setTab(startTab, true);

    if (this.ctx.story.reading && this.ctx.story.activeChapter?.id !== 6) {
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
    this.hud.showInfluenceSplash(pending, () => {
      this.ctx.economy.addInfluence(this.ctx.state, pending);
      this.ctx.state.pendingOffline = 0;
      this.ctx.offlineGained = 0;
      this.ctx.persist();
      this.refreshHud();
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

    if (
      this.tab === 'outlook' &&
      !this.barlog.active() &&
      !this.ctx.tutorial.shouldPausePassive(this.ctx.state)
    ) {
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

    const bounds = this.outlook.spawnBounds();
    const pending = this.ctx.state.buffOfferPending;
    this.pegasus.sync({
      pending,
      flying: pending && this.tab === 'outlook' && !this.blocked(),
      showPointer: !this.ctx.state.buffEverCollected,
      bounds,
    });
    this.pegasus.tick(dt, bounds);
    this.maybeStartBarlog();
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
    this.news.tick(
      this.ctx.state,
      this.tab === 'outlook' &&
        !this.blocked() &&
        this.ctx.tutorial.isTabAllowed(this.ctx.state, 'outlook'),
      this.time.now,
    );
  }

  private castAt(x: number, y: number): void {
    const gained = this.ctx.economy.tryCast(this.ctx.state);
    if (gained <= 0) {
      this.showToast('Not enough mana');
      return;
    }
    this.ctx.audio.playSfx('cast', 0.35);
    playCastBurst(this, x, y, `+${formatNumber(gained)}`);
    this.hud.pulseInfluence();
    this.ctx.spawn.schedule(this.ctx.state, { delay: 0 });
  }

  private onCreatureTap(hit: {
    sprite: Phaser.GameObjects.Image;
    magic: boolean;
    setMagic: () => void;
    hideCreature: () => void;
  }): void {
    if (this.blocked()) return;
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
    playCastBurst(this, hit.sprite.x, hit.sprite.y, `+${formatNumber(gained)}`);
    this.hud.pulseInfluence();
  }

  private onPortraitTap(pointer?: Phaser.Input.Pointer): void {
    if (pointer && this.hud.hitsHud(pointer)) return;
    if (this.tab !== 'scene') return;

    if (this.ctx.story.reading) {
      const finishingCh1 = this.ctx.story.activeChapter?.id === 1;
      const result = this.ctx.story.advance(this.ctx.state);
      if (result.regionChanged) {
        this.outlook.applyRegionVisual();
        this.ctx.spawn.clear();
      }
      if (result.finished) {
        this.xal.hideQuote();
        this.syncStoryBack();
        this.xal.setPortraitExpression('generic');
        this.refreshChapterCard();
        const chId = result.finishedChapterId;
        if (chId === 7) {
          this.hud.showEndGameSplash(() => this.hud.showCreditsSplash());
        } else if (chId != null && chId >= 2 && chId <= 4) {
          const lvl = this.ctx.state.manaLevel;
          this.hud.showAchievementSplash({
            description: 'Your maximum mana has doubled.',
            iconKey: 'ui-mana-icon',
            before: `${(lvl - 1) * 100}`,
            after: `${lvl * 100}`,
          });
        } else if (result.portalJustUnlocked) {
          this.hud.showPortalSplash();
        }
        if (finishingCh1) {
          this.ctx.tutorial.startAfterChapter1(this.ctx.state);
          const line = this.ctx.tutorial.advanceLine(this.ctx.state, this.ctx.economy);
          if (line) this.showTutorialLine(line);
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
        this.showTutorialLine(line);
      } else if (!this.ctx.tutorial.waitingNature) {
        this.tutorialLine = null;
        this.xal.hideQuote();
      }
      this.applyNavLock();
      this.refreshTutorialPointers();
      return;
    }

    // Banter only after the tutorial tour is done.
    if (!this.ctx.state.tutorialCompleted) return;

    this.clearBanterTimer();
    this.xal.setPortraitExpression('angry');
    this.xal.showQuote(this.ctx.story.banterLine());
    this.banterTimer = this.time.delayedCall(5000, () => {
      this.xal.hideQuote();
      this.xal.setPortraitExpression('generic');
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

  private blocked(): boolean {
    return this.hud.isSplashOpen() || this.barlog.active();
  }

  private chapterOnXal() {
    const next = this.nextChapter();
    return {
      next,
      visible: !!next && next.id !== 6 && this.tab === 'scene' && !this.ctx.story.reading,
    };
  }

  private showBarlogLine(): void {
    const line = this.ctx.story.currentLine();
    if (line) this.barlog.showQuote(line.text);
    this.syncStoryBack();
  }

  private refreshChapterCard(): void {
    const { next, visible } = this.chapterOnXal();
    this.hud.setChapter(
      next,
      next ? !this.ctx.story.canStart(this.ctx.state, next.id) : false,
      visible,
    );
    this.xal.refreshPortalBar(
      this.ctx.state.portalUnlocked,
      this.tab === 'scene' && !this.ctx.story.reading && !visible,
      this.ctx.state.region,
    );
  }

  private onStoryBack(): void {
    if (!this.ctx.story.retreat()) return;
    if (this.barlog.active()) this.showBarlogLine();
    else this.renderQuote();
  }

  private renderQuote(): void {
    const line = this.ctx.story.currentLine();
    if (!line) return;
    this.clearBanterTimer();
    this.xal.showQuote(line.text);
    this.hud.setChapter(undefined, false, false);
    this.xal.refreshPortalBar(false, false, this.ctx.state.region);
    if (line.speaker !== 'barlog') {
      this.xal.setPortraitExpression(line.expression);
    }
    this.syncStoryBack();
  }

  private syncStoryBack(): void {
    this.hud.setStoryBack(
      this.ctx.story.reading &&
        this.ctx.story.quoteIndex > 0 &&
        (this.barlog.active() || this.tab === 'scene'),
    );
  }

  private showTutorialLine(line: string): void {
    this.tutorialLine = line;
    this.xal.showQuote(line);
    this.xal.setPortraitExpression('generic');
  }

  /** Unity SelectView: re-tapping active tab returns to Outlook. */
  private setTab(tab: TabId, force = false): void {
    if (
      !force &&
      (this.barlog.active() || !this.ctx.tutorial.isTabAllowed(this.ctx.state, tab))
    ) {
      return;
    }

    if (!force && this.tab === tab) {
      if (!this.ctx.state.tutorialCompleted) {
        if (tab !== 'settings') return;
        tab = this.tutorialReturnTab === 'settings' ? 'scene' : this.tutorialReturnTab;
      } else {
        tab = 'outlook';
      }
    }

    if (!this.ctx.state.tutorialCompleted && tab === 'settings' && this.tab !== 'settings') {
      this.tutorialReturnTab = this.tab;
    }

    if (this.hud.isSplashOpen()) this.hud.dismissSplash();
    if (tab === 'outlook' && this.ctx.tutorial.outlookTutorial) {
      this.ctx.tutorial.dismissOutlookTutorial(this.ctx.state);
      this.tutorialLine = null;
      this.ctx.persist();
    }

    this.clearBanterTimer();
    if (tab !== 'scene') this.xal.hideQuote();

    this.tab = tab;
    this.syncStoryBack();
    this.hud.setActive(tab);
    if (tab !== 'shop' && tab !== 'achievements' && tab !== 'settings') this.hud.clearStage();
    this.ctx.audio.playSfx('pop', 0.35);

    this.outlook.setVisible(tab !== 'scene');
    this.xal.setVisible(tab === 'scene');

    if (tab === 'outlook') {
      this.hud.setChapter(undefined, false, false);
      this.xal.refreshPortalBar(false, false, this.ctx.state.region);
      this.maybeStartBarlog();
      if (!this.barlog.active()) {
        this.ctx.audio.playRegion(this.ctx.state.region);
      }
      this.applyNavLock();
      this.refreshTutorialPointers();
      return;
    }

    if (tab === 'scene') {
      this.xal.fitPortrait();
      this.ctx.spawn.clear();
      this.ctx.audio.playBgm('xals-theme');
      if (this.ctx.story.reading) this.renderQuote();
      else {
        this.refreshChapterCard();
        if (this.tutorialLine && !this.ctx.state.tutorialCompleted) {
          this.xal.showQuote(this.tutorialLine);
          this.xal.setPortraitExpression('generic');
        }
      }
      this.applyNavLock();
      this.refreshTutorialPointers();
      return;
    }

    this.hud.setChapter(undefined, false, false);
    this.xal.refreshPortalBar(false, false, this.ctx.state.region);
    this.ctx.spawn.clear();
    if (tab === 'shop') this.hud.showTomes();
    if (tab === 'achievements') this.hud.showRewards();
    if (tab === 'settings') this.hud.showSettings();

    this.applyNavLock();
    this.refreshTutorialPointers();
  }

  private buyHelper(id: string): void {
    if (this.ctx.economy.buyHelper(this.ctx.state, id)) {
      this.ctx.audio.playSfx('coin');
      const owned = this.ctx.state.helpers.find((hh) => hh.id === id);
      this.ctx.tutorial.onNaturePurchased(this.ctx.state);
      this.hud.showTomes();
      if (owned?.amountOwned === 1) {
        const def = this.ctx.economy.def(id);
        const creature = def && this.ctx.spawn.creatures.find((c) => c.id === def.creatureId);
        if (creature) {
          this.hud.showCreatureSplash(creature);
        }
      }
    } else {
      this.showToast('Not enough influence');
    }
  }

  private claimReward(id: RewardId): boolean {
    switch (id) {
      case 'helper':
        return this.ctx.economy.claimHelper(this.ctx.state);
      case 'clicker':
        return this.ctx.economy.claimClicker(this.ctx.state);
      case 'meta':
        return this.ctx.economy.claimMeta(this.ctx.state);
      case 'login':
        return this.ctx.economy.claimLogin(this.ctx.state);
      case 'story':
        return this.ctx.economy.claimStory(this.ctx.state);
    }
  }

  private applyNavLock(): void {
    this.hud.setTabAllowed((tab) =>
      this.barlog.active() ? false : this.ctx.tutorial.isTabAllowed(this.ctx.state, tab),
    );
  }

  private maybeStartBarlog(): void {
    if (this.blocked() || this.tab !== 'outlook') return;
    if (this.ctx.offlineGained > 0) return;
    const already = this.ctx.story.reading && this.ctx.story.activeChapter?.id === 6;
    if (!already) {
      if (this.ctx.story.reading) return;
      const next = this.nextChapter();
      if (next?.id !== 6 || !this.ctx.story.start(this.ctx.state, 6)) return;
    }
    this.ctx.spawn.clear();
    this.ctx.audio.playBgm('barlogs-theme');
    this.hud.setStoryBack(false);
    this.barlog.begin(() => this.showBarlogLine());
    this.applyNavLock();
  }

  private onBarlogTap(pointer?: Phaser.Input.Pointer): void {
    if (pointer && this.hud.hitsHud(pointer)) return;
    if (!this.ctx.story.reading) return;
    const result = this.ctx.story.advance(this.ctx.state);
    if (result.regionChanged) {
      this.outlook.applyRegionVisual();
      this.ctx.spawn.clear();
    }
    if (result.finished) {
      this.refreshChapterCard();
      this.hud.setStoryBack(false);
      this.barlog.fadeOut(() => {
        this.applyNavLock();
        if (this.tab === 'outlook') this.ctx.audio.playRegion(this.ctx.state.region);
      });
      return;
    }
    this.showBarlogLine();
  }

  private refreshTutorialPointers(): void {
    if (this.barlog.active()) {
      this.hud.setFinger(false, 0, 0, false);
      return;
    }
    const { visible: chapterVisible } = this.chapterOnXal();
    const onSettings = this.tab === 'settings' && !this.ctx.state.tutorialCompleted;
    let target = this.ctx.tutorial.pointerTarget(
      this.ctx.state,
      onSettings ? this.tutorialReturnTab : this.tab,
      this.ctx.story.reading,
      this.tab === 'shop',
      onSettings ? false : chapterVisible,
    );
    if (onSettings) {
      if (target === 'natureRow') target = 'tomesNav';
      else if (target === 'cast') target = 'outlookNav';
      else if (target === 'xal' || target === 'chapter') target = 'sceneNav';
      else if (target === 'none') {
        target =
          this.tutorialReturnTab === 'shop'
            ? 'tomesNav'
            : this.tutorialReturnTab === 'outlook'
              ? 'outlookNav'
              : 'sceneNav';
      }
    }
    if (target === 'xal' && this.xal.quoteVisible()) {
      this.hud.setFinger(false, 0, 0, false);
      return;
    }

    if (target === 'none') {
      const s = this.ctx.state;
      const firstLevelUp =
        s.playerLevel === 1 &&
        !this.ctx.story.reading &&
        !this.hud.isSplashOpen() &&
        this.ctx.economy.readyToLevelUp(s);
      if (!firstLevelUp) {
        this.hud.setFinger(false, 0, 0, false);
        return;
      }
      const p = this.hud.levelChipCenter();
      this.hud.setFinger(true, p.x, p.y + 36, false);
      return;
    }

    const pointDown =
      target === 'tomesNav' || target === 'outlookNav' || target === 'sceneNav' || target === 'xal';
    let x = 0;
    let y = 0;
    switch (target) {
      case 'chapter': {
        const p = this.hud.chapterCardCenter();
        x = p.x;
        y = p.y + 28;
        break;
      }
      case 'tomesNav':
      case 'sceneNav': {
        const p = this.hud.navButtonCenter(target === 'sceneNav' ? 'scene' : 'shop');
        if (p) {
          x = p.x;
          y = p.y - 56;
        }
        break;
      }
      case 'natureRow': {
        const p = this.hud.natureRowCenter();
        if (p) {
          x = p.x;
          y = p.y + 24;
        }
        break;
      }
      case 'xal': {
        const { width, height } = this.scale;
        x = width / 2;
        y = height / 2 - 56;
        break;
      }
      case 'outlookNav': {
        const p = this.hud.navButtonCenter('outlook');
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
    this.hud.setFinger(true, x, y, pointDown);
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

  private onPegasusTap(): void {
    if (this.blocked() || !this.ctx.state.buffOfferPending) return;
    this.ignoreCastUntil = this.time.now + 50;
    this.openBuffSplash();
  }

  private openBuffSplash(): void {
    this.hud.showBuffSplash(() => {
      if (this.ctx.economy.acceptBuffOffer(this.ctx.state)) {
        this.ctx.audio.playSfx('buff');
        this.lastBuff = this.ctx.state.buffRemaining;
      }
      this.ctx.persist();
    });
  }

  private onNewGame(): void {
    this.hud.showNewGameSplash(() => this.confirmNewGame());
  }

  private confirmNewGame(): void {
    this.ctx.reset();
    this.restartPlay();
  }

  private restartPlay(): void {
    this.barlog.hide();
    this.news.hide();
    this.lastBuff = 0;
    this.levelJinglePlayed = false;
    this.hud.dismissSplash();
    this.outlook.applyRegionVisual();
    this.applyNavLock();
    this.setTab('scene', true);
  }

  private openLevelUpSplash(): void {
    if (this.hud.isSplashOpen()) return;
    if (!this.ctx.economy.readyToLevelUp(this.ctx.state) || this.ctx.story.reading) return;
    this.ctx.audio.playSfx('levelup');
    const reward = this.ctx.economy.levelReward(this.ctx.state);
    this.hud.showLevelUpSplash(reward, () => {
      if (this.ctx.economy.levelUp(this.ctx.state)) {
        this.refreshChapterCard();
        this.ctx.persist();
      }
    });
  }

  private refreshHud(): void {
    this.hud.refresh(
      this.ctx.economy.readyToLevelUp(this.ctx.state) && !this.ctx.story.reading,
      this.ctx.story.reading,
      this.chapterReady(),
    );
  }

  /** Unity SceneManager.ManageExclamationPoint — next unread chapter startable, not ch1. */
  private chapterReady(): boolean {
    if (this.ctx.story.reading) return false;
    if (this.ctx.state.playerLevel === 1) return false;
    if (this.ctx.tutorial.isEarlyMapLock(this.ctx.state)) return false;
    const next = this.nextChapter();
    return !!next && next.id !== 6 && this.ctx.story.canStart(this.ctx.state, next.id);
  }

  private showToast(msg: string): void {
    this.hud.showToast(msg);
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
