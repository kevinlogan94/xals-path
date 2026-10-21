import './blighted-scroll.css';
import type { GameContext } from '../game/GameContext';
import type { ChapterDef, CreatureDef, GameSave, TabId } from '../types';
import { formatNumber } from '../utils/format';
import {
  NAV,
  bindRewards,
  bindSettings,
  bindTomes,
  chapterHtml,
  claimInfo,
  creditsHtml,
  rewardsHtml,
  settingsHtml,
  syncTomes,
  tomesHtml,
  type AchievementClaimInfo,
  type RewardId,
} from './panels';
import {
  achievementSplash,
  bindCreature,
  bindCredits,
  bindEndGame,
  bindSimple,
  buffSplash,
  endGameSplash,
  influenceSplash,
  levelUpSplash,
  newGameSplash,
  portalSplash,
  type SplashBind,
} from './splashes';

export type HudOverlayHandlers = {
  onTab: (tab: TabId) => void;
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
  private readonly finger: HTMLImageElement;
  private readonly splash: HTMLElement;
  private readonly storyBack: HTMLButtonElement;
  private toastTimer = 0;
  private splashCleanup: (() => void) | null = null;
  private view: TabId | 'credits' | null = null;
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
      <button type="button" class="scroll-card back-btn story-back" data-story-back hidden>Back</button>
      <nav class="nav-dock">${NAV.map(
        (n) =>
          `<button type="button" class="nav-btn" data-tab="${n.id}"><img src="${n.icon}" alt="" /><span>${n.label}</span><span class="nav-dot" data-dot="${n.id}" hidden>!</span></button>`,
      ).join('')}</nav>
      <div class="hud-toast" data-toast></div>
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
    this.finger = this.root.querySelector('[data-finger]')!;
    this.splash = this.root.querySelector('[data-splash]')!;
    this.storyBack = this.root.querySelector('[data-story-back]')!;

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
    this.dismissSplash();
    this.root.remove();
  }

  isSplashOpen(): boolean {
    return !this.splash.hidden;
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

  showEndGameSplash(onCredits: () => void): void {
    this.openSplash(endGameSplash(), bindEndGame(onCredits));
  }

  showCreatureSplash(creature: CreatureDef): void {
    this.openSplash('', bindCreature(creature));
  }

  showCreditsSplash(): void {
    this.openSplash(creditsHtml(), bindCredits);
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

  showRewards(): void {
    this.view = 'achievements';
    this.stage.innerHTML = rewardsHtml(this.ctx);
    bindRewards(this.stage, (id, meta) => {
      if (!this.handlers.claimReward(id)) return;
      this.ctx.audio.playSfx('levelup');
      this.showRewards();
      this.handlers.onClaimReward(claimInfo(id, this.ctx, meta));
    });
  }

  showCredits(): void {
    this.view = 'credits';
    this.stage.innerHTML = creditsHtml();
    this.stage.querySelector('[data-credits-close]')?.addEventListener('click', () => this.showSettings());
  }

  setChapter(chapter: ChapterDef | undefined, locked: boolean, visible: boolean): void {
    if (this.view === 'settings' || this.view === 'shop' || this.view === 'achievements' || this.view === 'credits') {
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
