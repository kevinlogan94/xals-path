import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { PlayScene } from './scenes/PlayScene';

const DESIGN_W = 390;
const DESIGN_H = 844;
const parent = document.getElementById('game');

function availableHeight(): number {
  const parentH = parent?.clientHeight ?? window.innerHeight;
  return Math.max(1, Math.min(DESIGN_H, Math.round(parentH)));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: parent ?? undefined,
  backgroundColor: '#0d1a0d',
  scale: {
    mode: Phaser.Scale.FIT,
    width: DESIGN_W,
    height: availableHeight(),
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, TitleScene, PlayScene],
  audio: {
    disableWebAudio: false,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
});

function fitToView(): void {
  const height = availableHeight();
  if (height !== game.scale.gameSize.height) {
    game.scale.resize(DESIGN_W, height);
  }
}

window.addEventListener('resize', fitToView);
window.addEventListener('orientationchange', fitToView);
