import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { formatNumber } from '../../../utils/format';
import { createBadge, showBadge } from '../ui/Badge';
import { GOLD_TEXT, HUD_CHIP_H, HUD_PAD, PANEL_DIM_COLOR, safeInsetTop } from '../ui/constants';
import { whiteText } from '../ui/textStyles';

/** Resize the ear chips here. Height/notch padding live in constants.ts (`HUD_CHIP_H`, `HUD_PAD`). */
const LEFT_W = 108;
const RIGHT_W = 116;
const INSET = 6;
const ICON = 16;
const BAR_W = RIGHT_W - INSET * 2 - ICON - 4;
const AMT_MAX = LEFT_W - INSET * 2 - ICON - 4;

function pill(scene: Phaser.Scene, w: number, h: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(PANEL_DIM_COLOR, 0.78);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
  g.lineStyle(1, 0x0a0804, 0.55);
  g.strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 8);
  return g;
}

function fit(text: Phaser.GameObjects.Text, max: number, size: number): void {
  text.setFontSize(size);
  while (text.width > max && size > 5) text.setFontSize(--size);
}

export class HudView {
  private influenceAmt!: Phaser.GameObjects.Text;
  private influenceRate!: Phaser.GameObjects.Text;
  private levelLabel!: Phaser.GameObjects.Text;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private manaTrack!: Phaser.GameObjects.Rectangle;
  private manaFill!: Phaser.GameObjects.Rectangle;
  private exclaim!: Phaser.GameObjects.Text;
  private buffCount!: Phaser.GameObjects.Text;
  private levelReady = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ctx: GameContext,
    private readonly onLevelTap: () => void,
  ) {}

  build(): void {
    const w = this.scene.scale.width;
    const y = Math.round(safeInsetTop() + HUD_PAD + HUD_CHIP_H / 2);
    const textX = -LEFT_W / 2 + INSET + ICON + 6;
    const colX = -RIGHT_W / 2 + INSET;
    const barX = colX + ICON + 5;

    this.influenceAmt = this.scene.add.text(textX, -7, '', whiteText('10px', { strokeThickness: 4 })).setOrigin(0, 0.5);
    this.influenceRate = this.scene.add
      .text(textX, 9, '', whiteText('8px', { color: '#b8e0a8' }))
      .setOrigin(0, 0.5);
    this.scene.add
      .container(HUD_PAD + LEFT_W / 2, y, [
        pill(this.scene, LEFT_W, HUD_CHIP_H),
        this.scene.add.image(-LEFT_W / 2 + INSET + ICON / 2, -6, 'ui-influence').setDisplaySize(ICON, ICON),
        this.influenceAmt,
        this.influenceRate,
      ])
      .setDepth(20);

    this.levelLabel = this.scene.add.text(colX, -18, '', whiteText('9px', { strokeThickness: 4 })).setOrigin(0, 0.5);
    this.manaTrack = this.scene.add.rectangle(barX, 15, BAR_W, 8, 0x1a2218).setOrigin(0, 0.5).setStrokeStyle(1, 0x0a1008);
    this.xpFill = this.scene.add.rectangle(barX + 1, 1, 2, 6, 0x5ecf5a).setOrigin(0, 0.5);
    this.manaFill = this.scene.add.rectangle(barX + 1, 15, 2, 6, 0x6ec8ff).setOrigin(0, 0.5);
    this.buffCount = this.scene.add.text(barX, 15, '', whiteText('9px', { color: GOLD_TEXT })).setOrigin(0, 0.5).setVisible(false);
    this.exclaim = createBadge(this.scene, colX, -18, 10);
    this.scene.add
      .container(w - HUD_PAD - RIGHT_W / 2, y, [
        pill(this.scene, RIGHT_W, HUD_CHIP_H),
        this.levelLabel,
        this.scene.add.image(colX + ICON / 2, 1, 'ui-star').setDisplaySize(ICON, ICON),
        this.scene.add.rectangle(barX, 1, BAR_W, 8, 0x1a2218).setOrigin(0, 0.5).setStrokeStyle(1, 0x0a1008),
        this.xpFill,
        this.scene.add.image(colX + ICON / 2, 15, 'ui-mana-icon').setDisplaySize(ICON, ICON),
        this.manaTrack,
        this.manaFill,
        this.buffCount,
        this.exclaim,
      ])
      .setDepth(20)
      .setSize(RIGHT_W, HUD_CHIP_H)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, RIGHT_W, HUD_CHIP_H), Phaser.Geom.Rectangle.Contains)
      .on('pointerup', () => this.onLevelTap());
  }

  setLevelReady(ready: boolean): void {
    this.levelReady = ready;
  }

  refresh(): void {
    const s = this.ctx.state;
    this.influenceAmt.setText(formatNumber(s.influence));
    fit(this.influenceAmt, AMT_MAX, 10);
    this.influenceRate.setText(`${formatNumber(this.ctx.economy.passivePerSecond(s))}/sec`);
    fit(this.influenceRate, AMT_MAX, 8);
    this.levelLabel.setText(`Lvl ${s.playerLevel}`);
    this.exclaim.setX(this.levelLabel.x + this.levelLabel.width + 8);
    this.xpFill.width = Math.max(2, (BAR_W - 2) * Math.min(1, s.totalInfluenceEarned / Math.max(1, s.experienceRequired)));
    const buffOn = s.buffRemaining > 0;
    this.manaTrack.setVisible(!buffOn);
    this.manaFill.setVisible(!buffOn);
    this.buffCount.setVisible(buffOn);
    if (buffOn) this.buffCount.setText(`${Math.ceil(s.buffRemaining)}s`);
    else this.manaFill.width = Math.max(2, (BAR_W - 2) * Math.min(1, s.mana / Math.max(1, s.manaMax)));
    showBadge(this.exclaim, this.levelReady);
  }
}
