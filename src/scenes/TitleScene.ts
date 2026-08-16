import Phaser from 'phaser';
import { version } from '../../package.json';
import { darkText, whiteText } from './play/ui/textStyles';

export class TitleScene extends Phaser.Scene {
  private ready = false;

  constructor() {
    super('Title');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'ui-title-bg').setDisplaySize(width, height);

    const titleW = 320;
    const title = this.add.image(width / 2, height * 0.28, 'ui-xal-title').setAlpha(0);
    title.setDisplaySize(titleW, titleW * (57 / 280));

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 3500,
      onComplete: () => this.showDetails(),
    });

    this.playTitleTheme();
    this.input.on('pointerup', () => {
      this.playTitleTheme();
      this.closeTitle();
    });
  }

  /** Unity AudioManager.Start — Xals Theme while the title is up. */
  private playTitleTheme(): void {
    this.sound.unlock();
    const ctx = (this.sound as Phaser.Sound.WebAudioSoundManager).context;
    if (ctx?.state === 'suspended') void ctx.resume();
    if (this.sound.get('xals-theme')?.isPlaying) return;
    this.sound.play('xals-theme', { loop: true, volume: 0.45 });
  }

  private showDetails(): void {
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
