import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import { stackSplash, type SplashContentBuilder } from './SplashView';

export function buildPortalSplash(): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const items = [
      scene.add
        .text(
          0,
          0,
          'The path closes… The portal opens.',
          darkText('13px', undefined, { align: 'center', wordWrap: { width: api.bodyWidth * 0.86 } }),
        )
        .setOrigin(0.5),
      createImageButton(scene, 0, 0, 'ui-btn-blue', 'Back', 120, 34, api.close),
    ];
    content.add(items);
    stackSplash(items, api);
  };
}
