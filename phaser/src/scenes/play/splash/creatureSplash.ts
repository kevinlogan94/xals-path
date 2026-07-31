import Phaser from 'phaser';
import type { CreatureDef } from '../../../types';
import { createImageButton } from '../ui/ImageButton';
import { whiteText } from '../ui/textStyles';
import type { SplashContentBuilder } from './SplashView';

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

export function preloadCreatureSplashAssets(load: Phaser.Loader.LoaderPlugin): void {
  load.image(LOCK_SHEET_KEY, 'assets/ui/lock-sheet.png');
  for (const [id, sheet] of Object.entries(CREATURE_RUN_SHEETS)) {
    const path = id === 'elk' ? 'assets/creatures/elk-run.png' : `assets/creatures/${id}.png`;
    load.spritesheet(sheet.key, path, {
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
    duration: 3000,
    repeat: 0,
  });
  return true;
}

function ensureRunAnim(scene: Phaser.Scene, creatureId: string): string | null {
  const sheet = CREATURE_RUN_SHEETS[creatureId];
  if (!sheet || !scene.textures.exists(sheet.key)) return null;
  const key = `creature-run-${creatureId}`;
  if (scene.anims.exists(key)) return key;
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

function showCreaturePanel(content: Phaser.GameObjects.Container, creature: CreatureDef, api: { close: () => void }): void {
  const scene = content.scene;
  content.removeAll(true);

  content.add(
    scene.add
      .text(0, -120, 'New Creature Unlocked', whiteText('12px', { strokeThickness: 4 }))
      .setOrigin(0.5),
  );
  content.add(scene.add.text(0, -95, creature.name, whiteText('10px', { strokeThickness: 3 })).setOrigin(0.5));
  content.add(
    scene.add
      .text(0, -70, creature.description, whiteText('8px', { align: 'center', wordWrap: { width: 280 } }))
      .setOrigin(0.5, 0),
  );
  content.add(
    scene.add.text(0, 20, '200/second', whiteText('8px', { strokeThickness: 2 })).setOrigin(0.5),
  );

  const runKey = ensureRunAnim(scene, creature.id);
  if (runKey) {
    const sprite = scene.add.sprite(0, 75, CREATURE_RUN_SHEETS[creature.id].key).setOrigin(0.5, 1);
    const maxH = 90;
    const scale = maxH / sprite.height;
    sprite.setScale(scale);
    sprite.play(runKey);
    content.add(sprite);
  }

  content.add(createImageButton(scene, 0, 130, 'ui-btn-blue', 'Back', 120, 34, api.close));
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
