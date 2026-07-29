import Phaser from 'phaser';
import { createImageButton } from '../ui/ImageButton';
import { fitInBox } from '../ui/fit';
import { darkText } from '../ui/textStyles';

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

/** Unity Achievement.prefab uses item_slot.png (260×260). */
const SLOT = 260;

function mapX(w: number, x: number): number {
  return -w / 2 + w * (x / SLOT);
}

function mapY(h: number, y: number): number {
  return -h / 2 + h * (y / SLOT);
}

/** 2-col reward card; square item_slot frame like Unity Achievement.prefab. */
export function createRewardCard(
  scene: Phaser.Scene,
  colW: number,
  row: RewardRow,
  onClaim: () => void,
  onPressStart?: () => void,
): Phaser.GameObjects.Container {
  const ready = row.n >= row.goal;
  const cardW = colW - 4;
  const cardH = rewardSlotHeight(colW);
  const x = (n: number) => mapX(cardW, n);
  const y = (n: number) => mapY(cardH, n);

  const bg = scene.add.image(0, 0, 'ui-item-slot').setDisplaySize(cardW, cardH);

  // Top row: icon left, title in right two-thirds.
  const iconX = x(52);
  const iconY = y(62);
  const iconMax = cardW * (76 / SLOT);
  const titleX = x(92);
  const titleW = cardW * (158 / SLOT);

  // Progress bar spans inner parchment width.
  const barX = x(22);
  const barW = cardW * (216 / SLOT);
  const barH = Math.max(10, Math.round(cardH * (22 / SLOT)));
  const barY = y(112);

  const hintY = y(168);
  const hintW = cardW * (220 / SLOT);
  const btnH = Math.max(14, Math.round(cardH * (28 / SLOT)));
  const btnW = cardW * (216 / SLOT);
  const btnY = y(224);

  const parts: Phaser.GameObjects.GameObject[] = [
    bg,
    fitInBox(scene, row.icon, iconMax, iconMax).setPosition(iconX, iconY),
    scene.add
      .text(titleX, y(38), row.title, darkText('5px', '#1a1208', { wordWrap: { width: titleW } }))
      .setOrigin(0, 0.5),
    scene.add.rectangle(barX + barW / 2, barY, barW, barH, 0xb8b0a0).setStrokeStyle(1, 0x6a6058),
    scene.add
      .rectangle(
        barX,
        barY,
        Math.max(2, barW * Math.min(1, row.n / Math.max(1, row.goal))),
        barH,
        0x5ecf5a,
      )
      .setOrigin(0, 0.5),
    scene.add
      .text(barX + barW / 2, barY, `${row.n}/${row.goal}`, darkText('5px', '#1a1208'))
      .setOrigin(0.5),
    scene.add
      .text(x(130), hintY, row.hint, darkText('4px', '#1a1208', { align: 'center', wordWrap: { width: hintW } }))
      .setOrigin(0.5),
  ];

  if (row.onWatch) {
    const halfW = btnW * 0.47;
    parts.push(
      createImageButton(
        scene,
        x(130) - halfW * 0.55,
        btnY,
        'ui-btn-blue',
        'Watch',
        halfW,
        btnH,
        row.onWatch,
        1,
        '4px',
        onPressStart,
      ),
      createImageButton(
        scene,
        x(130) + halfW * 0.55,
        btnY,
        'ui-btn-green',
        'Receive',
        halfW,
        btnH,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '4px',
        onPressStart,
      ),
    );
  } else {
    parts.push(
      createImageButton(
        scene,
        x(130),
        btnY,
        'ui-btn-green',
        'Receive',
        btnW,
        btnH,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '4px',
        onPressStart,
      ),
    );
  }

  return scene.add.container(0, 0, parts).setSize(cardW, cardH);
}

export function rewardSlotHeight(colW: number): number {
  return colW - 4;
}
