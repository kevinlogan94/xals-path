import type { GameSave, TabId } from '../types';
import tutorialData from '../data/tutorial.json';
import type { EconomySystem } from './EconomySystem';

const LINES = tutorialData.lines as string[];
const SHOP_UNLOCK_STEP = 1;
const WAIT_NATURE_STEP = 2;
const POINTER_DELAY = tutorialData.chapterPointerDelaySeconds as number;

export type PointerTarget =
  | 'none'
  | 'chapter'
  | 'tomesNav'
  | 'natureRow'
  | 'xal'
  | 'outlookNav'
  | 'cast';

export class TutorialSystem {
  active = false;
  stepIndex = 0;
  waitingNature = false;
  outlookTutorial = false;
  shopNavUnlocked = false;
  private chapterIdle = 0;
  private showChapterPointer = false;

  reset(): void {
    this.active = false;
    this.stepIndex = 0;
    this.waitingNature = false;
    this.outlookTutorial = false;
    this.shopNavUnlocked = false;
    this.chapterIdle = 0;
    this.showChapterPointer = false;
  }

  /** Resume or init from save — call once on scene create. */
  bootstrap(state: GameSave, economy: EconomySystem): void {
    const ch1 = state.chapters.find((c) => c.id === 1);
    if (state.tutorialCompleted || !ch1?.sceneViewed) return;

    const nature = state.helpers.find((h) => h.id === 'nature');
    this.active = true;
    this.shopNavUnlocked = true;
    if (!nature || nature.amountOwned === 0) {
      this.waitingNature = true;
      this.stepIndex = WAIT_NATURE_STEP;
      const cost = nature?.dynamicCost ?? economy.def('nature')?.cost ?? 10;
      if (state.influence < cost) state.influence = cost;
    } else {
      this.stepIndex = WAIT_NATURE_STEP;
      this.waitingNature = false;
    }
  }

  isEarlyMapLock(state: GameSave): boolean {
    const ch1 = state.chapters.find((c) => c.id === 1);
    return !ch1?.sceneViewed;
  }

  isTabAllowed(state: GameSave, tab: TabId): boolean {
    if (this.isEarlyMapLock(state)) return tab === 'scene';
    if (state.tutorialCompleted) return true;
    if (this.outlookTutorial) return tab === 'outlook' || tab === 'scene';
    if (this.active) {
      if (tab === 'shop') return this.shopNavUnlocked;
      if (tab === 'scene') return true;
      return false;
    }
    return true;
  }

  shouldPausePassive(state: GameSave): boolean {
    if (state.tutorialCompleted) return false;
    return this.active || this.isEarlyMapLock(state);
  }

  tickEarlyPointer(dt: number, state: GameSave, reading: boolean, onScene: boolean): void {
    if (state.tutorialCompleted) {
      this.showChapterPointer = false;
      return;
    }
    const ch1 = state.chapters.find((c) => c.id === 1);
    if (!ch1 || ch1.sceneViewed || reading || !onScene || this.active) {
      this.showChapterPointer = false;
      this.chapterIdle = 0;
      return;
    }
    this.chapterIdle += dt;
    this.showChapterPointer = this.chapterIdle >= POINTER_DELAY;
  }

  startAfterChapter1(state: GameSave): void {
    if (state.tutorialCompleted) return;
    this.active = true;
    this.stepIndex = 0;
    this.waitingNature = false;
    this.shopNavUnlocked = false;
    this.outlookTutorial = false;
  }

  currentLine(): string | null {
    if (!this.active || this.waitingNature) return null;
    return LINES[this.stepIndex] ?? null;
  }

  /** Portrait tap during post-ch1 tutorial — advance dialogue. */
  advanceLine(state: GameSave, economy: EconomySystem): string | null {
    if (!this.active || this.waitingNature) return null;

    if (this.stepIndex === SHOP_UNLOCK_STEP) {
      this.giftForNature(state, economy);
      this.shopNavUnlocked = true;
    }

    const line = LINES[this.stepIndex];
    if (!line) {
      this.active = false;
      this.outlookTutorial = true;
      return null;
    }

    this.stepIndex += 1;

    if (this.stepIndex === WAIT_NATURE_STEP) {
      this.waitingNature = true;
      return line;
    }

    if (this.stepIndex >= LINES.length) {
      this.active = false;
      this.outlookTutorial = true;
    }
    return line;
  }

  onNaturePurchased(state: GameSave): void {
    if (!this.active || !this.waitingNature) return;
    const nature = state.helpers.find((h) => h.id === 'nature');
    if (!nature || nature.amountOwned < 1) return;
    this.waitingNature = false;
  }

  pointerTarget(
    state: GameSave,
    tab: TabId,
    _reading: boolean,
    shopOpen: boolean,
    chapterCardVisible: boolean,
  ): PointerTarget {
    if (this.outlookTutorial) {
      if (tab === 'outlook') return 'cast';
      return 'outlookNav';
    }

    if (this.showChapterPointer && chapterCardVisible) return 'chapter';

    if (!this.active || state.tutorialCompleted) return 'none';

    if (this.waitingNature) {
      const nature = state.helpers.find((h) => h.id === 'nature');
      const cost = nature?.dynamicCost ?? 10;
      if (state.influence >= cost) {
        if (shopOpen) return 'natureRow';
        if (this.shopNavUnlocked) return 'tomesNav';
      }
      return 'none';
    }

    if (tab === 'scene' && this.currentLine()) return 'xal';
    return 'none';
  }

  /** Outlook after the closer — tour is done, first save can write. */
  dismissOutlookTutorial(state: GameSave): void {
    this.outlookTutorial = false;
    state.tutorialCompleted = true;
  }

  private giftForNature(state: GameSave, economy: EconomySystem): void {
    const nature = state.helpers.find((h) => h.id === 'nature');
    const cost = nature?.dynamicCost ?? economy.def('nature')?.cost ?? 10;
    if (state.influence < cost) state.influence = cost;
  }
}
