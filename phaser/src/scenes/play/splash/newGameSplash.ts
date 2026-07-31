import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildNewGameSplash(onConfirm: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add.text(0, -70, 'New Game', whiteText('12px', { strokeThickness: 4 })).setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(
          0,
          -30,
          'Restart the game from the very beginning.',
          whiteText('8px', { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(
      createImageButton(
        scene,
        0,
        30,
        'ui-btn-orange',
        'Start a New Game',
        200,
        40,
        onConfirm,
        1,
        '8px',
      ),
    );
    content.add(createImageButton(scene, 0, 82, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
