import type { GameSave, HelperDef } from '../types';
import helpersData from '../data/helpers.json';
import economy from '../data/economy.json';
import type { TutorialSystem } from './TutorialSystem';
import { track } from '../utils/track';

export class EconomySystem {
  readonly helpers: HelperDef[] = helpersData.helpers as HelperDef[];
  readonly costMultiplier = helpersData.costMultiplier;
  buffSessionClicks = 0;
  comboCount = 0;
  comboMultiplier = 1;
  lastCastMultiplier = 1;
  lastOvercharge = false;
  lastVesselSummon = false;
  private comboTimer = 0;
  private passiveAcc = 0;

  resetCombo(): void {
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.lastCastMultiplier = 1;
    this.lastOvercharge = false;
    this.lastVesselSummon = false;
    this.comboTimer = 0;
  }

  passivePerSecond(state: GameSave): number {
    return state.helpers.reduce((sum, h) => {
      const rate = Math.max(h.dynamicIncrement, this.def(h.id)?.increment ?? 0);
      return sum + rate * h.amountOwned;
    }, 0);
  }

  castCost(state: GameSave): number {
    return state.manaMax / (state.manaLevel * economy.manaCastDivisor);
  }

  /** Remaining combo window ratio (0..1) for the HUD combo decay bar. */
  comboDecayRatio(): number {
    return Math.max(0, Math.min(1, this.comboTimer / economy.comboWindowSeconds));
  }

  /** Current step (1..10) toward the 10-spell Arcane Surge burst. */
  surgeSteps(): number {
    if (this.comboCount <= 0) return 0;
    const rem = this.comboCount % economy.overchargeEvery;
    return rem === 0 ? economy.overchargeEvery : rem;
  }

  /**
   * Spends mana when available to fuel Empowered combo progression.
   * Never blocks clicking: if mana is depleted, casts still succeed at 1x base power.
   */
  private advanceCastState(state: GameSave): boolean {
    const infinite = state.buffRemaining > 0;
    const cost = this.castCost(state);
    const empowered = infinite || state.mana >= cost;

    if (infinite) {
      this.buffSessionClicks += 1;
    } else if (empowered) {
      state.mana = Math.max(0, state.mana - cost);
    }

    if (empowered) {
      this.comboCount = this.comboTimer > 0 ? this.comboCount + 1 : 1;
      this.comboTimer = economy.comboWindowSeconds;
      this.comboMultiplier = infinite
        ? economy.comboMaxMultiplier
        : Math.min(
            economy.comboMaxMultiplier,
            1 + Math.floor((this.comboCount - 1) / 2),
          );
      this.lastCastMultiplier = this.comboMultiplier;
      this.lastOvercharge =
        this.comboCount > 0 &&
        this.comboCount % economy.overchargeEvery === 0;
      this.lastVesselSummon =
        state.manaLevel >= 3 &&
        this.comboCount > 0 &&
        this.comboCount % economy.vesselSummonEvery === 0;
    } else {
      this.lastCastMultiplier = 1;
      this.lastOvercharge = false;
      this.lastVesselSummon = false;
    }
    return empowered;
  }

  tryCast(state: GameSave): number {
    const empowered = this.advanceCastState(state);
    const mult = empowered
      ? this.comboMultiplier +
        (this.lastOvercharge ? economy.overchargeBonusMultiplier : 0)
      : 1;
    const gained = state.clickerIncrement * mult;
    this.addInfluence(state, gained);
    state.achievements.clickerCount += 1;
    state.buffClickProgress += 1;
    this.afterClick(state);
    return gained;
  }

  /**
   * Direct tap on a creature: ×5 / ×10 Cleansing Burst on first tap; combo mult while resonating.
   */
  tryCreatureTap(state: GameSave, alreadyMagic: boolean): number {
    const empowered = this.advanceCastState(state);

    let mult = empowered
      ? this.comboMultiplier +
        (this.lastOvercharge ? economy.overchargeBonusMultiplier : 0)
      : 1;
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

  /**
   * Tap on a Corrupted creature: 1x per shield crack, 20x when the 3rd tap draws out the corruption.
   */
  tryBlightedTap(state: GameSave, purified: boolean): number {
    this.advanceCastState(state);

    const mult = purified ? economy.blightedPurifyMultiplier : 1;
    const gained = state.clickerIncrement * mult;
    this.addInfluence(state, gained);
    state.achievements.clickerCount += 1;
    state.buffClickProgress += 1;
    this.afterClick(state);
    return gained;
  }

  /**
   * Tap on an Ancient Vessel (unlocked Ch 3): 5x on dodges 1–2, 15x on 3rd tap full extraction.
   */
  tryVesselTap(state: GameSave, finalExtraction: boolean): number {
    this.advanceCastState(state);

    const mult = finalExtraction
      ? economy.vesselFinalMultiplier
      : economy.vesselTapMultiplier;
    const gained = state.clickerIncrement * mult;
    this.addInfluence(state, gained);
    state.achievements.clickerCount += 1;
    state.buffClickProgress += 1;
    this.afterClick(state);
    return gained;
  }

  /** Passive 1x clickerIncrement per second emitted by each resonating creature. */
  addResonanceTick(state: GameSave, count = 1): number {
    if (count <= 0) return 0;
    const gained = state.clickerIncrement * count;
    this.addInfluence(state, gained);
    return gained;
  }

  private afterClick(state: GameSave): void {
    if (
      !state.buffedThisLevel &&
      state.buffClickProgress >= economy.buffClickThreshold
    ) {
      state.buffOfferPending = true;
      state.buffedThisLevel = true;
      state.buffClickProgress = 0;
    }
  }

  acceptBuffOffer(state: GameSave): boolean {
    if (!state.buffOfferPending) return false;
    state.buffOfferPending = false;
    state.buffEverCollected = true;
    state.buffRemaining = economy.buffDurationSeconds;
    this.buffSessionClicks = 0;
    return true;
  }

  tick(state: GameSave, dt: number, tutorial?: TutorialSystem): void {
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    if (state.buffRemaining <= 0 && state.mana < state.manaMax) {
      const scale = 1 + (state.manaLevel - 1) * 0.65;
      state.mana = Math.min(
        state.manaMax,
        state.mana + economy.manaRegenBase * scale * dt * 75,
      );
    }

    const pausePassive = tutorial?.shouldPausePassive(state) ?? false;
    if (!pausePassive) {
      this.passiveAcc += dt;
      if (this.passiveAcc >= 1) {
        const secs = Math.floor(this.passiveAcc);
        this.passiveAcc -= secs;
        const passive = this.passivePerSecond(state) * secs;
        if (passive > 0) this.addInfluence(state, passive);
      }
    }

    if (state.buffRemaining > 0) {
      state.buffRemaining = Math.max(0, state.buffRemaining - dt);
      if (state.buffRemaining <= 0) this.buffSessionClicks = 0;
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
    if (state.pendingOffline > 0) return state.pendingOffline;
    const last = Date.parse(state.savedAt);
    if (!Number.isFinite(last)) return 0;
    const seconds = Math.min(
      economy.offlineCapSeconds,
      Math.max(0, (Date.now() - last) / 1000),
    );
    const ch1 = state.chapters.find((c) => c.id === 1);
    if (!ch1?.sceneViewed) return 0;
    const gained = Math.floor(this.passivePerSecond(state) * seconds);
    if (gained > 0) state.pendingOffline = gained;
    return gained;
  }

  addInfluence(state: GameSave, amount: number): void {
    state.influence += amount;
    state.totalInfluenceEarned += amount;
  }

  /** Wallet-only influence (does not advance XP / level). */
  addWallet(state: GameSave, amount: number): void {
    state.influence += amount;
  }

  /** Unity ReadyToLevelUp — XP full, player must tap the level cloud. */
  readyToLevelUp(state: GameSave): boolean {
    return (
      state.playerLevel < economy.maxLevel &&
      state.totalInfluenceEarned >= state.experienceRequired
    );
  }

  levelReward(state: GameSave): number {
    return this.passivePerSecond(state) * economy.levelRewardSeconds;
  }

  /** Unity LevelUpPlayer(skip ad) — 1x reward, then bump level and reset XP. */
  levelUp(state: GameSave): boolean {
    if (!this.readyToLevelUp(state)) return false;
    this.addWallet(state, this.levelReward(state));
    state.experienceRequired *= economy.levelXpMultiplier;
    state.totalInfluenceEarned = 0;
    state.playerLevel += 1;
    state.buffedThisLevel = false;
    state.buffClickProgress = 0;
    track('level_up', { player_level: state.playerLevel });
    return true;
  }

  /** Unity Receive — claim when progress meets goal. */
  claimClicker(state: GameSave): boolean {
    const a = state.achievements;
    a.clickerGoal = Math.max(1, a.clickerGoal);
    if (a.clickerCount < a.clickerGoal) return false;
    a.clickerCount -= a.clickerGoal;
    a.clickerGoal *= 2;
    state.clickerIncrement *= economy.clickerIncrementMultiplier;
    a.achievementCount += 1;
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
    a.achievementCount += 1;
    return true;
  }

  /** Unity AchievementLogic — keep cumulative claims; double goal; then ++. */
  claimMeta(state: GameSave): boolean {
    const a = state.achievements;
    a.achievementGoal = Math.max(1, a.achievementGoal);
    if (a.achievementCount < a.achievementGoal) return false;
    a.achievementGoal *= 2;
    this.addInfluence(state, this.passivePerSecond(state) * 3600);
    a.achievementCount += 1;
    return true;
  }

  claimLogin(state: GameSave): boolean {
    const a = state.achievements;
    a.loginGoal = Math.max(1, a.loginGoal);
    if (a.loginCount < a.loginGoal) return false;
    a.loginCount = 0;
    a.loginGoal += 1;
    this.addInfluence(state, this.passivePerSecond(state) * 3600);
    a.achievementCount += 1;
    return true;
  }

  claimStory(state: GameSave): boolean {
    const a = state.achievements;
    a.storyGoal = Math.max(1, a.storyGoal);
    if (a.storyCount < a.storyGoal) return false;
    a.storyCount -= a.storyGoal;
    a.storyGoal *= 2;
    this.addInfluence(state, this.passivePerSecond(state) * 36000);
    a.achievementCount += 1;
    return true;
  }

  anyClaimable(state: GameSave): boolean {
    const a = state.achievements;
    return (
      a.clickerCount >= a.clickerGoal ||
      a.helperCount >= a.helperGoal ||
      a.achievementCount >= a.achievementGoal ||
      a.loginCount >= a.loginGoal ||
      a.storyCount >= a.storyGoal
    );
  }

  /** Unity ShopManager.ManageExclamationPoint — affordable unlocked helper, not mid-story. */
  anyAffordableHelper(state: GameSave, reading: boolean): boolean {
    if (reading) return false;
    return this.helpers.some((def) => {
      if (state.playerLevel < def.unlockLevel) return false;
      const h = state.helpers.find((x) => x.id === def.id);
      return !!h && state.influence >= h.dynamicCost;
    });
  }

  def(id: string): HelperDef | undefined {
    return this.helpers.find((h) => h.id === id);
  }

  drainMana(state: GameSave): void {
    state.mana = 0;
    this.resetCombo();
  }
}
