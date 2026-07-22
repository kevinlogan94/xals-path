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
  private readonly xpBarMax = 70;
  private readonly manaBarMax = 70;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ctx: GameContext,
  ) {}

  build(): void {
    const w = this.scene.scale.width;

    const leftCloud = this.scene.add.image(0, 0, 'ui-cloud').setDisplaySize(150, 78);
    const inflIcon = this.scene.add.image(-48, -8, 'ui-influence').setDisplaySize(22, 22);
    this.influenceAmt = this.scene.add
      .text(-30, -14, '', {
        fontFamily: FONT,
        fontSize: '9px',
        color: '#ffffff',
        stroke: DARK_STROKE,
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5);
    this.influenceRate = this.scene.add
      .text(-30, 16, '', {
        fontFamily: FONT,
        fontSize: '7px',
        color: '#b8e0a8',
        stroke: DARK_STROKE,
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
    this.scene.add
      .container(78, 48, [leftCloud, inflIcon, this.influenceAmt, this.influenceRate])
      .setDepth(20);

    const rightCloud = this.scene.add.image(0, 0, 'ui-level-cloud').setDisplaySize(168, 88);
    this.levelLabel = this.scene.add
      .text(0, -28, '', {
        fontFamily: FONT,
        fontSize: '8px',
        color: '#ffffff',
        stroke: DARK_STROKE,
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    const star = this.scene.add.image(-62, -6, 'ui-star').setDisplaySize(14, 14);
    const xpTrack = this.scene.add.rectangle(-8, -6, this.xpBarMax, 8, 0x1a2a18).setOrigin(0, 0.5);
    this.xpFill = this.scene.add.rectangle(-8, -6, 4, 8, 0x5ecf5a).setOrigin(0, 0.5);
    const manaIcon = this.scene.add.image(-62, 14, 'ui-mana-icon').setDisplaySize(14, 14);
    const manaTrack = this.scene.add.rectangle(-8, 14, this.manaBarMax, 8, 0x1a2030).setOrigin(0, 0.5);
    this.manaFill = this.scene.add.rectangle(-8, 14, 4, 8, 0x5aa0ff).setOrigin(0, 0.5);
    this.exclaim = createBadge(this.scene, 70, -28, 18);
    this.scene.add
      .container(w - 90, 52, [
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
      .setDepth(20);
  }

  refresh(): void {
    const s = this.ctx.state;
    this.influenceAmt.setText(formatNumber(s.influence));
    this.influenceRate.setText(`${formatNumber(this.ctx.economy.passivePerSecond(s))}/sec`);
    this.levelLabel.setText(`Lvl ${s.playerLevel}`);
    const xpPct = Math.min(1, s.totalInfluenceEarned / Math.max(1, s.experienceRequired));
    this.xpFill.width = Math.max(2, this.xpBarMax * xpPct);
    const manaPct = s.buffRemaining > 0 ? 1 : Math.min(1, s.mana / Math.max(1, s.manaMax));
    this.manaFill.width = Math.max(2, this.manaBarMax * manaPct);
    showBadge(this.exclaim, s.buffRemaining > 0 || s.mana >= s.manaMax);
  }
}
