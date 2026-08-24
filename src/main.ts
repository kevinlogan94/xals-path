import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { PlayScene } from './scenes/PlayScene';

const textFactory = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  this: Phaser.GameObjects.GameObjectFactory,
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
) {
  return textFactory.call(this, x, y, text, {
    resolution: Math.min(window.devicePixelRatio || 1, 3),
    ...style,
  });
};

const parent = document.getElementById('game');

new Phaser.Game({
  type: Phaser.AUTO,
  parent: parent ?? undefined,
  backgroundColor: '#0d1a0d',
  scale: {
    mode: Phaser.Scale.FIT,
    width: 390,
    height: 844,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, TitleScene, PlayScene],
  audio: {
    disableWebAudio: false,
  },
  render: {
    // FIT CSS-scales a 390×844 canvas onto Retina. pixelArt nearest-neighbor looks like a low-res screenshot.
    pixelArt: false,
    antialias: true,
  },
});
