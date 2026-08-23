import { formatNumber } from '../../../utils/format';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import { stackSplash, type SplashContentBuilder } from './SplashView';

export function buildLevelUpSplash(
  reward: number,
  onContinue: () => void,
): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const items = [
      scene.add.text(0, 0, `${formatNumber(reward)} influence`, darkText('14px')).setOrigin(0.5),
      createImageButton(scene, 0, 0, 'ui-btn-green', 'Collect', 120, 40, () => {
        onContinue();
        api.close();
      }, 1, '11px'),
    ];
    content.add(items);
    stackSplash(items, api);
  };
}
