import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { PlayScene } from './scenes/PlayScene';

const parent = document.getElementById('game');

new Phaser.Game({
  type: Phaser.AUTO,
  parent: parent ?? undefined,
  backgroundColor: '#0d1a0d',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, PlayScene],
  audio: {
    disableWebAudio: false,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
});
