import Phaser from 'phaser';
import type { GameContext } from '../../../game/GameContext';
import type { TabId } from '../../../types';
import { createBadge, showBadge } from '../ui/Badge';
import { NAV_H } from '../ui/constants';
import { fitInBox } from '../ui/fit';
import { whiteText } from '../ui/textStyles';

/** Unity BottomNav: Settings · Rewards · Outlook · Map · Tomes */
const NAV: { id: TabId; label: string; icon: string }[] = [
  { id: 'settings', label: 'Settings', icon: 'ui-gear' },
  { id: 'achievements', label: 'Rewards', icon: 'ui-trophy-nav' },
  { id: 'outlook', label: 'Outlook', icon: 'ui-flower' },
  { id: 'scene', label: 'Map', icon: 'ui-portal-nav' },
  { id: 'shop', label: 'Tomes', icon: 'ui-tomes-nav' },
];

export class BottomNav {
  private navButtons: Phaser.GameObjects.Container[] = [];
  private rewardsBadge?: Phaser.GameObjects.Image;

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
      const x = (w / NAV.length) * (i + 0.5);
      const slotW = Math.min(68, w / NAV.length - 4);
      const bg = this.scene.add.image(0, -6, 'ui-nav-default').setDisplaySize(slotW, 44);
      const icon = fitInBox(this.scene, this.scene.textures.exists(item.icon) ? item.icon : 'ui-gear', 26, 26);
      icon.setPosition(0, -10);
      const label = this.scene.add.text(0, 22, item.label, whiteText('6px')).setOrigin(0.5);
      const c = this.scene.add
        .container(x, h - NAV_H / 2, [bg, icon, label])
        .setDepth(41)
        .setSize(slotW, 56)
        .setInteractive(
          new Phaser.Geom.Rectangle(-slotW / 2, -28, slotW, 56),
          Phaser.Geom.Rectangle.Contains,
        );
      c.on('pointerdown', () => this.onSelect(item.id));
      return c;
    });

    const rewardsX = (w / NAV.length) * 1.5;
    this.rewardsBadge = createBadge(this.scene, rewardsX + 22, h - NAV_H / 2 - 28, 16, 42);
  }

  setActive(tab: TabId): void {
    this.navButtons.forEach((btn, i) => {
      const active = NAV[i].id === tab;
      const img = btn.list[0] as Phaser.GameObjects.Image;
      const label = btn.list[2] as Phaser.GameObjects.Text;
      img.setTexture(active ? 'ui-nav-active' : 'ui-nav-default');
      label.setColor(active ? '#ffe6a8' : '#ffffff');
    });
  }

  refreshRewardsBadge(): void {
    showBadge(this.rewardsBadge, this.ctx.economy.anyClaimable(this.ctx.state));
  }
}
