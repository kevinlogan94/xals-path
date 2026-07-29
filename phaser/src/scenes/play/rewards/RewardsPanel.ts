import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { formatNumber } from '../../../utils/format';
import { addFramedPanel } from '../ui/FramedPanel';
import { createScrollList } from '../ui/ScrollList';
import { createRewardCard, rewardSlotHeight, type RewardRow } from './RewardCard';

interface RewardsPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  rewardsScroll: number;
  onScroll: (scroll: number) => void;
  showToast: (message: string) => void;
  rerender: () => void;
}

export function renderRewardsPanel({
  scene,
  panel,
  ctx,
  rewardsScroll,
  onScroll,
  showToast,
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
      onWatch: () => {
        if (scroll.wasDrag()) return;
        ctx.economy.watchProjection(ctx.state);
        showToast('Projection watched');
        rerender();
      },
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
            showToast('Reward received');
            rerender();
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
      new Phaser.Geom.Rectangle(-innerW / 2, -slotH / 2, innerW, slotH),
      Phaser.Geom.Rectangle.Contains,
    );
    pair.on('pointerdown', scroll.pointerDown);
    pair.on('pointermove', scroll.pointerMove);
    pair.setX(listLeft + innerW / 2);
    scroll.addCard(pair);
  }
  scroll.apply();
}
