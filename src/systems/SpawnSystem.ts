import Phaser from 'phaser';
import type { CreatureDef, GameSave, RegionId } from '../types';
import creaturesData from '../data/creatures.json';
import economy from '../data/economy.json';
import {
  makeBlightedAura,
  makeMagicAura,
  makeVesselAura,
  playLeylineArc,
  spawnBloomFlower,
  type BlightedAuraHandle,
} from '../scenes/play/outlook/creatureMagic';
import { ensureRunAnim, texKey } from '../scenes/play/splash/creatureSplash';

interface Spawned {
  sprite: Phaser.GameObjects.Sprite;
  magicAura: Phaser.GameObjects.Container;
  blightedAura: BlightedAuraHandle;
  vesselAura: BlightedAuraHandle;
  creatureId: string;
  resonating: boolean;
  resonanceOrbAcc: number;
  countedInConvergence: boolean;
  blighted: boolean;
  vessel: boolean;
  shieldPips: number;
  done: boolean;
  age: number;
  x: number;
  baseY: number;
  hopY: number;
  dir: 1 | -1;
  speed: number;
}

interface PendingSpawn {
  delay: number;
  creatureId: string | null;
  forceVessel?: boolean;
}

interface ActiveBloom {
  x: number;
  y: number;
  consumed: boolean;
  graphic: Phaser.GameObjects.Graphics;
}

export interface CreatureTapHit {
  sprite: Phaser.GameObjects.Sprite;
  blighted: boolean;
  vessel: boolean;
  shieldPips: number;
  resonating: boolean;
  applyTap: () => { purified: boolean; enteredResonance: boolean };
}

const MAX_CREATURES = 6;
const RESONANCE_TICK_INTERVAL = 0.55;
const BLOOM_PAD_RADIUS = 72;
const PROXIMITY_ARC_RADIUS = 135;

/**
 * Fast-paced continuous creature stream on Outlook:
 * - Lvl 1+: Creatures run across (3.4–4.4s), ignite into Resonance on the run, detonate Bloom pads,
 *   and link 3 resonating creatures into The Great Weave.
 * - Ch 2+ (manaLevel >= 2): 10th-spell Arcane Surge chains lightning to all creatures.
 * - Ch 3+ (manaLevel >= 3): 25-spell streak summons an evasive golden Ancient Vessel (dodges on tap).
 * - Ch 4+ (manaLevel >= 4): Twin Arcane Surge strikes twice and instantly cleanses Corrupted creatures.
 */
export class SpawnSystem {
  readonly creatures: CreatureDef[] = creaturesData.creatures as CreatureDef[];
  private spawned: Spawned[] = [];
  private pending: PendingSpawn[] = [];
  private blooms: ActiveBloom[] = [];
  private lastBounds: { x: number; y: number; w: number; h: number } = {
    x: 0,
    y: 76,
    w: 390,
    h: 500,
  };
  private scene: Phaser.Scene | null = null;
  private onTap: ((hit: CreatureTapHit) => void) | null = null;
  private onResonanceOrb: ((x: number, y: number) => void) | null = null;
  private onConvergence: ((x: number, y: number) => void) | null = null;

  attach(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  setTapHandler(handler: NonNullable<SpawnSystem['onTap']>): void {
    this.onTap = handler;
  }

  setResonanceOrbHandler(handler: NonNullable<SpawnSystem['onResonanceOrb']>): void {
    this.onResonanceOrb = handler;
  }

  setConvergenceHandler(handler: NonNullable<SpawnSystem['onConvergence']>): void {
    this.onConvergence = handler;
  }

  hasBlighted(): boolean {
    return this.spawned.some((s) => s.blighted);
  }

  hasVessel(): boolean {
    return this.spawned.some((s) => s.vessel);
  }

  hasActiveOrPending(): boolean {
    return this.spawned.length > 0 || this.pending.length > 0;
  }

  clear(): void {
    for (const s of this.spawned) {
      s.sprite.destroy();
      s.magicAura.destroy();
      s.blightedAura.container.destroy();
      s.vesselAura.container.destroy();
    }
    for (const b of this.blooms) {
      b.graphic.destroy();
    }
    this.spawned = [];
    this.pending = [];
    this.blooms = [];
  }

  hits(x: number, y: number): boolean {
    return this.spawned.some(
      (s) =>
        !s.done &&
        (s.sprite.getBounds().contains(x, y) ||
          Phaser.Math.Distance.Between(x, y, s.x, s.sprite.y) <= 58),
    );
  }

  eligible(state: GameSave, region: RegionId): CreatureDef[] {
    return this.creatures.filter((c) => {
      if (c.region !== region) return false;
      const h = state.helpers.find((x) => x.id === c.helperId);
      return (h?.amountOwned ?? 0) > 0;
    });
  }

  /** Queue a spawn when below the active traffic cap. */
  schedule(
    state: GameSave,
    opts: { delay?: number; creatureId?: string | null; forceVessel?: boolean } = {},
  ): void {
    if (!opts.forceVessel && this.spawned.length + this.pending.length >= MAX_CREATURES) {
      return;
    }
    const pool = this.eligible(state, state.region);
    if (!pool.length && !opts.creatureId) return;
    this.pending.push({
      delay: opts.delay ?? 0.35 + Math.random() * 0.9,
      creatureId: opts.creatureId ?? null,
      forceVessel: opts.forceVessel,
    });
  }

  /** Passive helper tick: schedule one spawn per owned region-valid helper group. */
  onPassiveTick(state: GameSave): void {
    for (const h of state.helpers) {
      if (h.amountOwned <= 0) continue;
      const def = this.creatures.find((c) => c.helperId === h.id);
      if (!def || def.region !== state.region) continue;
      this.schedule(state, {
        delay: 0.4 + Math.random() * 1.1,
        creatureId: def.id,
      });
    }
  }

  /**
   * Called on a manual ground cast:
   * 1. Plants a Bloom Rune Pad that detonates when a running creature bounds over it.
   * 2. On Arcane Surge (10th combo tap, unlocked at Ch 2 / manaLevel >= 2 or during Blessing),
   *    chains golden lightning to ALL active creatures (and strikes twice / fully cleanses at Ch 4 / manaLevel >= 4).
   * 3. Otherwise snaps a proximity arc to the nearest healthy runner within range.
   */
  onGroundCast(state: GameSave, x: number, y: number, overcharge = false): void {
    if (!this.scene) return;

    const bloom: ActiveBloom = {
      x,
      y,
      consumed: false,
      graphic: spawnBloomFlower(this.scene, x, y, 3500, () => {
        this.blooms = this.blooms.filter((b) => b !== bloom);
      }),
    };
    this.blooms.push(bloom);

    const canChainSurge = state.manaLevel >= 2 || state.buffRemaining > 0;

    if (overcharge && canChainSurge) {
      this.triggerArcaneSurge(state, x, y);
      return;
    }

    let closest: Spawned | null = null;
    let bestDist = PROXIMITY_ARC_RADIUS;
    for (const s of this.spawned) {
      if (s.blighted || s.vessel || s.resonating || s.done) continue;
      const d = Phaser.Math.Distance.Between(x, y, s.x, s.sprite.y);
      if (d <= bestDist) {
        bestDist = d;
        closest = s;
      }
    }

    if (closest) {
      playLeylineArc(this.scene, x, y, closest.x, closest.sprite.y, 0x34d399);
      this.enterResonance(closest);
      this.onResonanceOrb?.(closest.x, closest.sprite.y);
    }
  }

  triggerArcaneSurge(state: GameSave, x: number, y: number): void {
    if (!this.scene) return;
    const canChainSurge = state.manaLevel >= 2 || state.buffRemaining > 0;
    if (!canChainSurge) return;
    const twinStorm = state.manaLevel >= 4;
    for (const s of this.spawned) {
      if (s.done) continue;
      playLeylineArc(this.scene, x, y, s.x, s.sprite.y, 0xfbbf24);
      if (twinStorm) {
        playLeylineArc(this.scene, x, y - 8, s.x, s.sprite.y + 8, 0x34d399);
      }
      if (s.blighted) {
        this.crackBlightShield(s, twinStorm ? 3 : 1);
        this.onResonanceOrb?.(s.x, s.sprite.y);
      } else if (s.vessel) {
        this.onResonanceOrb?.(s.x, s.sprite.y);
        if (twinStorm) this.onResonanceOrb?.(s.x, s.sprite.y);
      } else {
        this.enterResonance(s);
        this.onResonanceOrb?.(s.x, s.sprite.y);
        if (twinStorm) this.onResonanceOrb?.(s.x, s.sprite.y);
      }
    }
  }

  private crackBlightShield(s: Spawned, amount = 1, checkWeave = true): boolean {
    s.shieldPips = Math.max(0, s.shieldPips - amount);
    s.blightedAura.setPips(s.shieldPips);
    if (s.shieldPips <= 0) {
      s.blighted = false;
      s.blightedAura.container.setVisible(false);
      s.sprite.clearTint();
      this.enterResonance(s, checkWeave);
      return true;
    }
    return false;
  }

  private dodgeVessel(s: Spawned): boolean {
    s.shieldPips = Math.max(0, s.shieldPips - 1);
    s.vesselAura.setPips(s.shieldPips);
    if (s.shieldPips <= 0) {
      s.vessel = false;
      s.vesselAura.container.setVisible(false);
      s.sprite.clearTint();
      this.enterResonance(s);
      return true;
    }

    // Evasive vertical bound + forward surge so the player must track its leap
    const minY = this.lastBounds.y + 52;
    const maxY = this.lastBounds.y + Math.max(60, this.lastBounds.h - 56);
    const jump = (Math.random() < 0.5 ? -1 : 1) * Phaser.Math.Between(65, 95);
    let nextY = s.baseY + jump;
    if (nextY < minY || nextY > maxY) {
      nextY = Phaser.Math.Clamp(s.baseY - jump, minY, maxY);
    }
    s.x = Phaser.Math.Clamp(
      s.x + s.dir * 26,
      this.lastBounds.x + 36,
      this.lastBounds.x + this.lastBounds.w - 36,
    );
    if (this.scene) {
      this.scene.tweens.killTweensOf(s);
      s.hopY = 0;
      this.scene.tweens.add({
        targets: s,
        baseY: nextY,
        duration: 150,
        ease: 'Back.easeOut',
      });
    } else {
      s.baseY = nextY;
    }
    return false;
  }

  private enterResonance(s: Spawned, checkWeave = true): void {
    if (s.resonating) return;
    s.resonating = true;
    s.resonanceOrbAcc = RESONANCE_TICK_INTERVAL - 0.2;
    s.magicAura.setVisible(true);
    if (checkWeave) this.checkGreatWeave();
  }

  /**
   * The Great Weave (Level 1+):
   * When 3 running creatures are resonating simultaneously, snaps a golden triangle between them
   * and arcs to any other nearby creatures in the valley!
   */
  private checkGreatWeave(): void {
    if (!this.scene) return;
    const active = this.spawned.filter(
      (s) => s.resonating && !s.done && !s.countedInConvergence,
    );
    if (active.length < 3) return;

    const trio = active.slice(0, 3);
    for (const s of trio) s.countedInConvergence = true;

    playLeylineArc(this.scene, trio[0].x, trio[0].sprite.y, trio[1].x, trio[1].sprite.y, 0xfbbf24);
    playLeylineArc(this.scene, trio[1].x, trio[1].sprite.y, trio[2].x, trio[2].sprite.y, 0xfbbf24);
    playLeylineArc(this.scene, trio[2].x, trio[2].sprite.y, trio[0].x, trio[0].sprite.y, 0xfbbf24);

    const cx = (trio[0].x + trio[1].x + trio[2].x) / 3;
    const cy = (trio[0].sprite.y + trio[1].sprite.y + trio[2].sprite.y) / 3;

    // Also zap any other creatures around the weave triangle
    for (const other of this.spawned) {
      if (other.done || trio.includes(other)) continue;
      playLeylineArc(this.scene, cx, cy, other.x, other.sprite.y, 0x34d399);
      if (other.blighted) {
        this.crackBlightShield(other, 1, false);
      } else if (!other.vessel && !other.resonating) {
        other.resonating = true;
        other.resonanceOrbAcc = RESONANCE_TICK_INTERVAL - 0.2;
        other.magicAura.setVisible(true);
      }
    }

    this.onConvergence?.(cx, cy);
  }

  tick(
    state: GameSave,
    dt: number,
    bounds: { x: number; y: number; w: number; h: number },
  ): void {
    if (!this.scene) return;
    this.lastBounds = bounds;

    for (const p of this.pending) p.delay -= dt;
    const ready = this.pending.filter((p) => p.delay <= 0);
    this.pending = this.pending.filter((p) => p.delay > 0);
    for (const p of ready) this.spawnOne(state, bounds, p.creatureId, p.forceVessel);

    for (const s of this.spawned) {
      s.age += dt;
      const runMult = s.resonating ? 1.18 : 1;
      s.x += s.dir * s.speed * runMult * dt;
      s.sprite.x = s.x;
      s.sprite.y =
        s.baseY +
        s.hopY +
        Math.sin(s.age * (s.vessel ? 7.5 : 5.5)) * (s.vessel ? 6 : 4);
      s.magicAura.setPosition(s.sprite.x, s.sprite.y);
      s.blightedAura.container.setPosition(s.sprite.x, s.sprite.y);
      s.vesselAura.container.setPosition(s.sprite.x, s.sprite.y);

      // Check if running creature bounds over an active Bloom Rune Pad
      for (const b of this.blooms) {
        if (b.consumed) continue;
        if (Phaser.Math.Distance.Between(s.x, s.sprite.y, b.x, b.y) <= BLOOM_PAD_RADIUS) {
          if (s.blighted) {
            b.consumed = true;
            b.graphic.destroy();
            this.crackBlightShield(s, 1);
            this.onResonanceOrb?.(s.x, s.sprite.y);
            break;
          } else if (!s.vessel && !s.resonating) {
            b.consumed = true;
            b.graphic.destroy();
            this.enterResonance(s);
            this.onResonanceOrb?.(s.x, s.sprite.y);
            break;
          }
        }
      }

      if (s.resonating) {
        s.resonanceOrbAcc += dt;
        while (s.resonanceOrbAcc >= RESONANCE_TICK_INTERVAL) {
          s.resonanceOrbAcc -= RESONANCE_TICK_INTERVAL;
          this.onResonanceOrb?.(s.x, s.sprite.y);
        }
      }

      if (
        (s.dir > 0 && s.x > bounds.x + bounds.w + 48) ||
        (s.dir < 0 && s.x < bounds.x - 48)
      ) {
        s.done = true;
      }
    }

    this.blooms = this.blooms.filter((b) => !b.consumed);
    this.spawned = this.spawned.filter((s) => {
      if (s.done) {
        s.sprite.destroy();
        s.magicAura.destroy();
        s.blightedAura.container.destroy();
        s.vesselAura.container.destroy();
        return false;
      }
      return true;
    });
  }

  private spawnOne(
    state: GameSave,
    bounds: { x: number; y: number; w: number; h: number },
    creatureId: string | null,
    forceVessel = false,
  ): void {
    if (!this.scene) return;
    if (!forceVessel && this.spawned.length >= MAX_CREATURES) return;

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

    const isVessel =
      (forceVessel || (state.manaLevel >= 3 && Math.random() < 0.08)) &&
      !this.hasVessel();
    const canBlight = !isVessel && state.tutorialCompleted && !this.hasBlighted();
    const isBlighted = canBlight && Math.random() < economy.blightedSpawnChance;

    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const startX = dir > 0 ? bounds.x - 40 : bounds.x + bounds.w + 40;
    const span = bounds.w + 80;
    const transitSeconds = isBlighted
      ? Phaser.Math.FloatBetween(4.8, 5.8)
      : isVessel
        ? Phaser.Math.FloatBetween(3.6, 4.2)
        : Phaser.Math.FloatBetween(3.4, 4.4);
    const speed = span / transitSeconds;
    const baseY =
      bounds.y + 52 + Math.random() * Math.max(40, bounds.h - 108);

    const sprite = this.scene.add
      .sprite(startX, baseY, texKey(pick.id), `${pick.id}-0`)
      .setOrigin(0.5, 0.5)
      .setFlipX(dir < 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);
    const baseScale = Math.min(96 / sprite.width, 72 / sprite.height);
    sprite.setScale(isVessel ? baseScale * 1.15 : baseScale);
    sprite.play(runKey);

    const magicAura = makeMagicAura(this.scene).setPosition(startX, baseY);
    const blightedAura = makeBlightedAura(this.scene);
    blightedAura.container.setPosition(startX, baseY);
    const vesselAura = makeVesselAura(this.scene);
    vesselAura.container.setPosition(startX, baseY);

    if (isVessel) {
      sprite.setTint(0xfde047);
      vesselAura.container.setVisible(true);
      vesselAura.setPips(3);
    } else if (isBlighted) {
      sprite.setTint(0xc084fc);
      blightedAura.container.setVisible(true);
      blightedAura.setPips(3);
    }

    const entry: Spawned = {
      sprite,
      magicAura,
      blightedAura,
      vesselAura,
      creatureId: pick.id,
      resonating: false,
      resonanceOrbAcc: 0,
      countedInConvergence: false,
      blighted: isBlighted,
      vessel: isVessel,
      shieldPips: isBlighted || isVessel ? 3 : 0,
      done: false,
      age: 0,
      x: startX,
      baseY,
      hopY: 0,
      dir,
      speed,
    };

    const tap = () => {
      if (entry.done) return;
      this.onTap?.({
        sprite,
        blighted: entry.blighted,
        vessel: entry.vessel,
        shieldPips: entry.shieldPips,
        resonating: entry.resonating,
        applyTap: () => {
          if (entry.vessel) {
            const extracted = this.dodgeVessel(entry);
            return { purified: extracted, enteredResonance: extracted };
          }

          if (this.scene) {
            this.scene.tweens.killTweensOf(entry);
            this.scene.tweens.add({
              targets: entry,
              hopY: { from: -16, to: 0 },
              duration: 180,
              ease: 'Quad.easeOut',
            });
          }

          if (entry.blighted) {
            const purified = this.crackBlightShield(entry, 1);
            return { purified, enteredResonance: purified };
          }

          if (!entry.resonating) {
            this.enterResonance(entry);
            return { purified: false, enteredResonance: true };
          }
          return { purified: false, enteredResonance: false };
        },
      });
    };

    sprite.on('pointerdown', tap);
    magicAura
      .setInteractive(new Phaser.Geom.Circle(0, 0, 58), Phaser.Geom.Circle.Contains)
      .on('pointerdown', tap);
    magicAura.input!.cursor = 'pointer';
    blightedAura.container
      .setInteractive(new Phaser.Geom.Circle(0, 0, 58), Phaser.Geom.Circle.Contains)
      .on('pointerdown', tap);
    blightedAura.container.input!.cursor = 'pointer';
    vesselAura.container
      .setInteractive(new Phaser.Geom.Circle(0, 0, 58), Phaser.Geom.Circle.Contains)
      .on('pointerdown', tap);
    vesselAura.container.input!.cursor = 'pointer';

    this.spawned.push(entry);
  }
}
