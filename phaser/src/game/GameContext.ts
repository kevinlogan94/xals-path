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
    this.offlineGained = 0;
    this.story.reset();
    this.spawn.clear();
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
