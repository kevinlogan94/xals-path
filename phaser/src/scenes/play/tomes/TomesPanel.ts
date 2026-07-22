import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { addFramedPanel } from '../ui/FramedPanel';
import { createScrollList } from '../ui/ScrollList';
import { createTomeRow } from './TomeRow';

interface TomesPanelConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  shopScroll: number;
  onScroll: (scroll: number) => void;
  showToast: (message: string) => void;
  rerender: () => void;
}

export function renderTomesPanel({
  scene,
  panel,
  ctx,
  shopScroll,
  onScroll,
  showToast,
  rerender,
}: TomesPanelConfig): void {
  const { dim, listTop, listBottom, listLeft, listWidth: innerW, scrollX } = addFramedPanel(
    scene,
    panel,
    'Tomes',
  );

  // Tome box art is 840x260; keep that aspect so rows aren't vertically squashed.
  const boxH = Math.round(innerW * (260 / 840));
  const rowGap = 10;
  const rowH = boxH + rowGap;
  const listMidX = listLeft + innerW / 2;
  const scroll = createScrollList({
    scene,
    panel,
    dim,
    listTop,
    listBottom,
    listLeft,
    listWidth: innerW,
    scrollX,
    rowHeight: rowH,
    itemHeight: boxH,
    rowCount: ctx.economy.helpers.length,
    scroll: shopScroll,
    onScroll,
  });

  ctx.economy.helpers.forEach((def) => {
    const save = ctx.state.helpers.find((hh) => hh.id === def.id)!;
    const locked = ctx.state.playerLevel < def.unlockLevel;
    const card = createTomeRow({
      scene,
      def,
      save,
      locked,
      innerW,
      boxH,
      onPointerDown: scroll.pointerDown,
      onPointerMove: scroll.pointerMove,
      onBuy: () => {
        if (scroll.wasDrag()) return;
        if (ctx.economy.buyHelper(ctx.state, def.id)) {
          ctx.audio.playSfx('coin');
          const owned = ctx.state.helpers.find((hh) => hh.id === def.id)!;
          if (owned.amountOwned === 1) {
            showToast(`${def.name} tome — ${def.creatureId} unbound`);
          }
          rerender();
        } else {
          showToast('Not enough influence');
        }
      },
    });
    card.setX(listMidX);
    scroll.addCard(card);
  });
  scroll.apply();
}
