import Phaser from 'phaser';
import type { ChapterDef } from '../../../types';
import { fitInBox } from '../ui/fit';
import { darkText } from '../ui/textStyles';

export const CHAPTER_CARD_H = 88;
/** Air between card bottom and nav top. */
export const CHAPTER_CARD_NAV_GAP = 8;

interface ChapterCardConfig {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  chapter: ChapterDef | undefined;
  locked: boolean;
  onClick: () => void;
}

export function renderChapterCard({
  scene,
  container,
  chapter,
  locked,
  onClick,
}: ChapterCardConfig): void {
  container.removeAll(true);
  container.removeInteractive();
  if (!chapter) {
    container.setVisible(false);
    return;
  }

  const cardW = Math.min(360, scene.scale.width - 16);
  const mana = chapter.id >= 2 && chapter.id <= 4;
  // Same well as TomeRow / RewardCard (160² at 46,46 inside 840×260).
  const wellX = ((46 + 205) / 2 / 840) * cardW;
  const wellY = ((46 + 205) / 2 / 260) * CHAPTER_CARD_H;
  const wellSize = cardW * (160 / 840);
  const textLeft = -cardW / 2 + cardW * (221 / 840) + 8;
  const textRight = cardW / 2 - 14;
  const titleColor = locked ? '#4a4038' : '#1a1208';
  const metaColor = locked ? '#8b3030' : '#1a4a7a';

  const parts: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, 0, locked ? 'ui-achiev-box-pressed' : 'ui-achiev-box').setDisplaySize(
      cardW,
      CHAPTER_CARD_H,
    ),
    fitInBox(scene, locked ? 'ui-lock' : 'ui-portal-nav', wellSize * 0.7, wellSize * 0.7).setPosition(
      -cardW / 2 + wellX,
      -CHAPTER_CARD_H / 2 + wellY,
    ),
    scene.add
      .text(textLeft, -CHAPTER_CARD_H * 0.18, `Chapter ${chapter.id}`, darkText('10px', titleColor))
      .setOrigin(0, 0.5),
    scene.add
      .text(textLeft, CHAPTER_CARD_H * 0.18, chapter.name, darkText('13px', titleColor))
      .setOrigin(0, 0.5),
  ];
  if (locked) {
    parts.push(
      scene.add
        .text(
          textRight,
          mana ? -CHAPTER_CARD_H * 0.18 : 0,
          `Lvl ${chapter.levelRequirement}`,
          darkText('10px', metaColor),
        )
        .setOrigin(1, 0.5),
    );
  }
  if (mana) {
    parts.push(
      scene.add
        .text(textRight, locked ? CHAPTER_CARD_H * 0.18 : 0, '2x mana', darkText('10px', '#1a4a7a'))
        .setOrigin(1, 0.5),
    );
  }

  container.add(parts);
  container.setSize(cardW, CHAPTER_CARD_H);
  container.off('pointerdown');
  if (!locked) {
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, cardW, CHAPTER_CARD_H),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on('pointerdown', onClick);
  }
  container.setVisible(true);
}
