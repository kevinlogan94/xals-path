import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import { stackSplash, type SplashContentBuilder } from './SplashView';

export function buildEndGameSplash(onCredits: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const items = [
      scene.add
        .text(
          0,
          0,
          "You have reached the end of Xal's Path.\n\nThank you for playing.",
          darkText('13px', undefined, { align: 'center', wordWrap: { width: api.bodyWidth * 0.86 } }),
        )
        .setOrigin(0.5),
      createImageButton(scene, 0, 0, 'ui-btn-green', 'Credits', 120, 34, () => {
        api.close();
        onCredits();
      }, 1, '11px'),
      createImageButton(scene, 0, 0, 'ui-btn-blue', 'Back', 120, 34, api.close),
    ];
    content.add(items);
    stackSplash(items, api);
  };
}
