import Phaser from 'phaser';
import type { GameContext } from '../../game/GameContext';
import { formatNumber } from '../../utils/format';
import { FONT, NAV_H } from './constants';
import { addFramedPanel } from './framedPanel';

export function renderShop(opts: {
  scene: Phaser.Scene;
  panel: Phaser.GameObjects.Container;
  ctx: GameContext;
  getShopScroll: () => number;
  setShopScroll: (n: number) => void;
  showToast: (msg: string) => void;
  reload: () => void;
}): void {
  const { scene, panel, ctx, getShopScroll, setShopScroll, showToast, reload } =
    opts;
  const w = scene.scale.width;
  const h = scene.scale.height;
  const { contentTop: listTop, dimmer } = addFramedPanel(scene, panel, 'Tomes');
  const rowH = 72;
  const visibleH = h - NAV_H - listTop - 12;
  const maxScroll = Math.max(
    0,
    ctx.economy.helpers.length * rowH - visibleH,
  );
  setShopScroll(Phaser.Math.Clamp(getShopScroll(), 0, maxScroll));

  const cards: Phaser.GameObjects.Container[] = [];
  const scrollTrack = scene.add
    .rectangle(w - 14, listTop + visibleH / 2, 6, visibleH, 0x1a140c, 0.8)
    .setStrokeStyle(1, 0x5a4030);
  const scrollThumb = scene.add
    .image(w - 14, listTop + 20, 'ui-scroll')
    .setDisplaySize(8, 28);
  panel.add(scrollTrack);
  panel.add(scrollThumb);

  const applyScroll = () => {
    const scroll = getShopScroll();
    cards.forEach((card, i) => {
      const y = listTop + i * rowH - scroll + rowH / 2;
      card.setY(y);
      card.setVisible(y > listTop - 10 && y < h - NAV_H - 4);
    });
    if (maxScroll > 0) {
      const t = scroll / maxScroll;
      const thumbTravel = visibleH - 32;
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
  const onDragStart = (p: Phaser.Input.Pointer) => {
    dragY = p.y;
    dragMoved = 0;
  };
  const onDragMove = (p: Phaser.Input.Pointer) => {
    if (!p.isDown) return;
    const dy = dragY - p.y;
    dragY = p.y;
    dragMoved += Math.abs(dy);
    setShopScroll(Phaser.Math.Clamp(getShopScroll() + dy, 0, maxScroll));
    applyScroll();
  };

  const innerW = w - 36;
  ctx.economy.helpers.forEach((def, i) => {
    const save = ctx.state.helpers.find((hh) => hh.id === def.id)!;
    const locked = ctx.state.playerLevel < def.unlockLevel;
    const y = listTop + i * rowH - getShopScroll() + rowH / 2;

    const boxKey = locked ? 'ui-tome-locked' : 'ui-tome-box';
    const box = scene.add.image(0, 0, boxKey).setDisplaySize(innerW, 66);
    const emblemKey = `tome-${def.id}`;
    const emblem = scene.textures.exists(emblemKey)
      ? scene.add.image(-innerW / 2 + 36, 0, emblemKey).setDisplaySize(36, 36)
      : scene.add.circle(-innerW / 2 + 36, 0, 18, 0x445544);

    const lockImg =
      locked && scene.textures.exists('ui-lock')
        ? scene.add.image(-innerW / 2 + 36, 0, 'ui-lock').setDisplaySize(22, 22)
        : null;

    const title = scene.add.text(-innerW / 2 + 64, -14, def.name, {
      fontFamily: FONT,
      fontSize: '11px',
      color: locked ? '#888' : '#f3ead7',
      stroke: '#1a1208',
      strokeThickness: 2,
    });

    const costIcon = !locked
      ? scene.add.image(-innerW / 2 + 72, 12, 'ui-influence').setDisplaySize(12, 12)
      : null;
    const meta = scene.add.text(
      -innerW / 2 + (locked ? 64 : 82),
      6,
      locked
        ? `Lvl ${def.unlockLevel}`
        : `${formatNumber(save.dynamicCost)}  ×${save.amountOwned}  +${formatNumber(save.dynamicIncrement)}/s`,
      {
        fontFamily: FONT,
        fontSize: '9px',
        color: locked ? '#666' : '#c8b89a',
        stroke: '#1a1208',
        strokeThickness: 2,
      },
    );

    const parts: Phaser.GameObjects.GameObject[] = [box, emblem, title, meta];
    if (lockImg) parts.push(lockImg);
    if (costIcon) parts.push(costIcon);
    const card = scene.add.container(w / 2, y, parts).setSize(innerW, 66);
    card.setInteractive(
      new Phaser.Geom.Rectangle(-innerW / 2, -33, innerW, 66),
      Phaser.Geom.Rectangle.Contains,
    );
    card.on('pointerdown', onDragStart);
    card.on('pointermove', onDragMove);
    if (!locked) {
      card.on('pointerup', () => {
        if (dragMoved > 10) return;
        if (ctx.economy.buyHelper(ctx.state, def.id)) {
          ctx.audio.playSfx('coin');
          const owned = ctx.state.helpers.find((hh) => hh.id === def.id)!;
          if (owned.amountOwned === 1) {
            showToast(`${def.name} tome — ${def.creatureId} unbound`);
          }
          reload();
        } else {
          showToast('Not enough influence');
        }
      });
    }
    cards.push(card);
    panel.add(card);
  });
  applyScroll();

  dimmer.on('wheel', (_p: Phaser.Input.Pointer, _dx: number, dy: number) => {
    setShopScroll(
      Phaser.Math.Clamp(getShopScroll() + dy * 0.4, 0, maxScroll),
    );
    applyScroll();
  });
  dimmer.on('pointerdown', onDragStart);
  dimmer.on('pointermove', onDragMove);
}
