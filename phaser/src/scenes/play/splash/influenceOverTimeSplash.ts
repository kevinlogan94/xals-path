import { formatNumber } from '../../../utils/format';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildInfluenceOverTimeSplash(
  amount: number,
  onCollect: () => void,
): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add
        .text(
          0,
          -45,
          'While you were away, the incantation from your tomes continued to collect influence.',
          darkText('13px', undefined, { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(0, 0, `${formatNumber(amount)} influence`, darkText('14px'))
        .setOrigin(0.5),
    );
    content.add(
      createImageButton(
        scene,
        0,
        45,
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
