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

const BTN_H = 34;
const BTN_GAP = 22;

/** Card hint → splash body: drop Rewards:/Nx/parenthetical; keep one short line. */
function splashDescription(raw: string): string {
  const line = raw.split('\n')[0].replace(/^Rewards:\s*/i, '').trim();
  return line
    .replace(/\b\d+x\s+/i, '')
    .replace(/\bworth of\b/i, 'of')
    .replace(/^([a-z])/, (c) => c.toUpperCase());
}

export function buildAchievementSplash(opts: AchievementSplashOpts): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const items: Phaser.GameObjects.GameObject[] = [];
    if (opts.iconKey && scene.textures.exists(opts.iconKey)) {
      items.push(scene.add.image(0, 0, opts.iconKey).setDisplaySize(80, 80));
    }
    items.push(
      scene.add
        .text(0, 0, splashDescription(opts.description), darkText('13px', undefined, {
          align: 'center',
          wordWrap: { width: api.bodyWidth * 0.86 },
        }))
        .setOrigin(0.5),
    );
    if (opts.before != null && opts.after != null) {
      items.push(
        scene.add
          .text(0, 0, `${opts.before}  →  ${opts.after}`, darkText('11px', undefined, { align: 'center' }))
          .setOrigin(0.5),
      );
    }

    const btn = createImageButton(scene, 0, 0, 'ui-btn-blue', 'Back', 120, BTN_H, api.close);
    btn.setY(api.bodyBottom - BTN_H / 2);
    content.add([...items, btn]);
    stackSplash(items, { ...api, bodyBottom: api.bodyBottom - BTN_H - BTN_GAP });
  };
}
