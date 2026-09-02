import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.image('ui-title-bg', 'assets/ui/titleScreenBigGradient.png');
    this.load.image('ui-xal-title', 'assets/ui/XalTitle.png');
  }

  create(): void {
    this.scene.start('Title');
  }
}
