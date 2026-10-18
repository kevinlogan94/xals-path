import Phaser from 'phaser';
import './hud/blighted-scroll.css';
import { passInstallGate } from './installGate';
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
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    ...style,
  });
};

const parent = document.getElementById('game');

await passInstallGate();
await Promise.race([
  Promise.all([
    document.fonts.load('900 44px "Cinzel Decorative"'),
    document.fonts.load('italic 600 16px "Cormorant Garamond"'),
    document.fonts.load('500 11px "JetBrains Mono"'),
  ]),
  new Promise((resolve) => window.setTimeout(resolve, 2500)),
]);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: parent ?? undefined,
  backgroundColor: '#070408',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TitleScene, PlayScene],
  audio: {
    disableWebAudio: false,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
});
