import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import { formatNumber } from '../../../utils/format';
import { createBadge, showBadge } from '../ui/Badge';
import { DARK_STROKE, FONT } from '../ui/constants';

export class HudView {
  private influenceAmt!: Phaser.GameObjects.Text;
  private influenceRate!: Phaser.GameObjects.Text;
  private levelLabel!: Phaser.GameObjects.Text;
  private xpFill!: Phaser.GameObjects.Rectangle;
  private manaFill!: Phaser.GameObjects.Rectangle;
  private exclaim!: Phaser.GameObjects.Image;
  private buffCount!: Phaser.GameObjects.Text;
  private buffPanel!: Phaser.GameObjects.Container;
  private readonly xpBarMax = 100;
  private readonly manaBarMax = 100;
  private levelReady = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ctx: GameContext,
    private readonly onLevelCloud: () => void,
  ) {}

  build(): void {
    const w = this.scene.scale.width;

    const leftCloud = this.scene.add.image(0, 0, 'ui-cloud').setDisplaySize(114, 70);
    const inflIcon = this.scene.add.image(-36, -5, 'ui-influence').setDisplaySize(24, 24);
    this.influenceAmt = this.scene.add
      .text(-18, -5, '', {
        fontFamily: FONT,
        fontSize: '11px',
        color: '#ffffff',
        stroke: DARK_STROKE,
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);
    this.influenceRate = this.scene.add
      .text(-18, 13, '', {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#b8e0a8',
        stroke: DARK_STROKE,
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
    this.scene.add
      .container(60, 46, [leftCloud, inflIcon, this.influenceAmt, this.influenceRate])
      .setDepth(20);

    const rightCloud = this.scene.add.image(0, 0, 'ui-level-cloud').setDisplaySize(168, 88);
    this.levelLabel = this.scene.add
      .text(0, -27, '', {
        fontFamily: FONT,
        fontSize: '10px',
        color: '#ffffff',
        stroke: DARK_STROKE,
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    const barX = -38;
    const star = this.scene.add.image(-58, -5, 'ui-star').setDisplaySize(16, 16);
    const xpTrack = this.scene.add
      .rectangle(barX, -5, this.xpBarMax, 9, 0x2c3f28)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x14200f);
    this.xpFill = this.scene.add.rectangle(barX, -5, 4, 7, 0x5ecf5a).setOrigin(0, 0.5);
    const manaIcon = this.scene.add.image(-58, 15, 'ui-mana-icon').setDisplaySize(16, 16);
    // mana-bar.png as track only — fill is a rectangle (no horizontal squash of the art).
    const manaTrack = this.scene.add
      .image(barX, 15, 'ui-mana-bar')
      .setOrigin(0, 0.5)
      .setDisplaySize(this.manaBarMax, 9)
      .setTint(0x4a5a72);
    this.manaFill = this.scene.add.rectangle(barX, 15, 4, 7, 0x6ec8ff).setOrigin(0, 0.5);
    this.exclaim = createBadge(this.scene, 58, -22, 18);
    const cloud = this.scene.add
      .container(w - 90, 50, [
        rightCloud,
        this.levelLabel,
        star,
        xpTrack,
        this.xpFill,
        manaIcon,
        manaTrack,
        this.manaFill,
        this.exclaim,
      ])
      .setDepth(20)
      .setSize(168, 88)
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 168, 88),
        Phaser.Geom.Rectangle.Contains,
      );
    cloud.on('pointerup', () => this.onLevelCloud());

    this.buffCount = this.scene.add
      .text(0, 2, '', {
        fontFamily: FONT,
        fontSize: '22px',
        color: DARK_STROKE,
        stroke: '#f4ead8',
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.buffPanel = this.scene.add
      .container(w - 48, 148, [
        this.scene.add.image(0, 0, 'ui-square-cloud').setDisplaySize(80, 80),
        this.buffCount,
      ])
      .setDepth(20)
      .setVisible(false);
  }

  setLevelReady(ready: boolean): void {
    this.levelReady = ready;
  }

  refresh(): void {
    const s = this.ctx.state;
    this.influenceAmt.setText(formatNumber(s.influence)).setFontSize(11);
    for (let px = 11; this.influenceAmt.width > 58 && px > 5; px--) {
      this.influenceAmt.setFontSize(px - 1);
    }
    this.influenceRate.setText(`${formatNumber(this.ctx.economy.passivePerSecond(s))}/sec`).setFontSize(8);
    for (let px = 8; this.influenceRate.width > 58 && px > 5; px--) {
      this.influenceRate.setFontSize(px - 1);
    }
    this.levelLabel.setText(`Lvl ${s.playerLevel}`);
    const xpPct = Math.min(1, s.totalInfluenceEarned / Math.max(1, s.experienceRequired));
    this.xpFill.width = Math.max(2, this.xpBarMax * xpPct);
    const manaPct = s.buffRemaining > 0 ? 1 : Math.min(1, s.mana / Math.max(1, s.manaMax));
    this.manaFill.width = Math.max(2, this.manaBarMax * manaPct);
    showBadge(this.exclaim, this.levelReady);
    if (s.buffRemaining > 0) {
      this.buffPanel.setVisible(true);
      this.buffCount.setText(String(Math.ceil(s.buffRemaining)));
    } else {
      this.buffPanel.setVisible(false);
    }
  }
}
