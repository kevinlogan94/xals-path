import { formatNumber } from '../../../utils/format';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import { stackSplash, type SplashContentBuilder } from './SplashView';

export function buildInfluenceOverTimeSplash(
  amount: number,
  onCollect: () => void,
): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    const wrap = api.bodyWidth * 0.86;
    const items = [
      scene.add.image(0, 0, 'ui-influence').setDisplaySize(80, 108),
      scene.add
        .text(
          0,
          0,
          'While you were away, the incantation from your tomes continued to collect influence.',
          darkText('13px', undefined, { align: 'center', wordWrap: { width: wrap } }),
        )
        .setOrigin(0.5),
      scene.add.text(0, 0, `${formatNumber(amount)} influence`, darkText('14px')).setOrigin(0.5),
      createImageButton(scene, 0, 0, 'ui-btn-green', 'Collect', 120, 40, () => {
        onCollect();
        api.close();
      }, 1, '11px'),
    ];
    content.add(items);
    stackSplash(items, api);
  };
}
