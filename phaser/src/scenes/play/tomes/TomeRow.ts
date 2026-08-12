import Phaser from 'phaser';
import type { HelperDef, HelperSave } from '../../../types';
import { formatNumber } from '../../../utils/format';
import { fitInBox } from '../ui/fit';
import { darkText } from '../ui/textStyles';

interface TomeRowConfig {
  scene: Phaser.Scene;
  def: HelperDef;
  save: HelperSave;
  locked: boolean;
  innerW: number;
  boxH: number;
  onPointerDown: (pointer: Phaser.Input.Pointer) => void;
  onPointerMove: (pointer: Phaser.Input.Pointer) => void;
  onBuy: () => void;
}

export function createTomeRow({
  scene,
  def,
  save,
  locked,
  innerW,
  boxH,
  onPointerDown,
  onPointerMove,
  onBuy,
}: TomeRowConfig): Phaser.GameObjects.Container {
  const boxKey = locked ? 'ui-tome-locked' : 'ui-tome-box';
  const box = scene.add.image(0, 0, boxKey).setDisplaySize(innerW, boxH);

  // achiev_box bakes a 160x160 white well at (46,46) inside 840x260.
  const wellX = ((46 + 205) / 2 / 840) * innerW;
  const wellY = ((46 + 205) / 2 / 260) * boxH;
  const wellSize = innerW * (160 / 840);
  const avatarMax = wellSize - wellSize * 0.1 * 2;
  const lockMax = avatarMax * (130 / 112);
  const avatarX = -innerW / 2 + wellX;
  const avatarY = -boxH / 2 + wellY;
  const emblemKey = `tome-${def.id}`;
  let avatar: Phaser.GameObjects.GameObject;
  if (locked && scene.textures.exists('ui-lock')) {
    avatar = fitInBox(scene, 'ui-lock', lockMax, lockMax).setPosition(avatarX, avatarY);
  } else if (scene.textures.exists(emblemKey)) {
    avatar = fitInBox(scene, emblemKey, avatarMax, avatarMax).setPosition(avatarX, avatarY);
  } else {
    avatar = scene.add.circle(avatarX, avatarY, avatarMax / 2, 0x445544);
  }

  const textLeft = -innerW / 2 + innerW * (221 / 840) + 8;
  const textRight = innerW / 2 - 10;
  const titleColor = locked ? '#4a4038' : '#1a1208';
  const metaColor = locked ? '#5a5048' : '#1a1208';
  const costIcon = fitInBox(scene, 'ui-influence', 16, 14);
  costIcon.setPosition(textLeft + costIcon.displayWidth / 2, boxH * 0.2);

  const nameText = scene.add
    .text(textLeft, -boxH * 0.22, def.name, darkText('12px', titleColor))
    .setOrigin(0, 0.5);
  const costText = scene.add
    .text(textLeft + costIcon.displayWidth + 4, boxH * 0.2, formatNumber(save.dynamicCost), darkText('10px', metaColor))
    .setOrigin(0, 0.5);
  const ownedText = scene.add
    .text(textRight, -boxH * 0.2, locked ? `Lvl ${def.unlockLevel}` : String(save.amountOwned), darkText(locked ? '11px' : '16px', titleColor))
    .setOrigin(1, 0.5);
  const rateText = scene.add
    .text(textRight, boxH * 0.22, `${formatNumber(save.dynamicIncrement)}/sec`, darkText('9px', metaColor))
    .setOrigin(1, 0.5);
  shrinkToGap(nameText, ownedText);
  shrinkToGap(costText, rateText, true);

  const card = scene.add
    .container(0, 0, [box, avatar, nameText, costIcon, costText, ownedText, rateText])
    .setSize(innerW, boxH);

  card.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, innerW, boxH),
    Phaser.Geom.Rectangle.Contains,
  );
  card.on('pointerdown', onPointerDown);
  card.on('pointermove', onPointerMove);
  if (!locked) card.on('pointerup', onBuy);
  return card;
}

function shrinkToGap(left: Phaser.GameObjects.Text, right: Phaser.GameObjects.Text, shrinkLeft = false) {
  const px = (t: Phaser.GameObjects.Text) => Number.parseInt(String(t.style.fontSize), 10);
  for (let i = 0; i < 12; i++) {
    if (left.x + left.width + 8 <= right.x - right.width) return;
    if (px(right) > 6) right.setFontSize(px(right) - 1);
    else if (shrinkLeft && px(left) > 6) left.setFontSize(px(left) - 1);
    else return;
  }
}
