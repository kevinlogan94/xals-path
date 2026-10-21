import Phaser from 'phaser';
import type { CreatureDef, GameSave, RegionId } from '../types';
import creaturesData from '../data/creatures.json';
import { makeMagicAura } from '../scenes/play/outlook/creatureMagic';
import { ensureRunAnim, texKey } from '../scenes/play/splash/creatureSplash';

interface Spawned {
  sprite: Phaser.GameObjects.Sprite;
  magicAura: Phaser.GameObjects.Container;
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
        sprite: Phaser.GameObjects.Sprite;
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
    for (const s of this.spawned) {
      s.sprite.destroy();
      s.magicAura.destroy();
    }
    this.spawned = [];
    this.pending = [];
  }

  hits(x: number, y: number): boolean {
    return this.spawned.some(
      (s) =>
        s.sprite.getBounds().contains(x, y) ||
        (s.magicAura.visible && Phaser.Math.Distance.Between(x, y, s.magicAura.x, s.magicAura.y) <= 58),
    );
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
      s.magicAura.x = s.sprite.x;
      s.magicAura.y = s.sprite.y;
    }

    this.spawned = this.spawned.filter((s) => {
      if (s.age >= s.duration) {
        s.sprite.destroy();
        s.magicAura.destroy();
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

    const runKey = ensureRunAnim(this.scene, pick.id);
    if (!runKey) return;

    const startX = bounds.x - 40;
    const endX = bounds.x + bounds.w + 40;
    const y =
      bounds.y + 40 + Math.random() * Math.max(40, bounds.h - 80);

    const sprite = this.scene.add
      .sprite(startX, y, texKey(pick.id), `${pick.id}-0`)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);
    sprite.setScale(Math.min(96 / sprite.width, 72 / sprite.height));
    sprite.play(runKey);

    const magicAura = makeMagicAura(this.scene);

    const entry: Spawned = {
      sprite,
      magicAura,
      creatureId: pick.id,
      magic: false,
      age: 0,
      duration: CROSS_DURATION,
      startX,
      endX,
      y,
    };

    const tap = () => {
      this.onTap?.({
        sprite,
        magic: entry.magic,
        setMagic: () => {
          entry.magic = true;
          magicAura.setVisible(true);
        },
        hideCreature: () => {
          sprite.setVisible(false);
        },
      });
    };
    sprite.on('pointerdown', tap);
    magicAura
      .setInteractive(new Phaser.Geom.Circle(0, 0, 58), Phaser.Geom.Circle.Contains)
      .on('pointerdown', tap);
    magicAura.input!.cursor = 'pointer';

    this.spawned.push(entry);
  }
}
