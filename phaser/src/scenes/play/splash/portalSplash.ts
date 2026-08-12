import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildPortalSplash(): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add
        .text(
          0,
          -30,
          'The path closes… The portal opens.',
          darkText('13px', undefined, { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(createImageButton(scene, 0, 30, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
