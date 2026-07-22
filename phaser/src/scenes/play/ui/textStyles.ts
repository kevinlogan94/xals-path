import type Phaser from 'phaser';
import { DARK_STROKE, FONT, LIGHT_TEXT } from './constants';

export function whiteText(
  fontSize: string,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT,
    fontSize,
    color: LIGHT_TEXT,
    stroke: DARK_STROKE,
    strokeThickness: 3,
    ...extra,
  };
}

export function darkText(
  fontSize: string,
  color = DARK_STROKE,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT,
    fontSize,
    color,
    ...extra,
  };
}
