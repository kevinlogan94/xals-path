import Phaser from 'phaser';

interface ScrollListConfig {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  dim: Phaser.GameObjects.Rectangle;
  listTop: number;
  listBottom: number;
  listLeft: number;
  listWidth: number;
  scrollX: number;
  rowHeight: number;
  itemHeight?: number;
  rowCount: number;
  scroll: number;
  onScroll: (scroll: number) => void;
}

export interface ScrollList {
  mask: Phaser.Display.Masks.GeometryMask;
  addCard: (card: Phaser.GameObjects.Container) => void;
  pointerDown: (pointer: Phaser.Input.Pointer) => void;
  pointerMove: (pointer: Phaser.Input.Pointer) => void;
  wasDrag: () => boolean;
  apply: () => void;
}

export function createScrollList(config: ScrollListConfig): ScrollList {
  const {
    scene,
    panel,
    dim,
    listTop,
    listBottom,
    listLeft,
    listWidth,
    scrollX,
    rowHeight,
    rowCount,
    onScroll,
  } = config;
  const itemHeight = config.itemHeight ?? rowHeight;
  const visibleH = listBottom - listTop;
  const maxScroll = Math.max(0, rowCount * rowHeight - visibleH);
  let scroll = Phaser.Math.Clamp(config.scroll, 0, maxScroll);
  onScroll(scroll);

  const listMidX = listLeft + listWidth / 2;
  const listMidY = listTop + visibleH / 2;
  const listMask = scene.add
    .rectangle(listMidX, listMidY, listWidth + 4, visibleH, 0xffffff)
    .setVisible(false);
  panel.add(listMask);
  const mask = listMask.createGeometryMask();

  const cards: Phaser.GameObjects.Container[] = [];
  const scrollTrack = scene.add
    .rectangle(scrollX, listMidY, 5, visibleH, 0x1a140c, 0.85)
    .setStrokeStyle(1, 0x5a4030);
  // scrollBar.png is 200×8 horizontal — rotate 90° for a vertical thumb (no squash).
  const scrollThumb = scene.add
    .image(scrollX, listTop + 20, 'ui-scroll')
    .setDisplaySize(26, 7)
    .setAngle(90);
  panel.add(scrollTrack);
  panel.add(scrollThumb);

  const setScroll = (value: number) => {
    scroll = Phaser.Math.Clamp(value, 0, maxScroll);
    onScroll(scroll);
  };

  const apply = () => {
    cards.forEach((card, i) => {
      const y = listTop + i * rowHeight - scroll + rowHeight / 2;
      card.setY(y);
      card.setVisible(y > listTop - itemHeight / 2 && y < listBottom + itemHeight / 2);
    });
    if (maxScroll > 0) {
      const t = scroll / maxScroll;
      const thumbTravel = Math.max(0, visibleH - 32);
      scrollThumb.setY(listTop + 16 + t * thumbTravel);
      scrollThumb.setVisible(true);
      scrollTrack.setVisible(true);
    } else {
      scrollThumb.setVisible(false);
      scrollTrack.setVisible(false);
    }
  };

  let dragY = 0;
  let dragMoved = 0;
  const pointerDown = (pointer: Phaser.Input.Pointer) => {
    dragY = pointer.y;
    dragMoved = 0;
  };
  const pointerMove = (pointer: Phaser.Input.Pointer) => {
    if (!pointer.isDown) return;
    const dy = dragY - pointer.y;
    dragY = pointer.y;
    dragMoved += Math.abs(dy);
    setScroll(scroll + dy);
    apply();
  };

  dim.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, dy: number) => {
    setScroll(scroll + dy * 0.4);
    apply();
  });
  dim.on('pointerdown', pointerDown);
  dim.on('pointermove', pointerMove);

  return {
    mask,
    addCard: (card) => {
      cards.push(card);
      card.setMask(mask);
      panel.add(card);
    },
    pointerDown,
    pointerMove,
    wasDrag: () => dragMoved > 10,
    apply,
  };
}
