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

/** Readable 2-col card; achiev-box stretches to the slot (Unity Image stretch). */
export function createRewardCard(
  scene: Phaser.Scene,
  colW: number,
  row: RewardRow,
  onClaim: () => void,
  onPressStart?: () => void,
): Phaser.GameObjects.Container {
  const ready = row.n >= row.goal;
  const cardW = colW - 4;
  const slotH = rewardSlotHeight(colW);
  const barW = cardW - 24;
  const iconX = -cardW / 2 + 14;
  const titleY = -slotH * 0.32;

  const parts: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, 0, 'ui-achiev-box').setDisplaySize(cardW, slotH),
    scene.add.image(iconX, titleY, row.icon).setDisplaySize(16, 16),
    scene.add
      .text(iconX + 12, titleY, row.title, whiteText('6px', { wordWrap: { width: cardW - 40 } }))
      .setOrigin(0, 0.5),
    scene.add.rectangle(0, -slotH * 0.08, barW, 7, 0x1a140c).setStrokeStyle(1, 0x5a4030),
    scene.add
      .rectangle(
        -barW / 2,
        -slotH * 0.08,
        Math.max(2, barW * Math.min(1, row.n / Math.max(1, row.goal))),
        7,
        0x5ecf5a,
      )
      .setOrigin(0, 0.5),
    scene.add.text(0, -slotH * 0.08, `${row.n}/${row.goal}`, whiteText('5px')).setOrigin(0.5),
    scene.add
      .text(
        0,
        slotH * 0.14,
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
  const btnH = 18;
  if (row.onWatch) {
    parts.push(
      createImageButton(
        scene,
        -cardW * 0.22,
        btnY,
        'ui-btn-blue',
        'Watch',
        cardW * 0.4,
        btnH,
        row.onWatch,
        1,
        '5px',
        onPressStart,
      ),
      createImageButton(
        scene,
        cardW * 0.22,
        btnY,
        'ui-btn-green',
        'Receive',
        cardW * 0.4,
        btnH,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '5px',
        onPressStart,
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
        btnH,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '5px',
        onPressStart,
      ),
    );
  }

  return scene.add.container(0, 0, parts).setSize(cardW, slotH);
}

export function rewardSlotHeight(colW: number): number {
  // Tall enough for title/bar/hint/buttons; wider than pure 840×260 at 2-col width.
  return Math.max(112, Math.round((colW - 4) * 0.62));
}
