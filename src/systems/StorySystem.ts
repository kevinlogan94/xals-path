import type { ChapterDef, GameSave, RegionId } from '../types';
import chaptersData from '../data/chapters.json';
import economy from '../data/economy.json';
import { track } from '../utils/track';

export interface AdvanceResult {
  finished: boolean;
  finishedChapterId?: number;
  portalJustUnlocked: boolean;
  regionChanged: boolean;
}

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

  /** Advance dialogue. Returns finished + first-unlock portal flag. */
  advance(state: GameSave): AdvanceResult {
    if (!this.activeChapter) {
      return { finished: false, portalJustUnlocked: false, regionChanged: false };
    }
    const line = this.activeChapter.quotes[this.quoteIndex];
    const firstClear = !state.chapters.find((c) => c.id === this.activeChapter!.id)
      ?.sceneViewed;

    let regionChanged = false;
    if (firstClear && line?.text === 'It is done.') {
      const before = state.region;
      this.advanceRegion(state);
      regionChanged = state.region !== before;
    }

    this.quoteIndex += 1;
    if (this.quoteIndex >= this.activeChapter.quotes.length) {
      const finishedChapterId = this.activeChapter.id;
      const portalJustUnlocked = this.finishChapter(state, finishedChapterId);
      this.reading = false;
      this.activeChapter = null;
      this.quoteIndex = 0;
      if (firstClear) {
        track('chapter_complete', { chapter_id: finishedChapterId });
        if (finishedChapterId === 7) track('end_game');
      }
      return { finished: true, finishedChapterId, portalJustUnlocked, regionChanged };
    }
    return { finished: false, portalJustUnlocked: false, regionChanged };
  }

  /** @returns true if portal was newly unlocked on this finish */
  private finishChapter(state: GameSave, id: number): boolean {
    const save = state.chapters.find((c) => c.id === id);
    const firstClear = !save?.sceneViewed;
    if (save) save.sceneViewed = true;
    if (!firstClear) return false;

    // Mana level bumps once when starting chapters 2–4 (Unity ChapterButton)
    // Applied from PlayScene.onChapterButton — not here on finish.

    const allViewed = state.chapters.every((c) => c.sceneViewed);
    if (allViewed && !state.portalUnlocked) {
      state.portalUnlocked = true;
      for (const r of economy.regions as RegionId[]) {
        if (!state.unlockedRegions.includes(r)) state.unlockedRegions.push(r);
      }
      state.achievements.storyCount += 1;
      return true;
    }
    return false;
  }

  private advanceRegion(state: GameSave): void {
    const order: RegionId[] = ['meadow', 'river', 'altar'];
    const idx = order.indexOf(state.region);
    if (idx >= 0 && idx < order.length - 1) {
      const next = order[idx + 1];
      state.region = next;
      if (!state.unlockedRegions.includes(next)) {
        state.unlockedRegions.push(next);
      }
    }
  }

  banterLine(): string {
    const lines = economy.banter as string[];
    return lines[Math.floor(Math.random() * lines.length)] ?? 'Yes?';
  }
}
