import Phaser from 'phaser';
import chaptersData from '../../../data/chapters.json';
import newsData from '../../../data/news.json';
import type { ChapterDef, GameSave } from '../../../types';
import { whiteText } from '../ui/textStyles';

const HIDE_MS = 15000;
const NEWS = newsData as { id: string; message: string }[];
const CH2_LEVEL =
  (chaptersData.chapters as ChapterDef[]).find((c) => c.id === 2)?.levelRequirement ?? 5;

function matches(state: GameSave, id: string): boolean {
  const a = state.achievements;
  switch (id) {
    case 'Tomes':
      return state.helpers.find((h) => h.id === 'lightning')?.amountOwned === 3;
    case 'Outlook':
      return true;
    case 'Spells':
      return state.influence >= 50;
    case 'Xal':
      return state.playerLevel >= CH2_LEVEL;
    case 'ClickerAchievement':
      return a.clickerCount >= a.clickerGoal;
    case 'LoginAchievement':
      return a.loginCount >= a.loginGoal;
    case 'TomeAchievement':
      return a.helperCount >= a.helperGoal;
    default:
      return false;
  }
}

export class NewsBanner {
  private root!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private hideAt = 0;

  constructor(private readonly scene: Phaser.Scene) {}

  build(): void {
    const w = this.scene.scale.width;
    this.bg = this.scene.add.graphics();
    this.label = this.scene.add
      .text(0, 0, '', whiteText('11px', { align: 'center', wordWrap: { width: w - 56 } }))
      .setOrigin(0.5);
    this.root = this.scene.add.container(w / 2, 196, [this.bg, this.label]).setDepth(22).setVisible(false);
  }

  tick(state: GameSave, onOutlook: boolean, now: number): void {
    if (!onOutlook) {
      this.hide();
      return;
    }
    if (this.root.visible) {
      if (now >= this.hideAt) this.hide();
      return;
    }
    const item = NEWS.find((n) => !state.newsShown.includes(n.id) && matches(state, n.id));
    if (!item) return;
    state.newsShown.push(item.id);
    this.show(item.message, now);
  }

  hide(): void {
    this.root.setVisible(false);
  }

  private show(message: string, now: number): void {
    this.label.setText(message);
    const w = Math.min(this.scene.scale.width - 32, this.label.width + 28);
    const h = this.label.height + 20;
    this.bg.clear();
    this.bg.fillStyle(0x2c2114, 0.94);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.bg.lineStyle(2, 0xc4b08a, 0.85);
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.hideAt = now + HIDE_MS;
    this.root.setVisible(true);
  }
}
