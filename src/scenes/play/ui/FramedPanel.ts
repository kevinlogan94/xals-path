import Phaser from 'phaser';
import {
  NAV_H,
  PANEL_BOTTOM_PAD,
  PANEL_DIM_ALPHA,
  PANEL_DIM_COLOR,
  PANEL_SCROLL_GUTTER,
  PANEL_TOP,
} from './constants';
import { whiteText } from './textStyles';

export interface FramedPanelGeometry {
  dim: Phaser.GameObjects.Rectangle;
  listTop: number;
  listBottom: number;
  listLeft: number;
  listWidth: number;
  scrollX: number;
}

/**
 * Framed modal: dim overlay + panel + banner.
 * The returned dim is the scroll/input surface for modal backgrounds.
 */
export function addFramedPanel(
  scene: Phaser.Scene,
  panel: Phaser.GameObjects.Container,
  title: string,
): FramedPanelGeometry {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const panelW = w - 28;
  const panelH = h - NAV_H - PANEL_TOP - PANEL_BOTTOM_PAD;
  const panelLeft = (w - panelW) / 2;
  const cy = PANEL_TOP + panelH / 2;

  // Keep rows clearly inside the parchment, with equal left/right inset.
  const inset = Math.max(14, Math.round(panelW * 0.045));
  const bannerW = panelW * 0.72;
  const bannerH = Math.round(bannerW / 4.5);
  const bannerY = PANEL_TOP + inset + bannerH / 2;

  const dim = scene.add
    .rectangle(w / 2, (h - NAV_H) / 2, w, h - NAV_H, PANEL_DIM_COLOR, PANEL_DIM_ALPHA)
    .setInteractive();
  panel.add(dim);
  panel.add(scene.add.image(w / 2, cy, 'ui-panel').setDisplaySize(panelW, panelH));
  panel.add(scene.add.image(w / 2, bannerY, 'ui-banner').setDisplaySize(bannerW, bannerH));
  panel.add(scene.add.text(w / 2, bannerY, title, whiteText('13px', { strokeThickness: 4 })).setOrigin(0.5));

  const listTop = bannerY + bannerH / 2 + 12;
  const listBottom = PANEL_TOP + panelH - inset;
  const listLeft = panelLeft + inset;
  const listWidth = panelW - inset * 2 - PANEL_SCROLL_GUTTER;
  const scrollX = listLeft + listWidth + PANEL_SCROLL_GUTTER / 2;

  return { dim, listTop, listBottom, listLeft, listWidth, scrollX };
}
