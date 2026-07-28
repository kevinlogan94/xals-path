import Phaser from 'phaser';
import type { ChapterDef } from '../../../types';
import { fitInBox } from '../ui/fit';
import { whiteText } from '../ui/textStyles';

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
  container.disableInteractive();
  if (!chapter) {
    container.setVisible(false);
    return;
  }

  // Slightly taller than old strip so Lvl + 2x Mana both read when locked.
  const cardW = 268;
  const cardH = 104;
  const iconX = -93;
  const iconY = -4;
  const textX = -52;
  const bg = scene.add
    .image(0, 0, locked ? 'ui-achiev-box-pressed' : 'ui-achiev-box')
    .setDisplaySize(cardW, cardH);
  const icon = fitInBox(scene, locked ? 'ui-lock' : 'ui-portal-nav', 45,45).setPosition(iconX, iconY);
  const parts: Phaser.GameObjects.GameObject[] = [
    bg,
    icon,
    scene.add
      .text(textX, -16, `Chapter ${chapter.id}`, whiteText('8px', { color: '#c8b89a' }))
      .setOrigin(0, 0.5),
    scene.add
      .text(
        textX,
        6,
        chapter.name, 
        whiteText('9px', {
          color: locked ? '#888' : '#ffffff',
          wordWrap: { width: 152 },
        }),
      )
      .setOrigin(0, 0.5),
  ];

  // Unity ChapterButton: Lvl when locked; 2x Mana for ch 2–4 even while locked.
  if (locked) {
    parts.push(
      scene.add
        .text(textX, 28, `Lvl ${chapter.levelRequirement}`, whiteText('8px', { color: '#e08080' }))
        .setOrigin(0, 0.5),
    );
  }
  if (chapter.id >= 2 && chapter.id <= 4) {
    parts.push(
      scene.add
        .text(textX, locked ? 46 : 26, '2x Mana Increase', whiteText('7px', { color: '#9ec9ff' }))
        .setOrigin(0, 0.5),
    );
  }

  container.add(parts);
  container.setSize(cardW, cardH);
  container.off('pointerdown');
  if (!locked) {
    container.setInteractive(
      new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on('pointerdown', onClick);
  }
  container.setAlpha(locked ? 0.85 : 1);
  container.setVisible(true);
}
