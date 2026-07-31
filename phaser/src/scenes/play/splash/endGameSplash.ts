import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildEndGameSplash(onCredits: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add.text(0, -80, 'Congratulations', whiteText('12px', { strokeThickness: 4 })).setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(
          0,
          -30,
          "You have reached the end of Xal's Path.\n\nThank you for playing.",
          whiteText('8px', { align: 'center', wordWrap: { width: 280 }, lineSpacing: 4 }),
        )
        .setOrigin(0.5),
    );
    content.add(
      createImageButton(
        scene,
        0,
        50,
        'ui-btn-green',
        'Credits',
        120,
        34,
        () => {
          api.close();
          onCredits();
        },
        1,
        '8px',
      ),
    );
    content.add(createImageButton(scene, 0, 95, 'ui-btn-blue', 'Back', 120, 34, api.close));
  };
}
