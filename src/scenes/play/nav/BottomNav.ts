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
  private tabAllowed: (tab: TabId) => boolean = () => true;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ctx: GameContext,
    private readonly onSelect: (tab: TabId) => void,
  ) {}

  build(): void {
    const h = this.scene.scale.height;
    const w = this.scene.scale.width;
    this.scene.add.image(w / 2, h - NAV_H / 2, 'ui-stone').setDisplaySize(w, NAV_H).setDepth(40);

    const columnW = w / NAV.length;
    const inset = 10;
    const frame = Math.min(columnW - 8, NAV_H - inset * 2);
    const iconBox = frame - 16;
    this.navButtons = NAV.map((item, i) => {
      const x = columnW * (i + 0.5);
      const bg = this.scene.add.image(0, 0, 'ui-nav-default').setDisplaySize(frame, frame);
      const icon = fitInBox(
        this.scene,
        this.scene.textures.exists(item.icon) ? item.icon : 'ui-gear',
        iconBox,
        iconBox,
      );
      const c = this.scene.add
        .container(x, h - NAV_H / 2, [bg, icon])
        .setDepth(41)
        .setSize(columnW, NAV_H)
        .setInteractive(
          // Container input adds displayOrigin (width/2, height/2) before hit tests.
          new Phaser.Geom.Rectangle(0, 0, columnW, NAV_H),
          Phaser.Geom.Rectangle.Contains,
        );
      c.on('pointerdown', () => {
        if (!this.tabAllowed(item.id)) return;
        this.onSelect(item.id);
      });
      return c;
    });

    const badge = frame / 2 - 2;
    this.rewardsBadge = createBadge(this.scene, columnW * 1.5 + badge, h - NAV_H / 2 - badge, 16, 42);
    this.tomesBadge = createBadge(this.scene, columnW * 4.5 + badge, h - NAV_H / 2 - badge, 16, 42);
  }

  setTabAllowed(fn: (tab: TabId) => boolean): void {
    this.tabAllowed = fn;
    this.applyTabVisibility();
  }

  /** Nav button centers for finger pointers (outlook = index 2, tomes = index 4). */
  navButtonCenter(tab: TabId): { x: number; y: number } | null {
    const idx = NAV.findIndex((n) => n.id === tab);
    if (idx < 0) return null;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const columnW = w / NAV.length;
    return { x: columnW * (idx + 0.5), y: h - NAV_H / 2 };
  }

  private applyTabVisibility(): void {
    this.navButtons.forEach((btn, i) => {
      const allowed = this.tabAllowed(NAV[i].id);
      btn.setAlpha(allowed ? 1 : 0.25);
      if (allowed) btn.setInteractive();
      else btn.disableInteractive();
    });
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
