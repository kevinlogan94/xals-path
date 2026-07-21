import type { GameSave, HelperDef } from '../types';
import helpersData from '../data/helpers.json';
import economy from '../data/economy.json';

export class EconomySystem {
  readonly helpers: HelperDef[] = helpersData.helpers as HelperDef[];
  readonly costMultiplier = helpersData.costMultiplier;

  passivePerSecond(state: GameSave): number {
    return state.helpers.reduce((sum, h) => {
      const rate = Math.max(h.dynamicIncrement, this.def(h.id)?.increment ?? 0);
      return sum + rate * h.amountOwned;
    }, 0);
  }

  castCost(state: GameSave): number {
    return state.manaMax / (state.manaLevel * economy.manaCastDivisor);
  }

  tryCast(state: GameSave): number {
    const infinite = state.buffRemaining > 0;
    const cost = this.castCost(state);
    if (!infinite && state.mana < cost) return 0;

    if (!infinite) state.mana = Math.max(0, state.mana - cost);

    const gained = state.clickerIncrement;
    this.addInfluence(state, gained);
    state.achievements.clickerCount += 1;
    state.buffClickProgress += 1;
    this.afterClick(state);
    this.checkClickerAchievement(state);
    return gained;
  }

  /**
   * Unity CreatureRegion tap: mana-gated; ×5 / ×10 first tap; ×1 while magic active.
   */
  tryCreatureTap(state: GameSave, alreadyMagic: boolean): number {
    const infinite = state.buffRemaining > 0;
    const cost = this.castCost(state);
    if (!infinite && state.mana < cost) return 0;
    if (!infinite) state.mana = Math.max(0, state.mana - cost);

    let mult = 1;
    if (!alreadyMagic) {
      mult =
        Math.random() < economy.creatureTapBonusChance
          ? economy.creatureTapBonusHigh
          : economy.creatureTapBonusNormal;
    }
    const gained = state.clickerIncrement * mult;
    this.addInfluence(state, gained);
    state.achievements.clickerCount += 1;
    state.buffClickProgress += 1;
    this.afterClick(state);
    this.checkClickerAchievement(state);
    return gained;
  }

  private afterClick(state: GameSave): void {
    if (
      !state.buffedThisLevel &&
      state.buffClickProgress >= economy.buffClickThreshold
    ) {
      state.buffRemaining = economy.buffDurationSeconds;
      state.buffedThisLevel = true;
      state.buffClickProgress = 0;
    }
  }

  tick(state: GameSave, dt: number): void {
    if (state.buffRemaining <= 0 && state.mana < state.manaMax) {
      const divisor = state.manaLevel > 1 ? state.manaLevel * 1.25 : 1;
      state.mana = Math.min(
        state.manaMax,
        state.mana + (economy.manaRegenBase / divisor) * dt * 75,
      );
    }

    const passive = this.passivePerSecond(state) * dt;
    if (passive > 0) this.addInfluence(state, passive);

    if (state.buffRemaining > 0) {
      state.buffRemaining = Math.max(0, state.buffRemaining - dt);
    }
  }

  buyHelper(state: GameSave, helperId: string): boolean {
    const h = state.helpers.find((x) => x.id === helperId);
    const def = this.def(helperId);
    if (!h || !def) return false;
    if (state.playerLevel < def.unlockLevel) return false;
    if (state.influence < h.dynamicCost) return false;

    state.influence -= h.dynamicCost;
    h.amountOwned += 1;
    h.dynamicCost = Math.round(h.dynamicCost * this.costMultiplier);
    state.achievements.helperCount += 1;
    this.checkHelperAchievement(state);
    return true;
  }

  applyOffline(state: GameSave): number {
    const last = Date.parse(state.savedAt);
    if (!Number.isFinite(last)) return 0;
    const seconds = Math.min(
      economy.offlineCapSeconds,
      Math.max(0, (Date.now() - last) / 1000),
    );
    const ch1 = state.chapters.find((c) => c.id === 1);
    if (!ch1?.sceneViewed) return 0;
    const gained = this.passivePerSecond(state) * seconds;
    if (gained > 0) this.addInfluence(state, gained);
    return gained;
  }

  addInfluence(state: GameSave, amount: number): void {
    state.influence += amount;
    state.totalInfluenceEarned += amount;
    this.checkLevelUp(state);
  }

  /** Wallet-only influence (does not advance XP / level). */
  addWallet(state: GameSave, amount: number): void {
    state.influence += amount;
  }

  private checkLevelUp(state: GameSave): void {
    let pendingReward = 0;
    while (
      state.playerLevel < economy.maxLevel &&
      state.totalInfluenceEarned >= state.experienceRequired
    ) {
      state.playerLevel += 1;
      state.experienceRequired *= economy.levelXpMultiplier;
      state.buffedThisLevel = false;
      state.buffClickProgress = 0;
      pendingReward += this.passivePerSecond(state) * economy.levelRewardSeconds;
    }
    if (pendingReward > 0) this.addWallet(state, pendingReward);
  }

  private checkClickerAchievement(state: GameSave): void {
    state.achievements.clickerGoal = Math.max(1, state.achievements.clickerGoal);
    while (state.achievements.clickerCount >= state.achievements.clickerGoal) {
      state.achievements.clickerCount -= state.achievements.clickerGoal;
      state.achievements.clickerGoal *= 2;
      state.clickerIncrement *= economy.clickerIncrementMultiplier;
    }
  }

  private checkHelperAchievement(state: GameSave): void {
    state.achievements.helperGoal = Math.max(1, state.achievements.helperGoal);
    while (state.achievements.helperCount >= state.achievements.helperGoal) {
      state.achievements.helperCount -= state.achievements.helperGoal;
      state.achievements.helperGoal *= 2;
      for (const h of state.helpers) {
        h.dynamicIncrement *= economy.helperIncrementMultiplier;
      }
    }
  }

  def(id: string): HelperDef | undefined {
    return this.helpers.find((h) => h.id === id);
  }

  drainMana(state: GameSave): void {
    state.mana = 0;
  }
}
