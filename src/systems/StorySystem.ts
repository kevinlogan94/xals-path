import type { ChapterDef, GameSave, RegionId } from '../types';
import chaptersData from '../data/chapters.json';
import economy from '../data/economy.json';
import { track } from '../utils/track';

export interface AdvanceResult {
  finished: boolean;
  finishedChapterId?: number;
  regionChanged: boolean;
}

const CHAPTER_TARGET_REGION: Record<number, RegionId> = {
  3: 'river',
  4: 'altar',
};

export class StorySystem {
  readonly chapters: ChapterDef[] = chaptersData.chapters as ChapterDef[];
  activeChapter: ChapterDef | null = null;
  quoteIndex = 0;
  reading = false;

  reset(): void {
    this.activeChapter = null;
    this.quoteIndex = 0;
    this.reading = false;
  }

  canStart(state: GameSave, chapterId: number): boolean {
    const ch = this.chapters.find((c) => c.id === chapterId);
    if (!ch) return false;
    if (state.playerLevel < ch.levelRequirement) return false;
    if (chapterId > 1) {
      const prev = state.chapters.find((c) => c.id === chapterId - 1);
      if (!prev?.sceneViewed) return false;
    }
    return true;
  }

  start(state: GameSave, chapterId: number): boolean {
    if (!this.canStart(state, chapterId)) return false;
    const ch = this.chapters.find((c) => c.id === chapterId) ?? null;
    this.activeChapter = ch;
    this.quoteIndex = 0;
    this.reading = !!ch;
    return this.reading;
  }

  currentLine(): { text: string; expression: string; speaker: string } | null {
    if (!this.activeChapter) return null;
    const q = this.activeChapter.quotes[this.quoteIndex];
    if (!q) return null;
    return {
      text: q.text,
      expression: q.expression,
      speaker: this.activeChapter.speaker,
    };
  }

  /** Step to the previous line while reading. Does not un-finish chapters. */
  retreat(): boolean {
    if (!this.reading || this.quoteIndex <= 0) return false;
    this.quoteIndex -= 1;
    return true;
  }

  /** Advance dialogue. Returns finished + region-changed flags. */
  advance(state: GameSave): AdvanceResult {
    if (!this.activeChapter) {
      return { finished: false, regionChanged: false };
    }
    const line = this.activeChapter.quotes[this.quoteIndex];
    const firstClear = !state.chapters.find((c) => c.id === this.activeChapter!.id)
      ?.sceneViewed;

    let regionChanged = false;
    const target =
      firstClear && line?.text === 'It is done.'
        ? CHAPTER_TARGET_REGION[this.activeChapter.id]
        : undefined;
    if (target) {
      regionChanged =
        state.region !== target || !state.unlockedRegions.includes(target);
      state.region = target;
      state.portalUnlocked = true;
      if (!state.unlockedRegions.includes(target)) {
        state.unlockedRegions.push(target);
      }
    }

    this.quoteIndex += 1;
    if (this.quoteIndex >= this.activeChapter.quotes.length) {
      const finishedChapterId = this.activeChapter.id;
      this.finishChapter(state, finishedChapterId);
      this.reading = false;
      this.activeChapter = null;
      this.quoteIndex = 0;
      if (firstClear) {
        track('chapter_complete', { chapter_id: finishedChapterId });
        if (finishedChapterId === 7) track('end_game');
      }
      return { finished: true, finishedChapterId, regionChanged };
    }
    return { finished: false, regionChanged };
  }

  private finishChapter(state: GameSave, id: number): void {
    const save = state.chapters.find((c) => c.id === id);
    const firstClear = !save?.sceneViewed;
    if (save) save.sceneViewed = true;
    if (!firstClear) return;

    // Mana level bumps once when starting chapters 2–4 (Unity ChapterButton)
    // Applied from PlayScene.onChapterButton — not here on finish.

    if (state.chapters.every((c) => c.sceneViewed)) {
      state.portalUnlocked = true;
      for (const r of economy.regions as RegionId[]) {
        if (!state.unlockedRegions.includes(r)) state.unlockedRegions.push(r);
      }
      state.achievements.storyCount += 1;
    }
  }

  banterLine(): string {
    const lines = economy.banter as string[];
    return lines[Math.floor(Math.random() * lines.length)] ?? 'Yes?';
  }
}
