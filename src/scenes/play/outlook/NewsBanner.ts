import chaptersData from '../../../data/chapters.json';
import newsData from '../../../data/news.json';
import type { ChapterDef, GameSave } from '../../../types';

const HIDE_MS = 15000;
const NEWS = newsData as { id: string; message: string }[];
const CH2_LEVEL =
  (chaptersData.chapters as ChapterDef[]).find((c) => c.id === 2)?.levelRequirement ?? 5;

function matches(state: GameSave, id: string): boolean {
  const a = state.achievements;
  switch (id) {
    case 'Tomes':
      return state.helpers.find((h) => h.id === 'lightning')?.amountOwned === 3;
    case 'Outlook':
      return true;
    case 'Spells':
      return state.influence >= 50;
    case 'Xal':
      return state.playerLevel >= CH2_LEVEL;
    case 'ClickerAchievement':
      return a.clickerCount >= a.clickerGoal;
    case 'LoginAchievement':
      return a.loginCount >= a.loginGoal;
    case 'TomeAchievement':
      return a.helperCount >= a.helperGoal;
    case 'Ch2Power':
      return state.manaLevel >= 2;
    case 'Ch3Power':
      return state.manaLevel >= 3;
    case 'Ch4Power':
      return state.manaLevel >= 4;
    default:
      return false;
  }
}

export class NewsBanner {
  private el!: HTMLButtonElement;
  private copy!: HTMLElement;
  private hideAt = 0;

  constructor(private readonly onDismiss?: () => void) {}

  build(parent: HTMLElement): void {
    this.el = document.createElement('button');
    this.el.type = 'button';
    this.el.className = 'news-banner';
    this.el.hidden = true;
    this.el.innerHTML = `<span data-news-copy></span><span class="news-close" aria-hidden="true">\u00d7</span>`;
    this.copy = this.el.querySelector('[data-news-copy]')!;
    this.el.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
      this.onDismiss?.();
    });
    parent.append(this.el);
  }

  isOpen(): boolean {
    return !!this.el && !this.el.hidden;
  }

  tick(
    state: GameSave,
    onOutlook: boolean,
    now: number,
    canOpenNew = onOutlook,
  ): void {
    if (!onOutlook) {
      this.hide();
      return;
    }
    if (!this.el.hidden) {
      if (now >= this.hideAt) this.hide();
      return;
    }
    if (!canOpenNew) return;
    const item = NEWS.find((n) => !state.newsShown.includes(n.id) && matches(state, n.id));
    if (!item) return;
    state.newsShown.push(item.id);
    this.show(item.message, now);
  }

  hide(): void {
    if (this.el) this.el.hidden = true;
  }

  private show(message: string, now: number): void {
    this.copy.textContent = message;
    this.hideAt = now + HIDE_MS;
    this.el.hidden = false;
  }
}
