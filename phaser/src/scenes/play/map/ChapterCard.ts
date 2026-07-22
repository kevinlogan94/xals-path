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

  const cardW = 260;
  const cardH = 92;
  const bg = scene.add
    .image(0, 0, locked ? 'ui-achiev-box-pressed' : 'ui-achiev-box')
    .setDisplaySize(cardW, cardH);
  const icon = fitInBox(scene, locked ? 'ui-lock' : 'ui-portal-nav', 36, 36).setPosition(-92, 0);
  const parts: Phaser.GameObjects.GameObject[] = [
    bg,
    icon,
    scene.add
      .text(-64, -22, `Chapter ${chapter.id}`, whiteText('8px', { color: '#c8b89a' }))
      .setOrigin(0, 0.5),
    scene.add
      .text(
        -64,
        0,
        chapter.name,
        whiteText('9px', {
          color: locked ? '#888' : '#ffffff',
          wordWrap: { width: 150 },
        }),
      )
      .setOrigin(0, 0.5),
  ];

  if (locked) {
    parts.push(
      scene.add
        .text(-64, 24, `Lvl ${chapter.levelRequirement}`, whiteText('8px', { color: '#e08080' }))
        .setOrigin(0, 0.5),
    );
  } else if (chapter.id >= 2 && chapter.id <= 4) {
    parts.push(
      scene.add
        .text(-64, 24, '2x Mana Increase', whiteText('7px', { color: '#9ec9ff' }))
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
