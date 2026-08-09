import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildNewGameSplash(onConfirm: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add
        .text(
          0,
          -45,
          'Restart the game from the very beginning.',
          darkText('8px', undefined, { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(
      createImageButton(
        scene,
        0,
        10,
        'ui-btn-orange',
        'Start a New Game',
        200,
        40,
        onConfirm,
        1,
        '8px',
      ),
    );
    content.add(createImageButton(scene, 0, 62, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
