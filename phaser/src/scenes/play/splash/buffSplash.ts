import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildBuffSplash(onCollect: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add
        .text(0, -70, 'Blessing of the Gods', whiteText('12px', { strokeThickness: 4 }))
        .setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(0, -30, 'Yes!! Way to go!!', whiteText('10px', { strokeThickness: 3 }))
        .setOrigin(0.5),
    );
    content.add(
      scene.add.text(0, 10, '15 Seconds', whiteText('8px', { strokeThickness: 2 })).setOrigin(0.5),
    );
    content.add(
      createImageButton(
        scene,
        0,
        50,
        'ui-btn-green',
        'Collect',
        120,
        40,
        () => {
          onCollect();
          api.close();
        },
        1,
        '8px',
      ),
    );
  };
}
