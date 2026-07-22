import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { addFramedPanel } from '../ui/FramedPanel';
import { createRewardCard, type RewardRow } from './RewardCard';

interface RewardsPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  showToast: (message: string) => void;
  rerender: () => void;
}

export function renderRewardsPanel({
  scene,
  panel,
  ctx,
  showToast,
  rerender,
}: RewardsPanelConfig): void {
  const w = scene.scale.width;
  const contentTop = addFramedPanel(scene, panel, 'Rewards').listTop;
  const a = ctx.state.achievements;
  const rows: RewardRow[] = [
    {
      id: 'clicker',
      title: `Cast ${a.clickerGoal} spells`,
      n: a.clickerCount,
      goal: a.clickerGoal,
      hint: '×15 influence per click',
      icon: 'ui-reward-star',
    },
    {
      id: 'helper',
      title: `Buy ${a.helperGoal} Tomes`,
      n: a.helperCount,
      goal: a.helperGoal,
      hint: '×3 influence from tomes',
      icon: 'ui-reward-shop',
    },
    {
      id: 'login',
      title: `Log in for ${a.loginGoal} days`,
      n: a.loginCount,
      goal: a.loginGoal,
      hint: '1 hour of influence',
      icon: 'ui-reward-notepad',
    },
    {
      id: 'story',
      title: 'Finish the Story',
      n: a.storyCount,
      goal: a.storyGoal,
      hint: '10 hours of influence',
      icon: 'ui-reward-portal',
    },
  ];

  const colW = (w - 40) / 2;
  const cardH = 148;
  rows.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 20 + col * (colW + 4) + colW / 2;
    const y = contentTop + 16 + row * (cardH + 10) + cardH / 2;
    const card = createRewardCard(scene, x, y, colW, cardH, r, () => {
      const ok =
        r.id === 'clicker'
          ? ctx.economy.claimClicker(ctx.state)
          : r.id === 'helper'
            ? ctx.economy.claimHelper(ctx.state)
            : r.id === 'login'
              ? ctx.economy.claimLogin(ctx.state)
              : ctx.economy.claimStory(ctx.state);
      if (ok) {
        ctx.audio.playSfx('coin');
        showToast('Reward received');
        rerender();
      }
    });
    panel.add(card);
  });
}
