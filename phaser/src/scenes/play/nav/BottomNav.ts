import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import type { TabId } from '../../../types';
import { createBadge, showBadge } from '../ui/Badge';
import { NAV_H } from '../ui/constants';
import { fitInBox } from '../ui/fit';

/** Unity BottomNav: Settings · Rewards · Outlook · Map · Tomes */
const NAV: { id: TabId; icon: string }[] = [
  { id: 'settings', icon: 'ui-gear' },
  { id: 'achievements', icon: 'ui-trophy-nav' },
  { id: 'outlook', icon: 'ui-flower' },
  { id: 'scene', icon: 'ui-portal-nav' },
  { id: 'shop', icon: 'ui-tomes-nav' },
];

export class BottomNav {
  private navButtons: Phaser.GameObjects.Container[] = [];
  private rewardsBadge?: Phaser.GameObjects.Image;
  private tomesBadge?: Phaser.GameObjects.Image;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ctx: GameContext,
    private readonly onSelect: (tab: TabId) => void,
  ) {}

  build(): void {
    const h = this.scene.scale.height;
    const w = this.scene.scale.width;
    this.scene.add.image(w / 2, h - NAV_H / 2, 'ui-stone').setDisplaySize(w, NAV_H).setDepth(40);

    this.navButtons = NAV.map((item, i) => {
      const columnW = w / NAV.length;
      const x = columnW * (i + 0.5);
      const frame = Math.min(columnW - 4, 48);
      const bgY = -6;
      const bg = this.scene.add.image(0, bgY, 'ui-nav-default').setDisplaySize(frame, frame);
      const icon = fitInBox(
        this.scene,
        this.scene.textures.exists(item.icon) ? item.icon : 'ui-gear',
        frame * 0.9,
        frame * 1.27,
      );
      icon.setPosition(1, -8);
      const pad = 4;
      const hitTop = bgY - frame / 2 - pad;
      const hitBottom = icon.y + icon.displayHeight / 2 + pad;
      const hitH = hitBottom - hitTop;
      const c = this.scene.add
        .container(x, h - NAV_H / 2, [bg, icon])
        .setDepth(41)
        .setSize(columnW, hitH)
        .setInteractive(
          // Container input adds displayOrigin (width/2, height/2) before hit tests.
          new Phaser.Geom.Rectangle(0, hitTop + hitH / 2, columnW, hitH),
          Phaser.Geom.Rectangle.Contains,
        );
      c.on('pointerdown', () => this.onSelect(item.id));
      return c;
    });

    const rewardsX = (w / NAV.length) * 1.5;
    const tomesX = (w / NAV.length) * 4.5;
    this.rewardsBadge = createBadge(this.scene, rewardsX + 22, h - NAV_H / 2 - 28, 16, 42);
    this.tomesBadge = createBadge(this.scene, tomesX + 22, h - NAV_H / 2 - 28, 16, 42);
  }

  setActive(tab: TabId): void {
    this.navButtons.forEach((btn, i) => {
      const img = btn.list[0] as Phaser.GameObjects.Image;
      img.setTexture(NAV[i].id === tab ? 'ui-nav-active' : 'ui-nav-default');
    });
  }

  refreshBadges(reading: boolean): void {
    showBadge(this.rewardsBadge, this.ctx.economy.anyClaimable(this.ctx.state));
    showBadge(this.tomesBadge, this.ctx.economy.anyAffordableHelper(this.ctx.state, reading));
  }
}
