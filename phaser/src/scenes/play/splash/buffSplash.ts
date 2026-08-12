import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import { stackSplash, type SplashContentBuilder } from './SplashView';

export function buildBuffSplash(onCollect: () => void): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const items = [
      scene.add.text(0, 0, 'Yes!! Way to go!!', darkText('14px')).setOrigin(0.5),
      scene.add.text(0, 0, '15 Seconds', darkText('13px')).setOrigin(0.5),
      createImageButton(scene, 0, 0, 'ui-btn-green', 'Collect', 120, 40, () => {
        onCollect();
        api.close();
      }, 1, '11px'),
    ];
    content.add(items);
    stackSplash(items, api);
  };
}
