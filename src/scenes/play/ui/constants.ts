export const FONT = "'Press Start 2P', 'Courier New', monospace";
export const NAV_H = 104;

export const PANEL_TOP = 96;
export const PANEL_BOTTOM_PAD = 8;
export const PANEL_DIM_COLOR = 0x0d140d;
export const PANEL_DIM_ALPHA = 0.55;
export const PANEL_SCROLL_GUTTER = 16;

export const HUD_PAD = 10;
export const HUD_CHIP_H = 56;

export function safeInsetTop(): number {
  const n = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--safe-top'),
  );
  return Number.isFinite(n) ? n : 0;
}

/** Bottom of the HUD chips. Casts/spawns start here. */
export function hudBottom(): number {
  return safeInsetTop() + HUD_PAD + HUD_CHIP_H;
}

export function panelTop(): number {
  return Math.max(PANEL_TOP, hudBottom() + 8);
}

export const DARK_STROKE = '#1a1208';
export const LIGHT_TEXT = '#ffffff';
export const GOLD_TEXT = '#ffe6a8';
