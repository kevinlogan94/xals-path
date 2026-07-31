import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

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
    content.add(
      scene.add.text(0, -100, opts.title, whiteText('12px', { strokeThickness: 4 })).setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(0, -72, opts.description, whiteText('8px', { align: 'center', wordWrap: { width: 280 } }))
        .setOrigin(0.5, 0),
    );
    if (opts.iconKey && scene.textures.exists(opts.iconKey)) {
      content.add(scene.add.image(0, -10, opts.iconKey).setDisplaySize(48, 48));
    }
    if (opts.before != null && opts.after != null) {
      content.add(
        scene.add
          .text(0, 40, `Before: ${opts.before}`, whiteText('8px', { color: '#c8b89a' }))
          .setOrigin(0.5),
      );
      content.add(
        scene.add
          .text(0, 58, `After: ${opts.after}`, whiteText('8px', { color: '#9ec9ff' }))
          .setOrigin(0.5),
      );
    }
    content.add(createImageButton(scene, 0, 110, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
