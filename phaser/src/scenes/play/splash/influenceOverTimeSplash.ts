import { formatNumber } from '../../../utils/format';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

export function buildInfluenceOverTimeSplash(
  amount: number,
  onCollect: () => void,
): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    content.add(
      scene.add.text(0, -70, 'Influence Earned', whiteText('12px', { strokeThickness: 4 })).setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(
          0,
          -30,
          'While you were away, the incantation from your tomes continued to collect influence.',
          whiteText('8px', { align: 'center', wordWrap: { width: 280 } }),
        )
        .setOrigin(0.5),
    );
    content.add(
      scene.add
        .text(0, 10, `${formatNumber(amount)} influence`, whiteText('10px', { strokeThickness: 3 }))
        .setOrigin(0.5),
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
