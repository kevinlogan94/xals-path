import type Phaser from 'phaser';
import { DARK_STROKE, FONT, LIGHT_TEXT } from './constants';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** Extra pixels between wrapped lines. 0.5× font size matches the creature splash. */
function base(fontSize: string, extra: TextStyle): TextStyle {
  return {
    fontFamily: FONT,
    fontSize,
    lineSpacing: Math.round(Number.parseInt(fontSize, 10) * 0.5),
    ...extra,
  };
}

export function whiteText(fontSize: string, extra: TextStyle = {}): TextStyle {
  return base(fontSize, {
    color: LIGHT_TEXT,
    stroke: DARK_STROKE,
    strokeThickness: 3,
    ...extra,
  });
}

export function darkText(
  fontSize: string,
  color = DARK_STROKE,
  extra: TextStyle = {},
): TextStyle {
  return base(fontSize, { color, ...extra });
}
