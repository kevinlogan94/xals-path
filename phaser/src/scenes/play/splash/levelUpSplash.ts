import { formatNumber } from '../../../utils/format';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildLevelUpSplash(
  reward: number,
  onContinue: () => void,
): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add
        .text(0, -40, `${formatNumber(reward)} influence`, darkText('14px'))
        .setOrigin(0.5),
    );
    content.add(
      createImageButton(scene, 0, 10, 'ui-btn-green', 'Projection', 140, 40, undefined, 0.4, '11px'),
    );
    content.add(
      createImageButton(
        scene,
        0,
        58,
        'ui-btn-blue',
        'No Thanks!',
        140,
        34,
        () => {
          onContinue();
          api.close();
        },
        1,
        '11px',
      ),
    );
  };
}
