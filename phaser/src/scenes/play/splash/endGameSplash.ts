import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildEndGameSplash(onCredits: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add
        .text(
          0,
          -50,
          "You have reached the end of Xal's Path.\n\nThank you for playing.",
          darkText('13px', undefined, { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(
      createImageButton(
        scene,
        0,
        30,
        'ui-btn-green',
        'Credits',
        120,
        34,
        () => {
          api.close();
          onCredits();
        },
        1,
        '11px',
      ),
    );
    content.add(createImageButton(scene, 0, 75, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
