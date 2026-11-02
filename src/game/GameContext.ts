import type { GameSave } from '../types';
import { SaveSystem } from '../systems/SaveSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { StorySystem } from '../systems/StorySystem';
import { TutorialSystem } from '../systems/TutorialSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { WHATS_NEW_IDS, evaluateAchievements } from '../systems/AchievementSystem';

/** Shared game context — systems live here, not as global singletons. */
export class GameContext {
  readonly save = new SaveSystem();
  readonly economy = new EconomySystem();
  readonly story = new StorySystem();
  readonly audio = new AudioSystem();
  readonly spawn = new SpawnSystem();
  readonly tutorial = new TutorialSystem();
  state: GameSave;
  offlineGained = 0;

  constructor() {
    this.state = this.save.load();
    this.offlineGained = this.economy.applyOffline(this.state);
    this.trackLogin();
    // Persist immediately so offline window / login are not double-granted
    this.persist();
  }

  persist(): void {
    this.save.save(this.state);
  }

  reset(): void {
    const { feedbackShown, unlockedAchievements, whatsNewSeen } = this.state;
    const { storyCount, storyGoal } = this.state.achievements;
    this.save.clear();
    this.state = this.save.load();
    this.state.feedbackShown = feedbackShown;
    this.state.unlockedAchievements = [...unlockedAchievements];
    this.state.whatsNewSeen =
      whatsNewSeen.length > 0 ? [...whatsNewSeen] : [...WHATS_NEW_IDS];
    this.state.achievements.storyCount = storyCount;
    this.state.achievements.storyGoal = storyGoal;
    this.trackLogin();
    if (
      this.state.unlockedAchievements.length > 0 ||
      storyCount > 0 ||
      storyGoal > 2 ||
      feedbackShown
    ) {
      this.save.saveMeta(this.state);
    }
    this.offlineGained = 0;
    this.economy.buffSessionClicks = 0;
    this.economy.resetCombo();
    this.story.reset();
    this.spawn.clear();
    this.tutorial.reset();
  }

  /** Swap the live save and persist it. Caller restarts play chrome. */
  replace(state: GameSave): void {
    this.state = state;
    this.trackLogin();
    evaluateAchievements(this.state);
    this.offlineGained = 0;
    this.economy.buffSessionClicks = 0;
    this.economy.resetCombo();
    this.story.reset();
    this.spawn.clear();
    this.tutorial.reset();
    if (this.state.tutorialCompleted) {
      this.persist();
    } else {
      this.save.clear();
    }
  }

  private trackLogin(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.achievements.lastLoginDay !== today) {
      this.state.achievements.loginCount += 1;
      this.state.achievements.lastLoginDay = today;
    }
  }
}

let ctx: GameContext | null = null;

export function getContext(): GameContext {
  if (!ctx) ctx = new GameContext();
  return ctx;
}
