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

  /** Unity Receive — claim when progress meets goal. */
  claimClicker(state: GameSave): boolean {
    const a = state.achievements;
    a.clickerGoal = Math.max(1, a.clickerGoal);
    if (a.clickerCount < a.clickerGoal) return false;
    a.clickerCount -= a.clickerGoal;
    a.clickerGoal *= 2;
    state.clickerIncrement *= economy.clickerIncrementMultiplier;
    return true;
  }

  claimHelper(state: GameSave): boolean {
    const a = state.achievements;
    a.helperGoal = Math.max(1, a.helperGoal);
    if (a.helperCount < a.helperGoal) return false;
    a.helperCount -= a.helperGoal;
    a.helperGoal *= 2;
    for (const h of state.helpers) {
      h.dynamicIncrement *= economy.helperIncrementMultiplier;
    }
    return true;
  }

  claimLogin(state: GameSave): boolean {
    const a = state.achievements;
    a.loginGoal = Math.max(1, a.loginGoal);
    if (a.loginCount < a.loginGoal) return false;
    a.loginCount = 0;
    a.loginGoal += 1;
    this.addInfluence(state, this.passivePerSecond(state) * 3600);
    return true;
  }

  claimStory(state: GameSave): boolean {
    const a = state.achievements;
    a.storyGoal = Math.max(1, a.storyGoal);
    if (a.storyCount < a.storyGoal) return false;
    a.storyCount -= a.storyGoal;
    a.storyGoal *= 2;
    this.addInfluence(state, this.passivePerSecond(state) * 36000);
    return true;
  }

  anyClaimable(state: GameSave): boolean {
    const a = state.achievements;
    return (
      a.clickerCount >= a.clickerGoal ||
      a.helperCount >= a.helperGoal ||
      a.loginCount >= a.loginGoal ||
      a.storyCount >= a.storyGoal
    );
  }

  def(id: string): HelperDef | undefined {
    return this.helpers.find((h) => h.id === id);
  }

  drainMana(state: GameSave): void {
    state.mana = 0;
  }
}
