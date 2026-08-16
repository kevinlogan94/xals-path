import Phaser from 'phaser';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import { stackSplash, type SplashContentBuilder } from './SplashView';

export type AchievementSplashOpts = {
  title: string;
  description: string;
  iconKey?: string;
  before?: string;
  after?: string;
};

export function buildAchievementSplash(opts: AchievementSplashOpts): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const items: Phaser.GameObjects.GameObject[] = [];
    if (opts.iconKey && scene.textures.exists(opts.iconKey)) {
      items.push(scene.add.image(0, 0, opts.iconKey).setDisplaySize(48, 48));
    }
    const body =
      opts.before != null && opts.after != null
        ? `${opts.description}\n${opts.before}  →  ${opts.after}`
        : opts.description;
    items.push(
      scene.add
        .text(0, 0, body, darkText('13px', undefined, { align: 'center', wordWrap: { width: api.bodyWidth * 0.86 } }))
        .setOrigin(0.5),
    );
    items.push(createImageButton(scene, 0, 0, 'ui-btn-blue', 'Back', 120, 34, api.close));
    content.add(items);
    stackSplash(items, api);
  };
}
