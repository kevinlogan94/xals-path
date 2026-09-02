import Phaser from 'phaser';
import helpersData from '../data/helpers.json';
import { version } from '../../package.json';
import { getContext } from '../game/GameContext';
import { preloadCreatureMagic } from './play/outlook/creatureMagic';
import { preloadCreatureSplashAssets } from './play/splash/creatureSplash';
import { whiteText, darkText } from './play/ui/textStyles';
import type { HelperDef } from '../types';

const TITLE_W = 320;
const TITLE_RATIO = 57 / 280;
const BAR_H = 18;
const FILL_H = 10;

export class TitleScene extends Phaser.Scene {
  private ready = false;
  private title!: Phaser.GameObjects.Image;
  private loadUi?: Phaser.GameObjects.Container;

  constructor() {
    super('Title');
  }

  preload(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    this.add.image(cx, height / 2, 'ui-title-bg').setDisplaySize(width, height);

    this.title = this.add.image(cx, height * 0.28, 'ui-xal-title');
    this.title.setDisplaySize(TITLE_W, TITLE_W * TITLE_RATIO);

    const barW = Math.min(280, width - 64);
    const y = height * 0.48;
    const track = this.add.rectangle(cx, y, barW, BAR_H, 0x2a2014).setStrokeStyle(2, 0xc4a35a);
    const well = this.add.rectangle(cx, y, barW - 8, FILL_H + 2, 0x0a1008);
    const fill = this.add
      .rectangle(cx - (barW - 10) / 2, y, 2, FILL_H, 0xffe6a8)
      .setOrigin(0, 0.5);
    const label = this.add
      .text(cx, y - 22, 'Opening the way', whiteText('8px', { align: 'center' }))
      .setOrigin(0.5);
    this.loadUi = this.add.container(0, 0, [track, well, fill, label]);

    this.load.on('progress', (p: number) => {
      fill.width = Math.max(2, (barW - 10) * p);
    });

    queueGameAssets(this.load);
  }

  create(): void {
    this.loadUi?.destroy(true);
    this.loadUi = undefined;
    this.showDetails();

    const audio = getContext().audio;
    audio.attach(this);
    audio.playBgm('xals-theme');
    this.input.on('pointerup', () => {
      audio.playBgm('xals-theme');
      if (!this.ready) {
        this.tweens.killTweensOf(this.title);
        this.title.setAlpha(1);
        this.showDetails();
        return;
      }
      this.closeTitle();
    });
  }

  private showDetails(): void {
    if (this.ready) return;
    const { width, height } = this.scale;
    const prompt = this.add
      .text(width / 2, height * 0.48, 'Tap to pass the barrier', {
        ...whiteText('12px', { align: 'center' }),
        wordWrap: { width: width - 48 },
      })
      .setOrigin(0.5);
    this.add.text(width - 12, 16, `v${version}`, darkText('8px')).setOrigin(1, 0);
    this.tweens.add({
      targets: prompt,
      alpha: 0.55,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
    this.ready = true;
  }

  private closeTitle(): void {
    if (!this.ready) return;
    this.ready = false;
    this.scene.start('Play');
  }
}

function queueGameAssets(load: Phaser.Loader.LoaderPlugin): void {
  load.image('bg-meadow', 'assets/backgrounds/meadow.png');
  load.image('bg-river', 'assets/backgrounds/river.png');
  load.image('bg-altar', 'assets/backgrounds/altar.png');

  const exprs: Record<string, string> = {
    generic: 'xal_generic.png',
    genericDown: 'xal_generic_down.png',
    happy: 'xal_happy.png',
    angry: 'xal_mad.png',
    sad: 'xal_sad.png',
    sadSide: 'xal_sad_side.png',
    shocked: 'xal_shocked.png',
    shockedSide: 'xal_shocked_side.png',
    shockedDown: 'xal_shocked_side.png',
  };
  for (const [key, file] of Object.entries(exprs)) {
    load.image(`xal-${key}`, `assets/xal/${file}`);
  }
  load.image('xal-idle-sheet', 'assets/xal/xal_idle_animation.png');
  load.image('xal-book-sheet', 'assets/xal/xal_book_animation.png');
  load.spritesheet('barlog', 'assets/characters/barlog.png', {
    frameWidth: 266,
    frameHeight: 300,
  });

  load.image('ui-nav-default', 'assets/ui/nav-default.png');
  load.image('ui-nav-active', 'assets/ui/nav-active.png');
  load.image('ui-tome-box', 'assets/ui/tome-box.png');
  load.image('ui-tome-locked', 'assets/ui/tome-box-locked.png');
  load.image('ui-lock', 'assets/ui/lock.png');
  preloadCreatureSplashAssets(load);
  preloadCreatureMagic(load);
  load.image('ui-panel', 'assets/ui/panel.png');
  load.image('ui-cloud', 'assets/ui/clouds/cloud.png');
  load.image('ui-level-cloud', 'assets/ui/clouds/LevelCloud.png');
  load.image('ui-square-cloud', 'assets/ui/clouds/squareCloud.png');
  load.image('ui-gear', 'assets/ui/Gear.png');
  load.image('ui-flower', 'assets/ui/OutlookFlower.png');
  load.image('ui-banner', 'assets/ui/PanelBanner.png');
  load.image('ui-splash-banner', 'assets/ui/splash-banner.png');
  load.image('ui-quote-box', 'assets/ui/QuoteBox.png');
  load.image('ui-mana-icon', 'assets/ui/manaIcon.png');
  load.image('ui-mana-bar', 'assets/ui/mana-bar.png');
  load.image('ui-star', 'assets/ui/star.png');
  load.image('ui-speaker-on', 'assets/ui/SpeakerOn.png');
  load.image('ui-speaker-off', 'assets/ui/SpeakerOff.png');
  load.image('ui-btn-green', 'assets/ui/buttons/greenButton.png');
  load.image('ui-btn-blue', 'assets/ui/buttons/blueButton.png');
  load.image('ui-btn-orange', 'assets/ui/buttons/OrangeButton.png');
  load.image('ui-influence', 'assets/ui/influence.png');
  load.image('ui-achiev-box', 'assets/ui/achiev-box.png');
  load.image('ui-achiev-box-pressed', 'assets/ui/achiev-box-pressed.png');
  load.image('ui-item-slot', 'assets/ui/item-slot.png');
  load.image('ui-stone', 'assets/ui/stone.png');
  load.image('ui-scroll', 'assets/ui/scrollBar.png');
  load.image('ui-reward-star', 'assets/ui/reward-star.png');
  load.image('ui-reward-shop', 'assets/ui/reward-shop.png');
  load.image('ui-reward-notepad', 'assets/ui/reward-notepad.png');
  load.image('ui-reward-portal', 'assets/ui/reward-portal.png');
  load.image('ui-reward-trophy', 'assets/ui/reward-trophy.png');
  load.image('ui-trophy-nav', 'assets/ui/trophy.png');
  load.image('ui-portal-nav', 'assets/ui/Portal2.png');
  load.image('ui-tomes-nav', 'assets/ui/Tomes.png');
  load.image('ui-pointer', 'assets/ui/pointer.png');

  for (const h of helpersData.helpers as HelperDef[]) {
    load.image(`tome-${h.id}`, `assets/ui/tomes/${h.id}.png`);
  }

  load.audio('xals-theme', 'assets/audio/xals-theme.mp3');
  load.audio('barlogs-theme', 'assets/audio/barlogs-theme.mp3');
  load.audio('meadow', 'assets/audio/meadow.mp3');
  load.audio('river', 'assets/audio/river.mp3');
  load.audio('altar', 'assets/audio/altar.mp3');
  load.audio('cast', 'assets/audio/cast.wav');
  load.audio('pop', 'assets/audio/pop.wav');
  load.audio('levelup', 'assets/audio/levelup.wav');
  load.audio('buff', 'assets/audio/buff.wav');
  load.audio('debuff', 'assets/audio/debuff.wav');
  load.audio('coin', 'assets/audio/coin.mp3');
}
