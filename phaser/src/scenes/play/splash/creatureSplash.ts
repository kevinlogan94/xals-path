import Phaser from 'phaser';
import type { CreatureDef } from '../../../types';
import { createImageButton } from '../ui/ImageButton';
import { darkText } from '../ui/textStyles';
import type { SplashContentApi, SplashContentBuilder } from './SplashView';

/** Unity sprite rects (x, bottom-left y, w, h). Tiny auto-slice junk omitted. */
const CREATURE_RUN: Record<
  string,
  { src: string; h: number; fps?: number; frames: [number, number, number, number][] }
> = {
  elk: {
    src: 'elk-run.png',
    h: 465,
    fps: 20,
    frames: [
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
    ],
  },
  hippocampus: {
    src: 'hippocampus.png',
    h: 365,
    frames: [
      [0, 183, 227, 182],
      [227, 183, 227, 182],
      [454, 183, 227, 182],
      [0, 1, 227, 182],
      [227, 1, 227, 182],
    ],
  },
  abraxas: {
    src: 'abraxas.png',
    h: 379,
    frames: [
      [21, 209, 186, 117],
      [238, 209, 186, 117],
      [459, 207, 186, 117],
      [23, 18, 186, 117],
      [242, 18, 186, 117],
    ],
  },
  raiju: {
    src: 'raiju.png',
    h: 326,
    frames: [
      [0, 163, 191, 163],
      [191, 163, 191, 163],
      [382, 163, 191, 163],
      [573, 163, 191, 163],
      [0, 0, 191, 163],
    ],
  },
  wraith: {
    src: 'wraith.png',
    h: 500,
    frames: [
      [0, 375, 125, 125],
      [125, 375, 125, 125],
      [250, 375, 125, 125],
      [375, 375, 125, 125],
      [0, 250, 125, 125],
      [125, 250, 125, 125],
      [250, 250, 125, 125],
      [375, 250, 125, 125],
      [0, 125, 125, 125],
      [125, 125, 125, 125],
      [250, 125, 125, 125],
      [375, 125, 125, 125],
      [0, 0, 125, 125],
    ],
  },
  bluecap: {
    src: 'bluecap.png',
    h: 262,
    frames: [
      [0, 0, 238, 262],
      [238, 0, 238, 262],
      [476, 0, 238, 262],
      [714, 0, 238, 262],
    ],
  },
  griffin: {
    src: 'griffin.png',
    h: 578,
    frames: [
      [0, 467, 138, 76],
      [144, 469, 139, 78],
      [288, 467, 139, 82],
      [0, 321, 138, 82],
      [144, 321, 139, 75],
      [288, 316, 139, 80],
      [0, 147, 138, 131],
      [144, 163, 139, 115],
      [290, 158, 133, 120],
      [2, 18, 133, 104],
    ],
  },
  basilisk: {
    src: 'basilisk.png',
    h: 291,
    frames: [
      [0, 197, 284, 94],
      [291, 197, 284, 94],
      [572, 198, 285, 93],
      [15, 98, 284, 94],
      [300, 95, 284, 94],
      [575, 98, 282, 94],
      [14, 7, 284, 94],
      [291, 8, 284, 94],
    ],
  },
  phoenix: {
    src: 'phoenix.png',
    h: 141,
    frames: [
      [11, 1, 140, 140],
      [161, 1, 140, 140],
      [309, 1, 140, 140],
      [450, 1, 140, 140],
      [601, 1, 140, 140],
      [744, 1, 140, 140],
      [891, 1, 140, 140],
      [1033, 1, 140, 140],
      [1179, 1, 140, 140],
      [1322, 1, 140, 140],
      [1469, 0, 140, 140],
      [1617, 0, 140, 140],
    ],
  },
  voidSpawn: {
    src: 'voidSpawn.png',
    h: 300,
    frames: [
      [0, 0, 300, 300],
      [300, 0, 300, 300],
      [600, 0, 300, 300],
      [900, 0, 300, 300],
    ],
  },
};

const LOCK_SHEET_KEY = 'ui-lock-sheet';
const LOCK_FRAME_X = [12, 362, 712, 1062, 1412];

export function texKey(id: string): string {
  return `creature-${id}-run`;
}

export function preloadCreatureSplashAssets(load: Phaser.Loader.LoaderPlugin): void {
  load.image(LOCK_SHEET_KEY, 'assets/ui/lock-sheet.png');
  for (const [id, sheet] of Object.entries(CREATURE_RUN)) {
    load.image(texKey(id), `assets/creatures/${sheet.src}`);
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

export function ensureRunAnim(scene: Phaser.Scene, creatureId: string): string | null {
  const sheet = CREATURE_RUN[creatureId];
  if (!sheet) return null;
  const key = `creature-run-${creatureId}`;
  if (scene.anims.exists(key)) return key;

  const textureKey = texKey(creatureId);
  if (!scene.textures.exists(textureKey)) return null;
  const tex = scene.textures.get(textureKey);
  if (!tex.has(`${creatureId}-0`)) {
    sheet.frames.forEach(([x, uy, w, h], i) => tex.add(`${creatureId}-${i}`, 0, x, sheet.h - uy - h, w, h));
  }
  if (!tex.has(`${creatureId}-0`)) return null;

  scene.anims.create({
    key,
    frames: sheet.frames.map((_, i) => ({ key: textureKey, frame: `${creatureId}-${i}` })),
    frameRate: sheet.fps ?? 10,
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
    const sprite = scene.add.sprite(0, -80, texKey(creature.id), `${creature.id}-0`).setOrigin(0.5, 0.5);
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
