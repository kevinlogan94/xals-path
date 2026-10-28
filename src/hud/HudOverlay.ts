import './blighted-scroll.css';
import type { GameContext } from '../game/GameContext';
import type { ChapterDef, CreatureDef, GameSave, TabId } from '../types';
import { formatNumber } from '../utils/format';
import {
  NAV,
  bestiaryHtml,
  bindBestiary,
  bindRewards,
  bindSettings,
  bindTomes,
  chapterHtml,
  claimInfo,
  creditsHtml,
  openFeedback,
  rewardsHtml,
  settingsHtml,
  syncTomes,
  tomesHtml,
  unlockedCreatureCount,
  type AchievementClaimInfo,
  type RewardId,
  type RewardsSubTab,
} from './panels';
import {
  achievementSplash,
  bindCreature,
  bindCreatureInspect,
  bindCredits,
  bindEndGame,
  bindSimple,
  buffSplash,
  endGameSplash,
  feedbackSplash,
  influenceSplash,
  levelUpSplash,
  newGameSplash,
  portalSplash,
  whatsNewSplash,
  type SplashBind,
} from './splashes';
import { ACHIEVEMENTS, WHATS_NEW_IDS, type AchievementDef } from '../systems/AchievementSystem';

export type HudOverlayHandlers = {
  onTab: (tab: TabId) => void;
  onOpenAchievements: () => void;
  onOpenBestiary: () => void;
  onCloseBestiary: () => void;
  onLevelTap: () => void;
  onNewGame: () => void;
  onJump: (state: GameSave) => void;
  onBuyHelper: (id: string) => void;
  onClaimReward: (info: AchievementClaimInfo) => void;
  onChapter: () => void;
  onStoryBack: () => void;
  claimReward: (id: RewardId) => boolean;
};

export class HudOverlay {
  readonly root: HTMLElement;
  private readonly hudCrystal: HTMLElement;
  private readonly hudAmt: HTMLElement;
  private readonly hudRate: HTMLElement;
  private readonly hudLvl: HTMLElement;
  private readonly hudUp: HTMLElement;
  private readonly xpFill: HTMLElement;
  private readonly manaFill: HTMLElement;
  private readonly manaBar: HTMLElement;
  private readonly buff: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly toast: HTMLElement;
  private readonly achBanner: HTMLButtonElement;
  private readonly achBannerIcon: HTMLImageElement;
  private readonly achBannerTitle: HTMLElement;
  private readonly finger: HTMLImageElement;
  private readonly splash: HTMLElement;
  private readonly storyBack: HTMLButtonElement;
  private readonly bookcase: HTMLButtonElement;
  private readonly bookcaseCount: HTMLElement;
  private readonly bookcaseDot: HTMLElement;
  private toastTimer = 0;
  private achBannerTimer = 0;
  private achQueue: AchievementDef[] = [];
  private achBannerActive = false;
  private splashCleanup: (() => void) | null = null;
  private view: TabId | 'credits' | 'bestiary' | null = null;
  private rewardsSubTab: RewardsSubTab = 'milestones';
  private tabAllowed: (tab: TabId) => boolean = () => true;

  constructor(
    parent: HTMLElement,
    private readonly ctx: GameContext,
    private readonly handlers: HudOverlayHandlers,
  ) {
    parent.querySelector('#hud-root')?.remove();
    this.root = document.createElement('div');
    this.root.id = 'hud-root';
    this.root.className = 'hud-root';
    this.root.innerHTML = `
      <div class="env-vignette-top"></div>
      <div class="env-vignette-bottom"></div>
      <header class="scroll-hud">
        <img class="hud-crystal" src="./assets/ui/influence.png" alt="" />
        <div class="hud-influence">
          <div class="hud-count" data-amt>0</div>
          <div class="hud-rate" data-rate>+0/sec</div>
        </div>
        <button type="button" class="hud-level" data-level>
          <div class="hud-level-row">
            <span class="hud-lvl" data-lvl>LVL 1</span>
            <span class="hud-up" data-up hidden>! LVL UP</span>
          </div>
          <div class="hud-bar"><img src="./assets/ui/star.png" alt="" /><div class="hud-track"><div class="hud-fill xp" data-xp></div></div></div>
          <div class="hud-bar" data-mana-bar><img src="./assets/ui/manaIcon.png" alt="" /><div class="hud-track"><div class="hud-fill mana" data-mana></div></div></div>
          <div class="hud-buff" data-buff hidden></div>
        </button>
      </header>
      <div class="hud-stage" data-stage></div>
      <button type="button" class="bookcase-hotspot" data-bookcase hidden aria-label="Open Bestiarum">
        <span class="bookcase-shimmer-aura"></span>
        <span class="glowing-spine-1"></span>
        <span class="glowing-spine-2"></span>
        <span class="bookcase-mote m1"></span>
        <span class="bookcase-mote m2"></span>
        <span class="bookcase-mote m3"></span>
        <span class="bookcase-plaque">
          <img src="./assets/ui/Tomes.png" alt="" />
          <span class="bookcase-plaque-title">Bestiarum</span>
          <span class="bookcase-plaque-count" data-bookcase-count>0/10</span>
          <span class="bookcase-new-dot" data-bookcase-dot hidden>!</span>
        </span>
      </button>
      <button type="button" class="scroll-card back-btn story-back" data-story-back hidden>Back</button>
      <nav class="nav-dock">${NAV.map(
        (n) =>
          `<button type="button" class="nav-btn" data-tab="${n.id}"><img src="${n.icon}" alt="" /><span>${n.label}</span><span class="nav-dot" data-dot="${n.id}" hidden>!</span></button>`,
      ).join('')}</nav>
      <div class="hud-toast" data-toast></div>
      <button type="button" class="ach-banner" data-ach-banner hidden>
        <img class="ach-banner-icon" data-ach-banner-icon src="./assets/ui/trophy.png" alt="" />
        <div class="ach-banner-copy">
          <span class="ach-banner-kicker">Achievement Unlocked</span>
          <span class="ach-banner-title" data-ach-banner-title></span>
        </div>
      </button>
      <img class="hud-finger" data-finger src="./assets/ui/pointer.png" alt="" hidden />
      <div class="splash-layer" data-splash hidden></div>
    `;
    parent.append(this.root);
    this.hudCrystal = this.root.querySelector('.hud-crystal')!;
    this.hudAmt = this.root.querySelector('[data-amt]')!;
    this.hudRate = this.root.querySelector('[data-rate]')!;
    this.hudLvl = this.root.querySelector('[data-lvl]')!;
    this.hudUp = this.root.querySelector('[data-up]')!;
    this.xpFill = this.root.querySelector('[data-xp]')!;
    this.manaFill = this.root.querySelector('[data-mana]')!;
    this.manaBar = this.root.querySelector('[data-mana-bar]')!;
    this.buff = this.root.querySelector('[data-buff]')!;
    this.stage = this.root.querySelector('[data-stage]')!;
    this.toast = this.root.querySelector('[data-toast]')!;
    this.achBanner = this.root.querySelector('[data-ach-banner]')!;
    this.achBannerIcon = this.root.querySelector('[data-ach-banner-icon]')!;
    this.achBannerTitle = this.root.querySelector('[data-ach-banner-title]')!;
    this.finger = this.root.querySelector('[data-finger]')!;
    this.splash = this.root.querySelector('[data-splash]')!;
    this.storyBack = this.root.querySelector('[data-story-back]')!;
    this.bookcase = this.root.querySelector('[data-bookcase]')!;
    this.bookcaseCount = this.root.querySelector('[data-bookcase-count]')!;
    this.bookcaseDot = this.root.querySelector('[data-bookcase-dot]')!;

    this.bookcase.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.bookcase.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handlers.onOpenBestiary();
    });

    this.achBanner.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.achBanner.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.clearAchBanner();
      this.rewardsSubTab = 'achievements';
      this.handlers.onOpenAchievements();
    });
    this.root.querySelector('[data-level]')?.addEventListener('click', () => this.handlers.onLevelTap());
    this.storyBack.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.storyBack.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handlers.onStoryBack();
    });
    this.root.querySelectorAll<HTMLElement>('[data-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as TabId;
        if (!this.tabAllowed(tab)) return;
        this.handlers.onTab(tab);
      });
    });
  }

  destroy(): void {
    window.clearTimeout(this.toastTimer);
    window.clearTimeout(this.achBannerTimer);
    this.dismissSplash();
    this.root.remove();
  }

  isSplashOpen(): boolean {
    return !this.splash.hidden;
  }

  isAchBannerOpen(): boolean {
    return this.achBannerActive || this.achQueue.length > 0;
  }

  setStoryBack(on: boolean): void {
    this.storyBack.hidden = !on;
  }

  /** Phaser still sees pointer coords when the click landed on HTML HUD chrome. */
  hitsHud(pointer: { x: number; y: number; event?: Event }): boolean {
    const ev = pointer.event as MouseEvent | TouchEvent | undefined;
    let cx: number;
    let cy: number;
    if (ev && 'clientX' in ev) {
      cx = ev.clientX;
      cy = ev.clientY;
    } else if (ev && 'changedTouches' in ev && ev.changedTouches[0]) {
      cx = ev.changedTouches[0].clientX;
      cy = ev.changedTouches[0].clientY;
    } else {
      const canvas = this.root.parentElement?.querySelector('canvas');
      if (!canvas) return false;
      const cr = canvas.getBoundingClientRect();
      cx = cr.left + (pointer.x / canvas.clientWidth) * cr.width;
      cy = cr.top + (pointer.y / canvas.clientHeight) * cr.height;
    }
    const hit = document.elementFromPoint(cx, cy);
    return !!hit && hit !== this.root && this.root.contains(hit);
  }

  dismissSplash(): void {
    this.splashCleanup?.();
    this.splashCleanup = null;
    this.splash.hidden = true;
    this.splash.replaceChildren();
  }

  private openSplash(html: string, bind: SplashBind): void {
    this.dismissSplash();
    this.splash.hidden = false;
    this.splash.innerHTML = html;
    const close = () => {
      this.dismissSplash();
      this.ctx.audio.playSfx('pop', 0.35);
    };
    this.splashCleanup = bind(this.splash, close);
  }

  showInfluenceSplash(amount: number, onCollect: () => void): void {
    this.openSplash(influenceSplash(amount), bindSimple(onCollect));
  }

  showAchievementSplash(opts: {
    description: string;
    iconKey?: string;
    before?: string;
    after?: string;
  }): void {
    this.openSplash(achievementSplash(opts), bindSimple());
  }

  showBuffSplash(onCollect: () => void): void {
    this.openSplash(buffSplash(), bindSimple(onCollect));
  }

  showNewGameSplash(onConfirm: () => void): void {
    this.openSplash(newGameSplash(), bindSimple(onConfirm));
  }

  showPortalSplash(): void {
    this.openSplash(portalSplash(), bindSimple());
  }

  showLevelUpSplash(reward: number, onContinue: () => void): void {
    this.openSplash(levelUpSplash(reward), bindSimple(onContinue));
  }

  showFeedbackSplash(): void {
    this.openSplash(
      feedbackSplash(),
      bindSimple(() => openFeedback('level11', this.ctx.state.playerLevel)),
    );
  }

  showEndGameSplash(onCredits: () => void): void {
    this.openSplash(
      endGameSplash(),
      bindEndGame(onCredits, () => openFeedback('endgame', this.ctx.state.playerLevel)),
    );
  }

  showCreatureSplash(creature: CreatureDef): void {
    this.openSplash('', bindCreature(creature));
  }

  showCreatureInspectSplash(creature: CreatureDef): void {
    const def = this.ctx.economy.def(creature.helperId);
    this.openSplash('', bindCreatureInspect(creature, def?.name ?? creature.helperId));
  }

  isBestiaryOpen(): boolean {
    return this.view === 'bestiary';
  }

  setBookcaseVisible(visible: boolean): void {
    this.bookcase.hidden = !visible || this.view === 'bestiary';
    if (!this.bookcase.hidden) {
      const count = unlockedCreatureCount(this.ctx);
      const total = this.ctx.spawn.creatures.length;
      this.bookcaseCount.textContent = `${count}/${total}`;
      this.bookcaseDot.hidden = count <= this.ctx.state.bestiarySeenCount;
    }
  }

  showBestiary(): void {
    this.view = 'bestiary';
    this.bookcase.hidden = true;
    const count = unlockedCreatureCount(this.ctx);
    if (count > this.ctx.state.bestiarySeenCount) {
      this.ctx.state.bestiarySeenCount = count;
      this.ctx.persist();
    }
    this.stage.innerHTML = bestiaryHtml(this.ctx);
    bindBestiary(
      this.stage,
      this.ctx,
      (creature) => {
        this.ctx.audio.playSfx('pop', 0.35);
        this.showCreatureInspectSplash(creature);
      },
      () => this.handlers.onCloseBestiary(),
    );
  }

  showCreditsSplash(): void {
    this.openSplash(
      creditsHtml(),
      bindCredits(() => openFeedback('credits', this.ctx.state.playerLevel)),
    );
  }

  showWhatsNewSplash(unseenOnly = false, onDismiss?: () => void): void {
    const unlockedSet = new Set(this.ctx.state.unlockedAchievements);
    const achievementsUnlocked = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;
    const creaturesUnlocked = unlockedCreatureCount(this.ctx);
    const unseen = WHATS_NEW_IDS.filter((id) => !this.ctx.state.whatsNewSeen.includes(id));
    const unseenIds = unseenOnly && unseen.length > 0 ? unseen : [...WHATS_NEW_IDS];
    this.openSplash(
      whatsNewSplash({
        unseenIds,
        creaturesUnlocked,
        creaturesTotal: this.ctx.spawn.creatures.length,
        achievementsUnlocked,
        achievementsTotal: ACHIEVEMENTS.length,
        canViewBestiary: this.tabAllowed('scene'),
        canViewAchievements: this.tabAllowed('achievements'),
      }),
      (host, close) => {
        const closeAndMark = () => {
          onDismiss?.();
          close();
        };
        host.querySelector('[data-whats-new-bestiary]')?.addEventListener('click', () => {
          closeAndMark();
          this.handlers.onOpenBestiary();
        });
        host.querySelector('[data-whats-new-achievements]')?.addEventListener('click', () => {
          closeAndMark();
          this.rewardsSubTab = 'achievements';
          this.handlers.onOpenAchievements();
        });
        host.querySelector('[data-splash-close]')?.addEventListener('click', closeAndMark);
        return () => undefined;
      },
    );
  }

  clearAchBanner(): void {
    this.achQueue.length = 0;
    this.hideAchBanner();
  }

  enqueueAchievements(items: AchievementDef[]): void {
    if (items.length === 0) return;
    this.achQueue.push(...items);
    if (this.view === 'achievements') {
      this.showRewards(this.rewardsSubTab);
    }
    if (!this.achBannerActive) {
      this.nextAchBanner();
    }
  }

  private hideAchBanner(): void {
    window.clearTimeout(this.achBannerTimer);
    this.achBannerActive = false;
    this.achBanner.classList.remove('is-on');
    this.achBanner.hidden = true;
  }

  private nextAchBanner(): void {
    window.clearTimeout(this.achBannerTimer);
    const next = this.achQueue.shift();
    if (!next) {
      this.hideAchBanner();
      return;
    }
    this.achBannerActive = true;
    this.achBannerIcon.src = next.icon;
    this.achBannerTitle.textContent = next.title;
    this.achBanner.hidden = false;
    requestAnimationFrame(() => {
      if (this.achBannerActive) this.achBanner.classList.add('is-on');
    });
    this.ctx.audio.playSfx('levelup', 0.45);
    this.achBannerTimer = window.setTimeout(() => {
      this.achBanner.classList.remove('is-on');
      this.achBannerTimer = window.setTimeout(() => this.nextAchBanner(), 260);
    }, 2800);
  }

  setTabAllowed(fn: (tab: TabId) => boolean): void {
    this.tabAllowed = fn;
    this.root.querySelectorAll<HTMLElement>('[data-tab]').forEach((btn) => {
      btn.classList.toggle('is-off', !fn(btn.dataset.tab as TabId));
    });
  }

  setActive(tab: TabId): void {
    this.root.querySelectorAll<HTMLElement>('[data-tab]').forEach((btn) => {
      btn.classList.toggle('is-on', btn.dataset.tab === tab);
    });
  }

  refresh(levelReady: boolean, reading: boolean, chapterReady: boolean): void {
    const s = this.ctx.state;
    this.hudAmt.textContent = formatNumber(s.influence);
    this.hudRate.textContent = `+${formatNumber(this.ctx.economy.passivePerSecond(s))}/sec`;
    this.hudLvl.textContent = `LVL ${s.playerLevel}`;
    this.hudUp.hidden = !levelReady;
    this.xpFill.style.width = `${Math.min(100, (s.totalInfluenceEarned / Math.max(1, s.experienceRequired)) * 100)}%`;
    const buffOn = s.buffRemaining > 0;
    this.manaBar.hidden = buffOn;
    this.buff.hidden = !buffOn;
    if (buffOn) this.buff.textContent = `${Math.ceil(s.buffRemaining)}s`;
    else this.manaFill.style.width = `${Math.min(100, (s.mana / Math.max(1, s.manaMax)) * 100)}%`;
    this.setDot('achievements', this.ctx.economy.anyClaimable(s));
    this.setDot('scene', chapterReady);
    this.setDot('shop', this.ctx.economy.anyAffordableHelper(s, reading));
    if (this.view === 'shop') syncTomes(this.stage, this.ctx);
  }

  showToast(msg: string): void {
    this.toast.textContent = msg;
    this.toast.classList.add('is-on');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toast.classList.remove('is-on'), 2700);
  }

  pulseInfluence(): void {
    const keyframes = [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }];
    const opts: KeyframeAnimationOptions = { duration: 120, easing: 'ease-out' };
    this.hudCrystal.animate(keyframes, opts);
    this.hudAmt.animate(keyframes, opts);
  }

  clearStage(): void {
    this.view = null;
    this.stage.replaceChildren();
  }

  showSettings(): void {
    this.view = 'settings';
    this.stage.innerHTML = settingsHtml(this.ctx);
    bindSettings(this.stage, this.ctx, {
      onWhatsNew: () => this.showWhatsNewSplash(false),
      onCredits: () => this.showCredits(),
      onNewGame: this.handlers.onNewGame,
      onJump: this.handlers.onJump,
    });
  }

  showTomes(): void {
    this.view = 'shop';
    this.stage.innerHTML = tomesHtml(this.ctx);
    bindTomes(this.stage, this.handlers.onBuyHelper);
  }

  showRewards(subTab?: RewardsSubTab): void {
    if (subTab) this.rewardsSubTab = subTab;
    this.view = 'achievements';
    this.stage.innerHTML = rewardsHtml(this.ctx, this.rewardsSubTab);
    bindRewards(
      this.stage,
      (id, meta) => {
        if (!this.handlers.claimReward(id)) return;
        this.ctx.audio.playSfx('levelup');
        this.showRewards();
        this.handlers.onClaimReward(claimInfo(id, this.ctx, meta));
      },
      (nextSubTab) => {
        if (this.rewardsSubTab === nextSubTab) return;
        this.ctx.audio.playSfx('pop', 0.35);
        this.showRewards(nextSubTab);
      },
    );
  }

  showCredits(): void {
    this.view = 'credits';
    this.stage.innerHTML = creditsHtml();
    this.stage
      .querySelector('[data-credits-feedback]')
      ?.addEventListener('click', () => openFeedback('credits', this.ctx.state.playerLevel));
    this.stage.querySelector('[data-credits-close]')?.addEventListener('click', () => this.showSettings());
  }

  setChapter(chapter: ChapterDef | undefined, locked: boolean, visible: boolean): void {
    if (
      this.view === 'settings' ||
      this.view === 'shop' ||
      this.view === 'achievements' ||
      this.view === 'credits' ||
      this.view === 'bestiary'
    ) {
      return;
    }
    if (!visible || !chapter) {
      if (this.view === 'scene') this.clearStage();
      return;
    }
    this.view = 'scene';
    this.stage.innerHTML = chapterHtml(chapter, locked);
    this.stage.querySelector('[data-chapter]')?.addEventListener('click', () => this.handlers.onChapter());
  }

  navButtonCenter(tab: TabId): { x: number; y: number } | null {
    return this.centerOf(`[data-tab="${tab}"]`);
  }

  natureRowCenter(): { x: number; y: number } | null {
    return this.centerOf('[data-tome="nature"]');
  }

  chapterCardCenter(): { x: number; y: number } {
    return this.centerOf('[data-chapter]') ?? { x: this.root.clientWidth / 2, y: this.root.clientHeight - 140 };
  }

  levelChipCenter(): { x: number; y: number } {
    return this.centerOf('[data-level]') ?? { x: this.root.clientWidth - 70, y: 50 };
  }

  setFinger(visible: boolean, x: number, y: number, pointDown: boolean): void {
    this.finger.hidden = !visible;
    if (!visible) return;
    this.finger.style.left = `${x}px`;
    this.finger.style.top = `${y}px`;
    this.finger.classList.toggle('is-down', pointDown);
  }

  private setDot(tab: TabId, on: boolean): void {
    const dot = this.root.querySelector<HTMLElement>(`[data-dot="${tab}"]`);
    if (dot) dot.hidden = !on;
  }

  private centerOf(sel: string): { x: number; y: number } | null {
    const el = this.root.querySelector<HTMLElement>(sel);
    if (!el) return null;
    const a = el.getBoundingClientRect();
    const b = this.root.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  }
}
