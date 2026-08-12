import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { formatNumber } from '../../../utils/format';
import { addFramedPanel } from '../ui/FramedPanel';
import { createScrollList } from '../ui/ScrollList';
import { createRewardCard, rewardSlotHeight, type RewardRow } from './RewardCard';

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
    case 'video':
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
  const passive = ctx.economy.passivePerSecond(ctx.state);
  const hoursHint = (hours: number, base: string) =>
    `Rewards: ${base}\n(${formatNumber(passive * hours * 3600)} influence)`;

  const gap = 15;
  const colW = (innerW - gap) / 2;
  const slotH = rewardSlotHeight(colW);
  const rowH = slotH + gap;
  const rowCount = 3;
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
    itemHeight: slotH,
    rowCount,
    scroll: rewardsScroll,
    onScroll,
  });

  // Unity grid order: Helper, Clicker, Video, Earn Rewards, Login, Story
  const rows: RewardRow[] = [
    {
      id: 'helper',
      title: `Buy ${a.helperGoal} Tomes`,
      n: a.helperCount,
      goal: a.helperGoal,
      hint: 'Rewards: 3x influence from tomes',
      icon: 'ui-reward-shop',
    },
    {
      id: 'clicker',
      title: `Cast ${a.clickerGoal} spells`,
      n: a.clickerCount,
      goal: a.clickerGoal,
      hint: 'Rewards: 15x influence per click',
      icon: 'ui-reward-star',
    },
    {
      id: 'video',
      title: `Watch ${a.videoGoal} projections`,
      n: a.videoCount,
      goal: a.videoGoal,
      hint: hoursHint(10, '10 hours worth of influence'),
      icon: 'ui-reward-video',
      onWatch: true,
    },
    {
      id: 'meta',
      title: `Earn ${a.achievementGoal} Rewards`,
      n: a.achievementCount,
      goal: a.achievementGoal,
      hint: hoursHint(1, '1 hour worth of influence'),
      icon: 'ui-reward-trophy',
    },
    {
      id: 'login',
      title: `Log in for ${a.loginGoal} days`,
      n: a.loginCount,
      goal: a.loginGoal,
      hint: hoursHint(1, '1 hour worth of influence'),
      icon: 'ui-reward-notepad',
    },
    {
      id: 'story',
      title: 'Finish the Story',
      n: a.storyCount,
      goal: a.storyGoal,
      hint: hoursHint(10, '10 hours worth of influence'),
      icon: 'ui-reward-portal',
    },
  ];

  const claim = (id: RewardRow['id']): boolean => {
    switch (id) {
      case 'helper':
        return ctx.economy.claimHelper(ctx.state);
      case 'clicker':
        return ctx.economy.claimClicker(ctx.state);
      case 'video':
        return ctx.economy.claimVideo(ctx.state);
      case 'meta':
        return ctx.economy.claimMeta(ctx.state);
      case 'login':
        return ctx.economy.claimLogin(ctx.state);
      case 'story':
        return ctx.economy.claimStory(ctx.state);
    }
  };

  for (let i = 0; i < rowCount; i++) {
    const left = rows[i * 2];
    const right = rows[i * 2 + 1];
    const pair = scene.add.container(0, 0);
    const addSide = (row: RewardRow | undefined, x: number) => {
      if (!row) return;
      const card = createRewardCard(
        scene,
        colW,
        row,
        () => {
          if (scroll.wasDrag()) return;
          if (claim(row.id)) {
            ctx.audio.playSfx('coin');
            const info = achievementClaimInfo(
              row.id,
              row,
              ctx,
              ctx.economy.passivePerSecond(ctx.state),
            );
            rerender();
            onAchievementClaim(info);
          }
        },
        () => scroll.resetDrag(),
      );
      card.setX(x);
      pair.add(card);
    };
    addSide(left, -colW / 2 - gap / 4);
    addSide(right, colW / 2 + gap / 4);
    pair.setSize(innerW, slotH);
    pair.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, innerW, slotH),
      Phaser.Geom.Rectangle.Contains,
    );
    pair.on('pointerdown', scroll.pointerDown);
    pair.on('pointermove', scroll.pointerMove);
    pair.setX(listLeft + innerW / 2);
    scroll.addCard(pair);
  }
  scroll.apply();
}
