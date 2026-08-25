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

/** Wide row on ui-tome-box (840×260), same layout family as TomeRow. */
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
  const iconMax = wellSize * 0.85;
  const textLeft = -innerW / 2 + innerW * (221 / 840) + 8;
  const textRight = innerW / 2 - 18;
  const btnW = Math.max(72, Math.round(innerW * 0.18));
  const barH = Math.max(24, Math.round(boxH * 0.16));
  const titleY = -boxH * 0.26;
  const barY = -boxH * 0.06;
  const btnX = textRight - btnW / 2;
  const textW = btnX - btnW / 2 - 12 - textLeft;
  const hintW = textRight - textLeft;
  const fillW = Math.max(2, textW * Math.min(1, row.n / Math.max(1, row.goal)));
  const title = scene.add.text(textLeft, titleY, row.title, darkText('12px')).setOrigin(0, 0.5);

  const card = scene.add
    .container(0, 0, [
      scene.add.image(0, 0, 'ui-tome-box').setDisplaySize(innerW, boxH),
      fitInBox(scene, row.icon, iconMax, iconMax).setPosition(
        -innerW / 2 + wellX,
        -boxH / 2 + wellY,
      ),
      title,
      scene.add.rectangle(textLeft + textW / 2, barY, textW, barH, 0xb8b0a0).setStrokeStyle(1, 0x6a6058),
      scene.add.rectangle(textLeft, barY, fillW, barH, 0x5ecf5a).setOrigin(0, 0.5),
      scene.add.text(textLeft + textW / 2, barY, `${row.n}/${row.goal}`, darkText('10px')).setOrigin(0.5),
      scene.add
        .text(textLeft, boxH * 0.28, row.hint, darkText('10px', '#1a1208', { wordWrap: { width: hintW } }))
        .setOrigin(0, 0.5),
      createImageButton(
        scene,
        btnX,
        barY,
        'ui-btn-green',
        'Receive',
        btnW,
        barH,
        ready ? onClaim : undefined,
        ready ? 1 : 0.45,
        '8px',
        onPressStart,
      ),
    ])
    .setSize(innerW, boxH);

  card.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, innerW, boxH),
    Phaser.Geom.Rectangle.Contains,
  );
  return card;
}
