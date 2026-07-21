import type Phaser from 'phaser';
import type { CreatureDef, GameSave, RegionId } from '../types';
import creaturesData from '../data/creatures.json';

interface Spawned {
  sprite: Phaser.GameObjects.Image;
  creatureId: string;
  magic: boolean;
  /** Cross-screen lifetime (~2.5s Unity MoveAcrossScreen). */
  age: number;
  duration: number;
  startX: number;
  endX: number;
  y: number;
}

interface PendingSpawn {
  delay: number;
  creatureId: string | null;
}

const CROSS_DURATION = 2.5;

/**
 * Unity-like creature traffic on Outlook:
 * left→right cross in ~2.5s, region-gated, tap for mana-gated multipliers.
 */
export class SpawnSystem {
  readonly creatures: CreatureDef[] = creaturesData.creatures as CreatureDef[];
  private spawned: Spawned[] = [];
  private pending: PendingSpawn[] = [];
  private scene: Phaser.Scene | null = null;
  private onTap:
    | ((entry: {
        sprite: Phaser.GameObjects.Image;
        magic: boolean;
        setMagic: () => void;
        hideCreature: () => void;
      }) => void)
    | null = null;

  attach(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  setTapHandler(
    handler: NonNullable<SpawnSystem['onTap']>,
  ): void {
    this.onTap = handler;
  }

  clear(): void {
    for (const s of this.spawned) s.sprite.destroy();
    this.spawned = [];
    this.pending = [];
  }

  hits(x: number, y: number): boolean {
    return this.spawned.some((s) => s.sprite.getBounds().contains(x, y));
  }

  eligible(state: GameSave, region: RegionId): CreatureDef[] {
    return this.creatures.filter((c) => {
      if (c.region !== region) return false;
      const h = state.helpers.find((x) => x.id === c.helperId);
      return (h?.amountOwned ?? 0) > 0;
    });
  }

  /** Queue a spawn after Unity-style 1–3s lag (or immediate). */
  schedule(
    state: GameSave,
    opts: { delay?: number; creatureId?: string | null } = {},
  ): void {
    const pool = this.eligible(state, state.region);
    if (!pool.length && !opts.creatureId) return;
    this.pending.push({
      delay: opts.delay ?? 1 + Math.random() * 2,
      creatureId: opts.creatureId ?? null,
    });
  }

  /** Passive helper tick: schedule one spawn per owned region-valid helper group. */
  onPassiveTick(state: GameSave): void {
    for (const h of state.helpers) {
      if (h.amountOwned <= 0) continue;
      const def = this.creatures.find((c) => c.helperId === h.id);
      if (!def || def.region !== state.region) continue;
      this.schedule(state, {
        delay: 1 + Math.random() * 2,
        creatureId: def.id,
      });
    }
  }

  tick(
    state: GameSave,
    dt: number,
    bounds: { x: number; y: number; w: number; h: number },
  ): void {
    if (!this.scene) return;

    for (const p of this.pending) p.delay -= dt;
    const ready = this.pending.filter((p) => p.delay <= 0);
    this.pending = this.pending.filter((p) => p.delay > 0);
    for (const p of ready) this.spawnOne(state, bounds, p.creatureId);

    for (const s of this.spawned) {
      s.age += dt;
      const t = Math.min(1, s.age / s.duration);
      s.sprite.x = s.startX + (s.endX - s.startX) * t;
      s.sprite.y = s.y + Math.sin(s.age * 3) * 4;
    }

    this.spawned = this.spawned.filter((s) => {
      if (s.age >= s.duration) {
        s.sprite.destroy();
        return false;
      }
      return true;
    });
  }

  private spawnOne(
    state: GameSave,
    bounds: { x: number; y: number; w: number; h: number },
    creatureId: string | null,
  ): void {
    if (!this.scene) return;
    if (this.spawned.length >= 8) return;

    let pick =
      (creatureId && this.creatures.find((c) => c.id === creatureId)) ||
      null;
    if (pick && pick.region !== state.region) pick = null;
    if (!pick) {
      const pool = this.eligible(state, state.region);
      if (!pool.length) return;
      pick = pool[Math.floor(Math.random() * pool.length)];
    }

    const key = `creature-${pick.id}`;
    if (!this.scene.textures.exists(key)) return;

    const startX = bounds.x - 40;
    const endX = bounds.x + bounds.w + 40;
    const y =
      bounds.y + 40 + Math.random() * Math.max(40, bounds.h - 80);

    const sprite = this.scene.add
      .image(startX, y, key)
      .setDisplaySize(96, 72)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    const entry: Spawned = {
      sprite,
      creatureId: pick.id,
      magic: false,
      age: 0,
      duration: CROSS_DURATION,
      startX,
      endX,
      y,
    };

    sprite.on('pointerdown', () => {
      this.onTap?.({
        sprite,
        magic: entry.magic,
        setMagic: () => {
          entry.magic = true;
        },
        hideCreature: () => {
          sprite.setVisible(false);
        },
      });
    });

    this.spawned.push(entry);
  }
}
