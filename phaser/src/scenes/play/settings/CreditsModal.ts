import Phaser from 'phaser';
import { addFramedPanel } from '../ui/FramedPanel';
import { createImageButton } from '../ui/ImageButton';
import { createScrollList } from '../ui/ScrollList';
import { darkText } from '../ui/textStyles';

const CREDITS_NAME = 'credits-modal';

/** Unity CreditsPanel RoleText / NameText pairs. */
const CREDITS: [string, string[]][] = [
  ['Game Design', ['Kevin Logan']],
  ['Developer', ['Kevin Logan']],
  ['Music', ['Steven Logan']],
  ['Sound Effects', ['freesound.org']],
  ['Art', ['Kevin Logan', 'Shayne Gadd']],
  ['Story', ['Kevin Logan', 'Elliot Maynard']],
  ['Brand', ['Brock Johnson']],
  [
    'iOS Testers',
    [
      'Ryan Schalk',
      'Michaela Schalk',
      'Kyle Werling',
      'Steven Logan',
      'Steve G. Logan',
      'Shayne Gadd',
      'Katie Waldrop',
      'Collin Hammond',
      'Kevin Hammond',
      'Elliot Maynard',
      'Michael Leone',
      'Lisa Logan',
      'Will Logan',
      'Elisabeth Logan',
    ],
  ],
  [
    'Android Testers',
    ['Kyle Ihli', 'Miguel Ortiz', 'Cody Platt', 'Travis Mikolay', 'Tyler Kidwell'],
  ],
  ['Backer', ['Elliot Maynard']],
];

export function showCreditsModal(scene: Phaser.Scene, parent: Phaser.GameObjects.Container): void {
  const prior = parent.getByName(CREDITS_NAME);
  if (prior) prior.destroy(true);

  const overlay = scene.add.container(0, 0).setName(CREDITS_NAME);
  parent.add(overlay);
  const close = () => overlay.destroy(true);
  const { dim, listTop, listBottom, listLeft, listWidth, scrollX } = addFramedPanel(
    scene,
    overlay,
    'Credits',
  );
  const closeY = listBottom - 18;
  const [roleSrc, nameSrc] = CREDITS.reduce<[string[], string[]]>(
    ([roles, names], [role, people]) => {
      roles.push(role, ...Array<string>(people.length - 1).fill(''), '');
      names.push(...people, '');
      return [roles, names];
    },
    [[], []],
  );
  const style = darkText('7px', undefined, { lineSpacing: 6 });
  const title = scene.add.image(0, 0, 'ui-xal-title');
  const tw = Math.min(listWidth - 24, 240);
  title.setDisplaySize(tw, tw * (57 / 280));
  const created = scene.add
    .text(0, 0, 'Created By\nKevin Logan', darkText('8px', undefined, { align: 'center', lineSpacing: 8 }))
    .setOrigin(0.5, 0);
  const roles = scene.add.text(0, 0, roleSrc.join('\n'), { ...style, align: 'right' }).setOrigin(1, 0);
  const names = scene.add.text(0, 0, nameSrc.join('\n'), { ...style, align: 'left' }).setOrigin(0, 0);
  const headerH = title.displayHeight + 12 + created.height + 16;
  const contentH = headerH + Math.max(roles.height, names.height) + 8;
  let y = -contentH / 2;
  title.setY(y + title.displayHeight / 2);
  y += title.displayHeight + 12;
  created.setY(y);
  y += created.height + 16;
  roles.setPosition(-6, y);
  names.setPosition(6, y);
  const scroll = createScrollList({
    scene,
    panel: overlay,
    dim,
    listTop,
    listBottom: closeY - 26,
    listLeft,
    listWidth,
    scrollX,
    rowHeight: contentH,
    rowCount: 1,
    scroll: 0,
    onScroll: () => undefined,
  });
  scroll.addCard(scene.add.container(0, 0, [title, created, roles, names]));
  scroll.apply();
  overlay.add(
    createImageButton(scene, scene.scale.width / 2, closeY, 'ui-btn-blue', 'Close', 120, 34, close),
  );
}
