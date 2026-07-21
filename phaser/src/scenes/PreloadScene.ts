import Phaser from 'phaser';
import creaturesData from '../data/creatures.json';
import helpersData from '../data/helpers.json';
import type { CreatureDef, HelperDef } from '../types';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload(): void {
    const { width, height } = this.scale;
    const barBg = this.add
      .rectangle(width / 2, height / 2, 280, 18, 0x1a2e1a)
      .setStrokeStyle(1, 0x3a4a30);
    const bar = this.add
      .rectangle(width / 2 - 138, height / 2, 4, 14, 0xc4a35a)
      .setOrigin(0, 0.5);
    this.add
      .text(width / 2, height / 2 - 40, "Xal's Path", {
        fontFamily: 'Georgia, serif',
        fontSize: '36px',
        color: '#e8dcc8',
      })
      .setOrigin(0.5);

    this.load.on('progress', (p: number) => {
      bar.width = Math.max(4, 276 * p);
    });

    this.load.image('bg-meadow', 'assets/backgrounds/meadow.png');
    this.load.image('bg-river', 'assets/backgrounds/river.png');
    this.load.image('bg-altar', 'assets/backgrounds/altar.png');

    const exprs: Record<string, string> = {
      generic: 'xal_generic.png',
      genericDown: 'xal_generic_down.png',
      happy: 'xal_happy.png',
      angry: 'xal_mad.png',
      sad: 'xal_sad.png',
      sadSide: 'xal_sad_side.png',
      shocked: 'xal_shocked.png',
    };
    for (const [key, file] of Object.entries(exprs)) {
      this.load.image(`xal-${key}`, `assets/xal/${file}`);
    }
    this.load.image('barlog', 'assets/characters/barlog.png');

    for (const c of creaturesData.creatures as CreatureDef[]) {
      this.load.image(`creature-${c.id}`, `assets/creatures/${c.id}.png`);
    }

    // UI chrome from Unity remaster
    this.load.image('ui-nav-default', 'assets/ui/nav-default.png');
    this.load.image('ui-nav-active', 'assets/ui/nav-active.png');
    this.load.image('ui-tome-box', 'assets/ui/tome-box.png');
    this.load.image('ui-tome-locked', 'assets/ui/tome-box-locked.png');
    this.load.image('ui-lock', 'assets/ui/lock.png');
    this.load.image('ui-panel', 'assets/ui/panel.png');
    this.load.image('ui-cloud', 'assets/ui/clouds/cloud.png');
    this.load.image('ui-level-cloud', 'assets/ui/clouds/LevelCloud.png');
    this.load.image('ui-square-cloud', 'assets/ui/clouds/squareCloud.png');
    this.load.image('ui-gear', 'assets/ui/Gear.png');
    this.load.image('ui-trophy', 'assets/ui/trophy.png');
    this.load.image('ui-flower', 'assets/ui/OutlookFlower.png');
    this.load.image('ui-portal', 'assets/ui/Portal2.png');
    this.load.image('ui-tomes-icon', 'assets/ui/Tomes.png');
    this.load.image('ui-banner', 'assets/ui/PanelBanner.png');
    this.load.image('ui-quote-box', 'assets/ui/QuoteBox.png');
    this.load.image('ui-mana-icon', 'assets/ui/manaIcon.png');
    this.load.image('ui-star', 'assets/ui/star.png');
    this.load.image('ui-speaker-on', 'assets/ui/SpeakerOn.png');
    this.load.image('ui-speaker-off', 'assets/ui/SpeakerOff.png');
    this.load.image('ui-btn-green', 'assets/ui/buttons/greenButton.png');
    this.load.image('ui-btn-blue', 'assets/ui/buttons/blueButton.png');
    this.load.image('ui-btn-orange', 'assets/ui/buttons/OrangeButton.png');
    this.load.image('ui-scene-bg', 'assets/ui/Scene.png');
    this.load.image('ui-influence', 'assets/ui/influence.png');
    this.load.image('ui-mana-bar', 'assets/ui/mana-bar.png');
    this.load.image('ui-exclaim', 'assets/ui/exclaim.png');
    this.load.image('ui-achiev-box', 'assets/ui/achiev-box.png');
    this.load.image('ui-achiev-box-pressed', 'assets/ui/achiev-box-pressed.png');
    this.load.image('ui-stone', 'assets/ui/stone.png');
    this.load.image('ui-scroll', 'assets/ui/scrollBar.png');
    this.load.image('ui-reward-star', 'assets/ui/reward-star.png');
    this.load.image('ui-reward-shop', 'assets/ui/reward-shop.png');
    this.load.image('ui-reward-notepad', 'assets/ui/reward-notepad.png');
    this.load.image('ui-reward-portal', 'assets/ui/reward-portal.png');
    // Prefer cropped nav icons when present
    this.load.image('ui-trophy-nav', 'assets/ui/trophy-nav.png');
    this.load.image('ui-portal-nav', 'assets/ui/portal-nav.png');
    this.load.image('ui-tomes-nav', 'assets/ui/tomes-nav.png');

    for (const h of helpersData.helpers as HelperDef[]) {
      this.load.image(`tome-${h.id}`, `assets/ui/tomes/${h.id}.png`);
    }

    this.load.audio('xals-theme', 'assets/audio/xals-theme.mp3');
    this.load.audio('barlogs-theme', 'assets/audio/barlogs-theme.mp3');
    this.load.audio('meadow', 'assets/audio/meadow.mp3');
    this.load.audio('river', 'assets/audio/river.mp3');
    this.load.audio('altar', 'assets/audio/altar.mp3');
    this.load.audio('cast', 'assets/audio/cast.wav');
    this.load.audio('pop', 'assets/audio/pop.wav');
    this.load.audio('levelup', 'assets/audio/levelup.wav');
    this.load.audio('buff', 'assets/audio/buff.wav');
    this.load.audio('debuff', 'assets/audio/debuff.wav');
    this.load.audio('coin', 'assets/audio/coin.mp3');

    void barBg;
  }

  create(): void {
    this.scene.start('Play');
  }
}
