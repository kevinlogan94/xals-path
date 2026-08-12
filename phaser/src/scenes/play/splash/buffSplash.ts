import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildBuffSplash(onCollect: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add.text(0, -45, 'Yes!! Way to go!!', darkText('14px')).setOrigin(0.5),
    );
    content.add(scene.add.text(0, -10, '15 Seconds', darkText('13px')).setOrigin(0.5));
    content.add(
      createImageButton(
        scene,
        0,
        35,
        'ui-btn-green',
        'Collect',
        120,
        40,
        () => {
          onCollect();
          api.close();
        },
        1,
        '11px',
      ),
    );
  };
}
