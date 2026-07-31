export type RegionId = 'meadow' | 'river' | 'altar';
/** Matches Unity BottomNav: overlays + Scene (tower) + Outlook (world). */
export type TabId =
  | 'outlook'
  | 'scene'
  | 'shop'
  | 'achievements'
  | 'settings';

export interface HelperDef {
  id: string;
  name: string;
  unlockLevel: number;
  cost: number;
  increment: number;
  creatureId: string;
  region: RegionId;
}

export interface CreatureDef {
  id: string;
  name: string;
  helperId: string;
  region: RegionId;
  description: string;
}

export interface QuoteLine {
  text: string;
  expression: string;
}

export interface ChapterDef {
  id: number;
  name: string;
  levelRequirement: number;
  speaker: 'xal' | 'barlog';
  quotes: QuoteLine[];
}

export interface HelperSave {
  id: string;
  amountOwned: number;
  dynamicCost: number;
  dynamicIncrement: number;
}

export interface ChapterSave {
  id: number;
  sceneViewed: boolean;
}

export interface AchievementSave {
  clickerGoal: number;
  clickerCount: number;
  helperGoal: number;
  helperCount: number;
  videoGoal: number;
  videoCount: number;
  achievementGoal: number;
  achievementCount: number;
  loginGoal: number;
  loginCount: number;
  lastLoginDay: string;
  storyGoal: number;
  storyCount: number;
}

export interface GameSave {
  version: 1;
  influence: number;
  totalInfluenceEarned: number;
  playerLevel: number;
  experienceRequired: number;
  clickerIncrement: number;
  mana: number;
  manaMax: number;
  manaLevel: number;
  region: RegionId;
  helpers: HelperSave[];
  chapters: ChapterSave[];
  achievements: AchievementSave;
  buffedThisLevel: boolean;
  buffClickProgress: number;
  buffRemaining: number;
  portalUnlocked: boolean;
  unlockedRegions: RegionId[];
  savedAt: string;
}
