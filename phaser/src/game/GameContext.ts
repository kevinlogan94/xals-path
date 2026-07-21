import type { GameSave } from '../types';
import { SaveSystem } from '../systems/SaveSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { StorySystem } from '../systems/StorySystem';
import { AudioSystem } from '../systems/AudioSystem';
import { SpawnSystem } from '../systems/SpawnSystem';

/** Shared game context — systems live here, not as global singletons. */
export class GameContext {
  readonly save = new SaveSystem();
  readonly economy = new EconomySystem();
  readonly story = new StorySystem();
  readonly audio = new AudioSystem();
  readonly spawn = new SpawnSystem();
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
    this.save.clear();
    this.state = this.save.load();
    this.story.reset();
    this.spawn.clear();
  }

  /** Story achievement influence — uses economy so level-up path runs. */
  grantStoryReward(): void {
    const a = this.state.achievements;
    a.storyGoal = Math.max(1, a.storyGoal);
    while (a.storyCount >= a.storyGoal) {
      a.storyCount -= a.storyGoal;
      a.storyGoal *= 2;
      const reward = this.economy.passivePerSecond(this.state) * 36000;
      this.economy.addInfluence(this.state, reward);
    }
  }

  private trackLogin(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.achievements.lastLoginDay !== today) {
      this.state.achievements.loginCount += 1;
      this.state.achievements.lastLoginDay = today;
      this.state.achievements.loginGoal = Math.max(
        1,
        this.state.achievements.loginGoal,
      );
      if (
        this.state.achievements.loginCount >= this.state.achievements.loginGoal
      ) {
        const reward = this.economy.passivePerSecond(this.state) * 3600;
        this.economy.addInfluence(this.state, reward);
        this.state.achievements.loginGoal += 1;
        this.state.achievements.loginCount = 0;
      }
    }
  }
}

let ctx: GameContext | null = null;

export function getContext(): GameContext {
  if (!ctx) ctx = new GameContext();
  return ctx;
}
