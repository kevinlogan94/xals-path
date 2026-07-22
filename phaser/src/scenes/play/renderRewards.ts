import Phaser from 'phaser';
import type { GameContext } from '../../game/GameContext';
import { FONT } from './constants';
import { addFramedPanel } from './framedPanel';

export function renderRewards(opts: {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  showToast: (msg: string) => void;
  reload: () => void;
}): void {
  const { scene, panel, ctx, showToast, reload } = opts;
  const w = scene.scale.width;
  const contentTop = addFramedPanel(scene, panel, 'Rewards');
  const a = ctx.state.achievements;
  const rows: {
    id: 'clicker' | 'helper' | 'login' | 'story';
    title: string;
    n: number;
    goal: number;
    hint: string;
    icon: string;
  }[] = [
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
    const ready = r.n >= r.goal;

    panel.add(
      scene.add.image(x, y, 'ui-achiev-box').setDisplaySize(colW - 4, cardH),
    );
    panel.add(
      scene.add
        .image(x - colW / 2 + 28, y - 40, r.icon)
        .setDisplaySize(28, 28),
    );
    panel.add(
      scene.add
        .text(x, y - 48, r.title, {
          fontFamily: FONT,
          fontSize: '7px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
          align: 'center',
          wordWrap: { width: colW - 20 },
        })
        .setOrigin(0.5),
    );

    const barW = colW - 28;
    panel.add(
      scene.add.rectangle(x, y - 8, barW, 10, 0x1a140c).setStrokeStyle(1, 0x5a4030),
    );
    panel.add(
      scene.add
        .rectangle(
          x - barW / 2,
          y - 8,
          Math.max(2, barW * Math.min(1, r.n / Math.max(1, r.goal))),
          10,
          0x5ecf5a,
        )
        .setOrigin(0, 0.5),
    );
    panel.add(
      scene.add
        .text(x, y - 8, `${r.n}/${r.goal}`, {
          fontFamily: FONT,
          fontSize: '7px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5),
    );
    panel.add(
      scene.add
        .text(x, y + 18, r.hint, {
          fontFamily: FONT,
          fontSize: '6px',
          color: '#ffe6a8',
          stroke: '#1a1208',
          strokeThickness: 3,
          align: 'center',
          wordWrap: { width: colW - 16 },
        })
        .setOrigin(0.5),
    );

    const btn = scene.add
      .image(x, y + 48, 'ui-btn-green')
      .setDisplaySize(colW - 36, 28)
      .setAlpha(ready ? 1 : 0.45);
    panel.add(btn);
    panel.add(
      scene.add
        .text(x, y + 48, 'Receive', {
          fontFamily: FONT,
          fontSize: '8px',
          color: '#ffffff',
          stroke: '#1a1208',
          strokeThickness: 3,
        })
        .setOrigin(0.5),
    );

    if (ready) {
      btn.setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
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
          reload();
        }
      });
    }
  });
}
