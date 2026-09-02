import Phaser from 'phaser';
import { passInstallGate } from './installGate';
import { BootScene } from './scenes/BootScene';
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

await passInstallGate();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: parent ?? undefined,
  backgroundColor: '#0d1a0d',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, PlayScene],
  audio: {
    disableWebAudio: false,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
});
