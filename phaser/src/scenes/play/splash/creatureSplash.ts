import Phaser from 'phaser';
import type { CreatureDef } from '../../../types';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentApi, SplashContentBuilder } from './SplashView';

/** id → run spritesheet meta (splash only; Outlook keeps `creature-{id}` image). */
export const CREATURE_RUN_SHEETS: Record<
  string,
  { key: string; frameWidth: number; frameHeight: number; frameCount?: number }
> = {
  elk: { key: 'creature-elk-run', frameWidth: 130, frameHeight: 123, frameCount: 11 },
  hippocampus: { key: 'creature-hippocampus-run', frameWidth: 227, frameHeight: 182, frameCount: 3 },
  abraxas: { key: 'creature-abraxas-run', frameWidth: 186, frameHeight: 117, frameCount: 5 },
  raiju: { key: 'creature-raiju-run', frameWidth: 191, frameHeight: 163, frameCount: 4 },
  wraith: { key: 'creature-wraith-run', frameWidth: 125, frameHeight: 125, frameCount: 16 },
  bluecap: { key: 'creature-bluecap-run', frameWidth: 238, frameHeight: 262, frameCount: 4 },
  griffin: { key: 'creature-griffin-run', frameWidth: 138, frameHeight: 144, frameCount: 11 },
  basilisk: { key: 'creature-basilisk-run', frameWidth: 107, frameHeight: 291, frameCount: 8 },
  phoenix: { key: 'creature-phoenix-run', frameWidth: 140, frameHeight: 141, frameCount: 12 },
  voidSpawn: { key: 'creature-voidSpawn-run', frameWidth: 300, frameHeight: 300, frameCount: 4 },
};

const LOCK_SHEET_KEY = 'ui-lock-sheet';
const LOCK_FRAME_X = [12, 362, 712, 1062, 1412];

/** Unity dark-elk-animation rects (bottom-left y) → manual atlas frames. */
const ELK_TEX_H = 465;
const ELK_RUN_FRAMES: [number, number, number, number][] = [
  [0, 316, 130, 123],
  [135, 316, 130, 123],
  [270, 316, 130, 123],
  [407, 316, 129, 123],
  [5, 159, 130, 123],
  [135, 163, 130, 123],
  [271, 164, 130, 123],
  [405, 164, 130, 123],
  [5, 7, 130, 123],
  [137, 7, 130, 120],
  [271, 7, 130, 123],
];

export function preloadCreatureSplashAssets(load: Phaser.Loader.LoaderPlugin): void {
  load.image(LOCK_SHEET_KEY, 'assets/ui/lock-sheet.png');
  load.image('creature-elk-run', 'assets/creatures/elk-run.png');
  for (const [id, sheet] of Object.entries(CREATURE_RUN_SHEETS)) {
    if (id === 'elk') continue;
    load.spritesheet(sheet.key, `assets/creatures/${id}.png`, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    });
  }
}

const LOCK_ANIM = 'ui-lock-unlock';

function ensureLockFrames(scene: Phaser.Scene): boolean {
  if (!scene.textures.exists(LOCK_SHEET_KEY)) return false;
  const tex = scene.textures.get(LOCK_SHEET_KEY);
  if (!tex.has('lock-0')) {
    LOCK_FRAME_X.forEach((x, i) => tex.add(`lock-${i}`, 0, x, 4, 324, 540));
  }
  return tex.has('lock-0');
}

function ensureLockAnim(scene: Phaser.Scene): boolean {
  if (!ensureLockFrames(scene)) return false;
  if (scene.anims.exists(LOCK_ANIM)) return true;
  scene.anims.create({
    key: LOCK_ANIM,
    frames: LOCK_FRAME_X.map((_, i) => ({ key: LOCK_SHEET_KEY, frame: `lock-${i}` })),
    duration: 1000,
    repeat: 0,
  });
  return true;
}

function ensureElkRunFrames(scene: Phaser.Scene): boolean {
  const key = 'creature-elk-run';
  if (!scene.textures.exists(key)) return false;
  const tex = scene.textures.get(key);
  if (tex.has('elk-0')) return true;
  ELK_RUN_FRAMES.forEach(([x, uy, w, h], i) => tex.add(`elk-${i}`, 0, x, ELK_TEX_H - uy - h, w, h));
  return tex.has('elk-0');
}

function ensureRunAnim(scene: Phaser.Scene, creatureId: string): string | null {
  const sheet = CREATURE_RUN_SHEETS[creatureId];
  if (!sheet) return null;
  const key = `creature-run-${creatureId}`;
  if (scene.anims.exists(key)) return key;

  if (creatureId === 'elk') {
    if (!ensureElkRunFrames(scene)) return null;
    scene.anims.create({
      key,
      frames: ELK_RUN_FRAMES.map((_, i) => ({ key: 'creature-elk-run', frame: `elk-${i}` })),
      frameRate: 20,
      repeat: -1,
    });
    return key;
  }

  if (!scene.textures.exists(sheet.key)) return null;
  const tex = scene.textures.get(sheet.key);
  const end = sheet.frameCount != null ? Math.min(sheet.frameCount - 1, tex.frameTotal - 1) : tex.frameTotal - 1;
  if (end < 0) return null;
  scene.anims.create({
    key,
    frames: scene.anims.generateFrameNumbers(sheet.key, { start: 0, end }),
    frameRate: 10,
    repeat: -1,
  });
  return key;
}

function showCreaturePanel(
  content: Phaser.GameObjects.Container,
  creature: CreatureDef,
  api: SplashContentApi,
): void {
  const scene = content.scene;
  api.showChrome();
  content.removeAll(true);

  const wrap = Math.max(160, Math.round(api.bodyWidth * 0.88));
  const slot = 90;
  content.add(scene.add.image(0, -80, 'ui-item-slot').setDisplaySize(slot, slot));

  const runKey = ensureRunAnim(scene, creature.id);
  if (runKey) {
    const sheetKey = CREATURE_RUN_SHEETS[creature.id].key;
    const frame = creature.id === 'elk' ? 'elk-0' : 0;
    const sprite = scene.add.sprite(0, -80, sheetKey, frame).setOrigin(0.5, 0.5);
    const scale = (slot * 0.72) / Math.max(sprite.width, sprite.height);
    sprite.setScale(scale);
    sprite.play(runKey);
    content.add(sprite);
  }

  content.add(scene.add.text(0, -22, creature.name, darkText('10px')).setOrigin(0.5));
  const desc = scene.add
    .text(
      0,
      -8,
      creature.description,
      darkText('7px', undefined, {
        align: 'center',
        wordWrap: { width: wrap },
        lineSpacing: 6,
      }),
    )
    .setOrigin(0.5, 0);
  content.add(desc);
  const backY = Math.max(95, desc.y + desc.height + 28);
  content.add(createImageButton(scene, 0, backY, 'ui-btn-blue', 'Back', 120, 34, api.close));
}

export function buildCreatureSplash(creature: CreatureDef): SplashContentBuilder {
  return (content, api) => {
    const scene = content.scene;
    if (!ensureLockAnim(scene)) {
      showCreaturePanel(content, creature, api);
      return;
    }

    const lock = scene.add.sprite(0, 0, LOCK_SHEET_KEY, 'lock-0').setOrigin(0.5);
    const lockScale = Math.min(120 / lock.width, 200 / lock.height);
    lock.setScale(lockScale);
    content.add(lock);

    lock.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      showCreaturePanel(content, creature, api);
    });
    lock.play(LOCK_ANIM);
  };
}
