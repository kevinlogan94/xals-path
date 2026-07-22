import Phaser from 'phaser';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';

export interface RewardRow {
  id: 'clicker' | 'helper' | 'login' | 'story';
  title: string;
  n: number;
  goal: number;
  hint: string;
  icon: string;
}

/** Build one reward card directly onto the panel (same hit model as pre-split). */
export function addRewardCard(
  scene: Phaser.Scene,
  panel: Phaser.GameObjects.Container,
  x: number,
  y: number,
  colW: number,
  cardH: number,
  row: RewardRow,
  onClaim: () => void,
): void {
  const ready = row.n >= row.goal;
  const barW = colW - 28;

  panel.add(scene.add.image(x, y, 'ui-achiev-box').setDisplaySize(colW - 4, cardH));
  panel.add(scene.add.image(x - colW / 2 + 28, y - 40, row.icon).setDisplaySize(28, 28));
  panel.add(
    scene.add
      .text(
        x,
        y - 48,
        row.title,
        whiteText('7px', {
          align: 'center',
          wordWrap: { width: colW - 20 },
        }),
      )
      .setOrigin(0.5),
  );
  panel.add(scene.add.rectangle(x, y - 8, barW, 10, 0x1a140c).setStrokeStyle(1, 0x5a4030));
  panel.add(
    scene.add
      .rectangle(
        x - barW / 2,
        y - 8,
        Math.max(2, barW * Math.min(1, row.n / Math.max(1, row.goal))),
        10,
        0x5ecf5a,
      )
      .setOrigin(0, 0.5),
  );
  panel.add(scene.add.text(x, y - 8, `${row.n}/${row.goal}`, whiteText('7px')).setOrigin(0.5));
  panel.add(
    scene.add
      .text(
        x,
        y + 18,
        row.hint,
        whiteText('6px', {
          color: '#ffe6a8',
          align: 'center',
          wordWrap: { width: colW - 16 },
        }),
      )
      .setOrigin(0.5),
  );
  panel.add(
    createImageButton(
      scene,
      x,
      y + 48,
      'ui-btn-green',
      'Receive',
      colW - 36,
      28,
      ready ? onClaim : undefined,
      ready ? 1 : 0.45,
    ),
  );
}
