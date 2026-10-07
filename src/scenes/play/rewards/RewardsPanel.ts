import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { formatNumber } from '../../../utils/format';
import { addFramedPanel } from '../ui/FramedPanel';
import { createScrollList } from '../ui/ScrollList';
import { createRewardCard, type RewardRow } from './RewardCard';

export type AchievementClaimInfo = {
  id: RewardRow['id'];
  title: string;
  description: string;
  iconKey: string;
  before: string;
  after: string;
};

interface RewardsPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  rewardsScroll: number;
  onScroll: (scroll: number) => void;
  onAchievementClaim: (info: AchievementClaimInfo) => void;
  rerender: () => void;
}

function achievementClaimInfo(
  id: RewardRow['id'],
  row: RewardRow,
  ctx: GameContext,
  passive: number,
): AchievementClaimInfo {
  const { influence, clickerIncrement } = ctx.state;
  let before: string;
  let after: string;
  switch (id) {
    case 'helper':
      before = `${formatNumber(passive / 3)}/sec`;
      after = `${formatNumber(passive)}/sec`;
      break;
    case 'clicker':
      before = `${formatNumber(clickerIncrement / 15)}/click`;
      after = `${formatNumber(clickerIncrement)}/click`;
      break;
    case 'story': {
      const grant = passive * 36000;
      before = formatNumber(influence - grant);
      after = formatNumber(influence);
      break;
    }
    default: {
      const grant = passive * 3600;
      before = formatNumber(influence - grant);
      after = formatNumber(influence);
      break;
    }
  }
  return { id, title: row.title, description: row.hint, iconKey: row.icon, before, after };
}

export function renderRewardsPanel({
  scene,
  panel,
  ctx,
  rewardsScroll,
  onScroll,
  onAchievementClaim,
  rerender,
}: RewardsPanelConfig): void {
  const { dim, listTop, listBottom, listLeft, listWidth: innerW, scrollX } = addFramedPanel(
    scene,
    panel,
    'Rewards',
  );
  const a = ctx.state.achievements;
  const hoursHint = (hours: number) => `${hours}h of influence`;

  const boxH = Math.round(innerW * (260 / 840));
  const rowH = boxH + 10;
  const listMidX = listLeft + innerW / 2;

  // Helper, Clicker, Earn Rewards, Login, Story
  const rows: RewardRow[] = [
    {
      id: 'helper',
      title: `Buy ${a.helperGoal} Tomes`,
      n: a.helperCount,
      goal: a.helperGoal,
      hint: '3x influence from tomes',
      icon: 'ui-reward-shop',
    },
    {
      id: 'clicker',
      title: `Cast ${a.clickerGoal} spells`,
      n: a.clickerCount,
      goal: a.clickerGoal,
      hint: '15x influence per click',
      icon: 'ui-reward-star',
    },
    {
      id: 'meta',
      title: `Earn ${a.achievementGoal} Rewards`,
      n: a.achievementCount,
      goal: a.achievementGoal,
      hint: hoursHint(1),
      icon: 'ui-reward-trophy',
    },
    {
      id: 'login',
      title: `Log in for ${a.loginGoal} days`,
      n: a.loginCount,
      goal: a.loginGoal,
      hint: hoursHint(1),
      icon: 'ui-reward-notepad',
    },
    {
      id: 'story',
      title: 'Finish the Story',
      n: a.storyCount,
      goal: a.storyGoal,
      hint: hoursHint(10),
      icon: 'ui-reward-portal',
    },
  ];

  const claim = (id: RewardRow['id']): boolean => {
    switch (id) {
      case 'helper':
        return ctx.economy.claimHelper(ctx.state);
      case 'clicker':
        return ctx.economy.claimClicker(ctx.state);
      case 'meta':
        return ctx.economy.claimMeta(ctx.state);
      case 'login':
        return ctx.economy.claimLogin(ctx.state);
      case 'story':
        return ctx.economy.claimStory(ctx.state);
    }
  };

  const scroll = createScrollList({
    scene,
    panel,
    dim,
    listTop,
    listBottom,
    listLeft,
    listWidth: innerW,
    scrollX,
    rowHeight: rowH,
    itemHeight: boxH,
    rowCount: rows.length,
    scroll: rewardsScroll,
    onScroll,
  });

  for (const row of rows) {
    const card = createRewardCard(scene, innerW, boxH, row, () => {
      if (scroll.wasDrag()) return;
      if (claim(row.id)) {
        ctx.audio.playSfx('levelup');
        rerender();
        onAchievementClaim(
          achievementClaimInfo(row.id, row, ctx, ctx.economy.passivePerSecond(ctx.state)),
        );
      }
    }, () => scroll.resetDrag());
    card.on('pointerdown', scroll.pointerDown);
    card.on('pointermove', scroll.pointerMove);
    card.setX(listMidX);
    scroll.addCard(card);
  }
  scroll.apply();
}
