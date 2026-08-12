import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
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
    if (opts.iconKey && scene.textures.exists(opts.iconKey)) {
      content.add(scene.add.image(0, -45, opts.iconKey).setDisplaySize(48, 48));
    }
    const body =
      opts.before != null && opts.after != null
        ? `${opts.description}\n${opts.before}  →  ${opts.after}`
        : opts.description;
    const desc = scene.add
      .text(0, -5, body, darkText('13px', undefined, { align: 'center', wordWrap: { width: 280 } }))
      .setOrigin(0.5, 0);
    content.add(desc);
    content.add(
      createImageButton(scene, 0, Math.max(85, desc.y + desc.height + 28), 'ui-btn-blue', 'Back', 120, 34, api.close),
    );
  };
}
