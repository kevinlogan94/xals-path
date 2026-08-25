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
  const btnW = Math.max(72, Math.round(innerW * 0.2));
  const btnH = Math.max(32, Math.round(boxH * 0.46));
  const btnX = innerW / 2 - 18 - btnW / 2;
  const textW = btnX - btnW / 2 - 16 - textLeft;
  const barH = Math.max(14, Math.round(boxH * 0.18));
  const fillW = Math.max(2, textW * Math.min(1, row.n / Math.max(1, row.goal)));

  const card = scene.add
    .container(0, 0, [
      scene.add.image(0, 0, 'ui-tome-box').setDisplaySize(innerW, boxH),
      fitInBox(scene, row.icon, iconMax, iconMax).setPosition(
        -innerW / 2 + wellX,
        -boxH / 2 + wellY,
      ),
      scene.add.text(textLeft, -boxH * 0.28, row.title, darkText('12px')).setOrigin(0, 0.5),
      scene.add.rectangle(textLeft + textW / 2, 0, textW, barH, 0xb8b0a0).setStrokeStyle(1, 0x6a6058),
      scene.add.rectangle(textLeft, 0, fillW, barH, 0x5ecf5a).setOrigin(0, 0.5),
      scene.add.text(textLeft + textW / 2, 0, `${row.n}/${row.goal}`, darkText('10px')).setOrigin(0.5),
      scene.add
        .text(textLeft, boxH * 0.28, row.hint, darkText('10px', '#1a1208', { wordWrap: { width: textW } }))
        .setOrigin(0, 0.5),
      createImageButton(
        scene,
        btnX,
        0,
        'ui-btn-green',
        'Receive',
        btnW,
        btnH,
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
