import type { GameSave, HelperDef, RegionId } from '../types';
import helpersData from '../data/helpers.json';
import economy from '../data/economy.json';

const SAVE_KEY = 'xals-path-web-save-v1';

function defaultHelpers(): GameSave['helpers'] {
  return (helpersData.helpers as HelperDef[]).map((h) => ({
    id: h.id,
    amountOwned: 0,
    dynamicCost: h.cost,
    dynamicIncrement: h.increment,
  }));
}

function createDefaultSave(): GameSave {
  return {
    version: 1,
    influence: 0,
    totalInfluenceEarned: 0,
    playerLevel: 1,
    experienceRequired: economy.levelXpStart,
    clickerIncrement: economy.clickerIncrementStart,
    mana: 100,
    manaMax: 100,
    manaLevel: 1,
    region: 'meadow',
    helpers: defaultHelpers(),
    chapters: [1, 2, 3, 4, 5, 6, 7].map((id) => ({ id, sceneViewed: false })),
    achievements: {
      clickerGoal: economy.clickerAchievementGoalStart,
      clickerCount: 0,
      helperGoal: economy.helperAchievementGoalStart,
      helperCount: 0,
      videoGoal: economy.videoAchievementGoalStart,
      videoCount: 0,
      achievementGoal: economy.achievementGoalStart,
      achievementCount: 0,
      loginGoal: 2,
      loginCount: 0,
      lastLoginDay: '',
      storyGoal: 2,
      storyCount: 0,
    },
    buffedThisLevel: false,
    buffClickProgress: 0,
    buffOfferPending: false,
    buffRemaining: 0,
    portalUnlocked: false,
    unlockedRegions: ['meadow'],
    pendingOffline: 0,
    tutorialCompleted: false,
    savedAt: new Date().toISOString(),
  };
}

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Saves before tutorial flag: skip tour if player already progressed past it. */
function inferTutorialCompleted(save: Partial<GameSave>, fresh: GameSave): boolean {
  if (save.tutorialCompleted) return true;
  const ch1 = save.chapters?.find((c) => c.id === 1);
  if (!ch1?.sceneViewed) return false;
  const nature = save.helpers?.find((h) => h.id === 'nature');
  if ((nature?.amountOwned ?? 0) > 0) return true;
  if (finite(save.playerLevel, 1) > 1) return true;
  return save.tutorialCompleted ?? fresh.tutorialCompleted;
}

export class SaveSystem {
  load(): GameSave {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefaultSave();
      const parsed = JSON.parse(raw) as Partial<GameSave>;
      if (parsed.version !== 1) return createDefaultSave();
      return this.mergeDefaults(parsed);
    } catch {
      return createDefaultSave();
    }
  }

  save(state: GameSave): void {
    state.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Save failed', err);
    }
  }

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  private mergeDefaults(save: Partial<GameSave>): GameSave {
    const fresh = createDefaultSave();
    return {
      ...fresh,
      version: 1,
      influence: finite(save.influence, fresh.influence),
      totalInfluenceEarned: finite(
        save.totalInfluenceEarned,
        fresh.totalInfluenceEarned,
      ),
      playerLevel: finite(save.playerLevel, fresh.playerLevel),
      experienceRequired: finite(
        save.experienceRequired,
        fresh.experienceRequired,
      ),
      clickerIncrement: finite(save.clickerIncrement, fresh.clickerIncrement),
      mana: finite(save.mana, fresh.mana),
      manaMax: finite(save.manaMax, fresh.manaMax),
      manaLevel: finite(save.manaLevel, fresh.manaLevel),
      region: save.region ?? fresh.region,
      buffedThisLevel: save.buffedThisLevel ?? fresh.buffedThisLevel,
      buffClickProgress: finite(
        save.buffClickProgress,
        fresh.buffClickProgress,
      ),
      buffOfferPending: save.buffOfferPending ?? fresh.buffOfferPending,
      buffRemaining: finite(save.buffRemaining, fresh.buffRemaining),
      portalUnlocked: save.portalUnlocked ?? fresh.portalUnlocked,
      helpers: fresh.helpers.map((h) => {
        const existing = save.helpers?.find((x) => x.id === h.id);
        if (!existing) return h;
        return {
          ...h,
          amountOwned: finite(existing.amountOwned, h.amountOwned),
          dynamicCost: finite(existing.dynamicCost, h.dynamicCost),
          dynamicIncrement: finite(
            existing.dynamicIncrement,
            h.dynamicIncrement,
          ),
        };
      }),
      chapters: fresh.chapters.map((c) => {
        const existing = save.chapters?.find((x) => x.id === c.id);
        return existing ?? c;
      }),
      achievements: {
        ...fresh.achievements,
        ...save.achievements,
        clickerGoal: Math.max(
          1,
          finite(save.achievements?.clickerGoal, fresh.achievements.clickerGoal),
        ),
        clickerCount: finite(
          save.achievements?.clickerCount,
          fresh.achievements.clickerCount,
        ),
        helperGoal: Math.max(
          1,
          finite(save.achievements?.helperGoal, fresh.achievements.helperGoal),
        ),
        helperCount: finite(
          save.achievements?.helperCount,
          fresh.achievements.helperCount,
        ),
        videoGoal: Math.max(
          1,
          finite(save.achievements?.videoGoal, fresh.achievements.videoGoal),
        ),
        videoCount: finite(
          save.achievements?.videoCount,
          fresh.achievements.videoCount,
        ),
        achievementGoal: Math.max(
          1,
          finite(
            save.achievements?.achievementGoal,
            fresh.achievements.achievementGoal,
          ),
        ),
        achievementCount: finite(
          save.achievements?.achievementCount,
          fresh.achievements.achievementCount,
        ),
        loginGoal: Math.max(
          1,
          finite(save.achievements?.loginGoal, fresh.achievements.loginGoal),
        ),
        loginCount: finite(
          save.achievements?.loginCount,
          fresh.achievements.loginCount,
        ),
        storyGoal: Math.max(
          1,
          finite(save.achievements?.storyGoal, fresh.achievements.storyGoal),
        ),
        storyCount: finite(
          save.achievements?.storyCount,
          fresh.achievements.storyCount,
        ),
        lastLoginDay:
          typeof save.achievements?.lastLoginDay === 'string'
            ? save.achievements.lastLoginDay
            : fresh.achievements.lastLoginDay,
      },
      unlockedRegions: (save.unlockedRegions?.length
        ? save.unlockedRegions
        : ['meadow']) as RegionId[],
      pendingOffline: finite(save.pendingOffline, fresh.pendingOffline),
      tutorialCompleted: inferTutorialCompleted(save, fresh),
      savedAt: typeof save.savedAt === 'string' ? save.savedAt : fresh.savedAt,
    };
  }
}
