import Phaser from 'phaser';

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
    h: 108,
    fps: 16,
    frames: [
      [0, 0, 176, 108],
      [176, 0, 176, 108],
      [352, 0, 176, 108],
      [528, 0, 176, 108],
      [704, 0, 176, 108],
      [880, 0, 176, 108],
      [1056, 0, 176, 108],
      [1232, 0, 176, 108],
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
    h: 163,
    frames: [
      [0, 0, 157, 163],
      [157, 0, 157, 163],
      [314, 0, 157, 163],
      [471, 0, 157, 163],
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

export function texKey(id: string): string {
  return `creature-${id}-run`;
}

export function creatureRun(id: string): {
  src: string;
  fps: number;
  frames: { x: number; y: number; w: number; h: number }[];
} | null {
  const sheet = CREATURE_RUN[id];
  if (!sheet) return null;
  return {
    src: `./assets/creatures/${sheet.src}`,
    fps: sheet.fps ?? 10,
    frames: sheet.frames.map(([x, uy, w, h]) => ({
      x: x * 2,
      y: (sheet.h - uy - h) * 2,
      w: w * 2,
      h: h * 2,
    })),
  };
}

export function creatureFirstFrame(id: string) {
  const run = creatureRun(id);
  const frame = run?.frames[0];
  return run && frame ? { src: run.src, ...frame } : null;
}

export function preloadCreatureSplashAssets(load: Phaser.Loader.LoaderPlugin): void {
  for (const [id, sheet] of Object.entries(CREATURE_RUN)) {
    load.image(texKey(id), `assets/creatures/${sheet.src}`);
  }
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
    sheet.frames.forEach(([x, uy, w, h], i) =>
      tex.add(`${creatureId}-${i}`, 0, x * 2, (sheet.h - uy - h) * 2, w * 2, h * 2),
    );
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
