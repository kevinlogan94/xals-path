import type Phaser from 'phaser';
import { DARK_STROKE, FONT, LIGHT_TEXT } from './constants';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

/** Nunito already has leading. A small extra gap keeps wrapped lines from colliding. */
function base(fontSize: string, extra: TextStyle): TextStyle {
  return {
    fontFamily: FONT,
    fontStyle: 'bold',
    fontSize,
    lineSpacing: Math.round(Number.parseInt(fontSize, 10) * 0.15),
    ...extra,
  };
}

export function whiteText(fontSize: string, extra: TextStyle = {}): TextStyle {
  return base(fontSize, {
    color: LIGHT_TEXT,
    stroke: DARK_STROKE,
    strokeThickness: 1,
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
