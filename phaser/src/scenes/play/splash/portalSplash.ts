import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildPortalSplash(): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add.text(0, -60, 'Portal', whiteText('12px', { strokeThickness: 4 })).setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(
          0,
          -10,
          'The path closes… The portal opens.',
          whiteText('8px', { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(createImageButton(scene, 0, 50, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
