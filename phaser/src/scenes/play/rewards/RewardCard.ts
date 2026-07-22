import Phaser from 'phaser';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';

export type RewardId = 'helper' | 'clicker' | 'video' | 'meta' | 'login' | 'story';

export interface RewardRow {
  id: RewardId;
  title: string;
  n: number;
  goal: number;
  hint: string;
  icon: string;
  onWatch?: () => void;
}

/**
 * Reward card: achiev-box keeps 840×260 aspect (no tall squash).
 * Slot is a bit taller than the frame so title/bar/Receive stay readable.
 */
export function createRewardCard(
  scene: Phaser.Scene,
  colW: number,
  row: RewardRow,
  onClaim: () => void,
): Phaser.GameObjects.Container {
  const ready = row.n >= row.goal;
  const cardW = colW - 4;
  const frameH = Math.round(cardW * (260 / 840));
  const slotH = Math.max(frameH + 36, 96);
  const barW = cardW - 24;

  const parts: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, -((slotH - frameH) / 2), 'ui-achiev-box').setDisplaySize(cardW, frameH),
    scene.add.image(-cardW / 2 + 16, -slotH * 0.32, row.icon).setDisplaySize(18, 18),
    scene.add
      .text(6, -slotH * 0.32, row.title, whiteText('6px', { wordWrap: { width: cardW - 40 } }))
      .setOrigin(0.5),
    scene.add.rectangle(0, -slotH * 0.08, barW, 8, 0x1a140c).setStrokeStyle(1, 0x5a4030),
    scene.add
      .rectangle(
        -barW / 2,
        -slotH * 0.08,
        Math.max(2, barW * Math.min(1, row.n / Math.max(1, row.goal))),
        8,
        0x5ecf5a,
      )
      .setOrigin(0, 0.5),
    scene.add.text(0, -slotH * 0.08, `${row.n}/${row.goal}`, whiteText('5px')).setOrigin(0.5),
    scene.add
      .text(
        0,
        slotH * 0.12,
        row.hint,
        whiteText('5px', {
          color: '#ffe6a8',
          align: 'center',
          wordWrap: { width: cardW - 10 },
        }),
      )
      .setOrigin(0.5),
  ];

  const btnY = slotH * 0.36;
  if (row.onWatch) {
    parts.push(
      createImageButton(
        scene,
        -cardW * 0.22,
        btnY,
        'ui-btn-blue',
        'Watch',
        cardW * 0.4,
        18,
        row.onWatch,
        1,
        '5px',
      ),
      createImageButton(
        scene,
        cardW * 0.22,
        btnY,
        'ui-btn-green',
        'Receive',
        cardW * 0.4,
        18,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '5px',
      ),
    );
  } else {
    parts.push(
      createImageButton(
        scene,
        0,
        btnY,
        'ui-btn-green',
        'Receive',
        cardW - 28,
        18,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '5px',
      ),
    );
  }

  return scene.add.container(0, 0, parts).setSize(cardW, slotH);
}

export function rewardSlotHeight(colW: number): number {
  const cardW = colW - 4;
  const frameH = Math.round(cardW * (260 / 840));
  return Math.max(frameH + 36, 96);
}
