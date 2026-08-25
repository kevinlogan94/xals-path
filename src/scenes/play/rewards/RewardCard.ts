import Phaser from 'phaser';
import { createImageButton } from '../ui/ImageButton';
import { fitInBox } from '../ui/fit';
import { darkText } from '../ui/textStyles';

export type RewardId = 'helper' | 'clicker' | 'meta' | 'login' | 'story';

export interface RewardRow {
  id: RewardId;
  title: string;
  n: number;
  goal: number;
  hint: string;
  icon: string;
}

const GAP = 8;
const CHIP_PAD_X = 10;
const CHIP_PAD_Y = 6;
const CLAIM_W = 100;

/** Title + prize chip; progress bar in-flight, Claim when ready. */
export function createRewardCard(
  scene: Phaser.Scene,
  innerW: number,
  boxH: number,
  row: RewardRow,
  onClaim: () => void,
  onPressStart?: () => void,
): Phaser.GameObjects.Container {
  const ready = row.n >= row.goal;
  const wellX = ((46 + 205) / 2 / 840) * innerW;
  const wellY = ((46 + 205) / 2 / 260) * boxH;
  const wellSize = innerW * (160 / 840);
  const textLeft = -innerW / 2 + innerW * (221 / 840) + 8;
  const textW = innerW / 2 - 18 - textLeft;
  const barH = Math.max(22, Math.round(boxH * 0.16));
  const frac = `${row.n}/${row.goal}`;
  const fillW = Math.max(2, textW * Math.min(1, row.n / Math.max(1, row.goal)));

  const kids: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, 0, 'ui-tome-box').setDisplaySize(innerW, boxH),
  ];
  if (ready) {
    kids.push(
      scene.add.rectangle(0, 0, innerW - 6, boxH - 6, 0xd4a017, 0).setStrokeStyle(3, 0xd4a017),
    );
  }

  const title = scene.add.text(textLeft, -boxH / 2 + 12, row.title, darkText('12px')).setOrigin(0, 0);
  const prize = chip(scene, textLeft, title.y + title.height + GAP, row.hint, textW);
  const actionY = prize.y + prize.h + GAP + barH / 2;

  kids.push(
    fitInBox(scene, row.icon, wellSize * 0.85, wellSize * 0.85).setPosition(
      -innerW / 2 + wellX,
      -boxH / 2 + wellY,
    ),
    title,
    prize.container,
  );
  if (ready) {
    kids.push(
      createImageButton(
        scene,
        textLeft + textW / 2,
        actionY,
        'ui-btn-green',
        'Claim',
        CLAIM_W,
        barH,
        onClaim,
        1,
        '8px',
        onPressStart,
      ),
    );
  } else {
    kids.push(bar(scene, textLeft, actionY, textW, barH, fillW, frac));
  }

  const card = scene.add.container(0, 0, kids).setSize(innerW, boxH);
  card.setInteractive(new Phaser.Geom.Rectangle(0, 0, innerW, boxH), Phaser.Geom.Rectangle.Contains);
  return card;
}

function bar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  fillW: number,
  label: string,
): Phaser.GameObjects.Container {
  return scene.add.container(0, 0, [
    scene.add.rectangle(x + w / 2, y, w, h, 0xb8b0a0).setStrokeStyle(1, 0x6a6058),
    scene.add.rectangle(x, y, fillW, h, 0x5ecf5a).setOrigin(0, 0.5),
    scene.add.text(x + w / 2, y, label, darkText('10px')).setOrigin(0.5),
  ]);
}

function chip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  maxW: number,
): { container: Phaser.GameObjects.Container; y: number; h: number } {
  const t = scene.add
    .text(
      x + CHIP_PAD_X,
      y + CHIP_PAD_Y,
      label,
      darkText('8px', '#3d2a18', { wordWrap: { width: maxW - CHIP_PAD_X * 2 } }),
    )
    .setOrigin(0, 0);
  const w = Math.min(maxW, t.width + CHIP_PAD_X * 2);
  const h = t.height + CHIP_PAD_Y * 2;
  return {
    y,
    h,
    container: scene.add.container(0, 0, [
      scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0xe8d5a3).setStrokeStyle(1, 0x8a7048),
      t,
    ]),
  };
}
