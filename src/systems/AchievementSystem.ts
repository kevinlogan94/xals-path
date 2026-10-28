import type { GameSave } from '../types';

export type WhatsNewId = 'bestiary-v1' | 'achievements-v1';

export const WHATS_NEW_IDS: WhatsNewId[] = ['bestiary-v1', 'achievements-v1'];

export function hasUnseenWhatsNew(seen: string[]): boolean {
  return WHATS_NEW_IDS.some((id) => !seen.includes(id));
}

export function markAllWhatsNewSeen(state: GameSave): void {
  for (const id of WHATS_NEW_IDS) {
    if (!state.whatsNewSeen.includes(id)) {
      state.whatsNewSeen.push(id);
    }
  }
}

export type AchievementId =
  | 'the_beginning'
  | 'caster'
  | 'scholar'
  | 'welcome_back'
  | 'collector'
  | 'tapper'
  | 'guardian'
  | 'end_of_an_age'
  | 'high_achiever'
  | 'traveler'
  | 'master'
  | 'cycle';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'the_beginning',
    title: 'The Beginning',
    description: 'Complete the tutorial with Xal.',
    icon: './assets/ui/OutlookFlower.png',
  },
  {
    id: 'caster',
    title: 'Caster',
    description: 'Upgrade spell casting 3 times.',
    icon: './assets/ui/reward-star.png',
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Claim your first Tome milestone reward.',
    icon: './assets/ui/reward-shop.png',
  },
  {
    id: 'welcome_back',
    title: 'Welcome Back',
    description: 'Claim a multi-day login reward.',
    icon: './assets/ui/reward-notepad.png',
  },
  {
    id: 'collector',
    title: 'Collector',
    description: 'Claim the Earn 10 Rewards milestone.',
    icon: './assets/ui/reward-trophy.png',
  },
  {
    id: 'tapper',
    title: 'Tapper',
    description: 'Cast 100 spells during a single Blessing of the Gods.',
    icon: './assets/ui/achievements/tapper.png',
  },
  {
    id: 'guardian',
    title: 'Guardian',
    description: "Complete Chapter 4 of Xal's story.",
    icon: './assets/ui/achievements/guardian.png',
  },
  {
    id: 'end_of_an_age',
    title: 'End of an Age',
    description: "Complete the final chapter of Xal's Path.",
    icon: './assets/ui/achievements/end_of_an_age.png',
  },
  {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Complete the entire story on your first day.',
    icon: './assets/ui/achievements/high_achiever.png',
  },
  {
    id: 'traveler',
    title: 'Traveler',
    description: 'Teleport to another realm using the Portal.',
    icon: './assets/ui/Portal2.png',
  },
  {
    id: 'master',
    title: 'Master',
    description: 'Summon at least one of every Tome in the library.',
    icon: './assets/ui/Tomes.png',
  },
  {
    id: 'cycle',
    title: 'Cycle',
    description: 'Claim the Finish the Story milestone.',
    icon: './assets/ui/achievements/cycle.png',
  },
];

function isChapterViewed(state: GameSave, chapterId: number): boolean {
  return state.chapters.some((c) => c.id === chapterId && c.sceneViewed);
}

function meetsCondition(
  id: AchievementId,
  state: GameSave,
  buffSessionClicks: number,
): boolean {
  switch (id) {
    case 'the_beginning':
      return state.tutorialCompleted === true;
    case 'caster':
      return state.clickerIncrement > 1000;
    case 'scholar':
      return state.achievements.helperGoal > 30;
    case 'welcome_back':
      return state.achievements.loginGoal > 2;
    case 'collector':
      return state.achievements.achievementGoal > 10;
    case 'tapper':
      return buffSessionClicks >= 100;
    case 'guardian':
      return isChapterViewed(state, 4);
    case 'end_of_an_age':
      return isChapterViewed(state, 7);
    case 'high_achiever':
      return (
        isChapterViewed(state, 7) &&
        state.achievements.loginCount <= 1 &&
        state.achievements.loginGoal === 2
      );
    case 'traveler':
      return false;
    case 'master':
      return (
        state.helpers.length > 0 &&
        state.helpers.every((h) => h.amountOwned > 0)
      );
    case 'cycle':
      return state.achievements.storyGoal > 2;
  }
}

export function unlockAchievement(
  state: GameSave,
  id: AchievementId,
): AchievementDef | null {
  if (state.unlockedAchievements.includes(id)) return null;
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (!def) return null;
  state.unlockedAchievements.push(id);
  return def;
}

export function evaluateAchievements(
  state: GameSave,
  buffSessionClicks = 0,
): AchievementDef[] {
  const newlyUnlocked: AchievementDef[] = [];
  for (const def of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(def.id)) continue;
    if (meetsCondition(def.id, state, buffSessionClicks)) {
      state.unlockedAchievements.push(def.id);
      newlyUnlocked.push(def);
    }
  }
  return newlyUnlocked;
}
