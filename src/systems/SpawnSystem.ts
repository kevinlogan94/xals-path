import Phaser from 'phaser';
import type { CreatureDef, CreatureVariant, GameSave, RegionId } from '../types';
import creaturesData from '../data/creatures.json';
import economy from '../data/economy.json';
import {
  makeMagicAura,
  makeShieldAura,
  playLeylineArc,
  spawnBloomFlower,
  type ShieldAuraHandle,
} from '../scenes/play/outlook/creatureMagic';
import { ensureRunAnim, texKey } from '../scenes/play/splash/creatureSplash';

type FrenzyVariant = 'volatile' | 'phasing' | 'siphon';

interface Spawned {
  sprite: Phaser.GameObjects.Sprite;
  magicAura: Phaser.GameObjects.Container;
  shieldAura: ShieldAuraHandle | null;
  creatureId: string;
  resonating: boolean;
  resonanceOrbAcc: number;
  countedInConvergence: boolean;
  variant: CreatureVariant | null;
  phasedOut: boolean;
  siphonAcc: number;
  encounterTriggered: boolean;
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
  variant: CreatureVariant | null;
  phasedOut: boolean;
  shieldPips: number;
  resonating: boolean;
  applyTap: () => void;
}

const MAX_CREATURES = 6;
const RESONANCE_TICK_INTERVAL = 0.55;
const BLOOM_PAD_RADIUS = 72;
const PROXIMITY_ARC_RADIUS = 135;
const VOLATILE_GRACE_SECONDS = 0.6;
const SIPHON_SNUFF_INTERVAL = 0.9;

const VARIANT_TINT: Record<CreatureVariant, number> = {
  blighted: 0xc084fc,
  vessel: 0xfde047,
  volatile: 0xfca5a5,
  phasing: 0x7dd3fc,
  siphon: 0x5eead4,
};

const VARIANT_PIPS: Record<CreatureVariant, number> = {
  blighted: 3,
  vessel: 3,
  volatile: 0,
  phasing: 2,
  siphon: 2,
};

function isFrenzyVariant(v: CreatureVariant | null): v is FrenzyVariant {
  return v === 'volatile' || v === 'phasing' || v === 'siphon';
}

/**
 * Fast-paced continuous creature stream on Outlook:
 * - Lvl 1+: Creatures run across (3.4-4.4s), glow when cleansed, trigger spell flowers,
 *   and link 3 glowing creatures into a Triad Burst.
 * - Ch 2+ (manaLevel >= 2): 10th-spell Arcane Surge chains lightning to classic creatures.
 * - Ch 3+ (manaLevel >= 3): 25-spell streak summons an evasive Golden Creature (dodges on tap).
 * - Ch 4+ (manaLevel >= 4): Twin Arcane Surge strikes twice and instantly cleanses Corrupted creatures.
 * - Lvl 12/15/17+: Split-slot Frenzy threats (Unstable, Phantom, Leech) fuel Wild Frenzy.
 */
export class SpawnSystem {
  readonly creatures: CreatureDef[] = creaturesData.creatures as CreatureDef[];
  private spawned: Spawned[] = [];
  private pending: PendingSpawn[] = [];
  private blooms: ActiveBloom[] = [];
  private timeSinceLastFrenzySpawn = 0;
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
  private onVariantTrap:
    | ((variant: 'volatile', x: number, y: number, stacks: number) => void)
    | null = null;
  private onSiphonDrain: ((dt: number) => void) | null = null;
  private onFirstEncounter:
    | ((variant: CreatureVariant, creatureId: string) => void)
    | null = null;

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

  setVariantTrapHandler(handler: NonNullable<SpawnSystem['onVariantTrap']>): void {
    this.onVariantTrap = handler;
  }

  setSiphonDrainHandler(handler: NonNullable<SpawnSystem['onSiphonDrain']>): void {
    this.onSiphonDrain = handler;
  }

  setFirstEncounterHandler(
    handler: NonNullable<SpawnSystem['onFirstEncounter']>,
  ): void {
    this.onFirstEncounter = handler;
  }

  hasVariant(v: CreatureVariant): boolean {
    return this.spawned.some((s) => !s.done && s.variant === v);
  }

  activeFrenzyVariant(): FrenzyVariant | null {
    for (const s of this.spawned) {
      if (!s.done && isFrenzyVariant(s.variant)) return s.variant;
    }
    return null;
  }

  hasClassicVariant(): boolean {
    return this.spawned.some(
      (s) => !s.done && (s.variant === 'blighted' || s.variant === 'vessel'),
    );
  }

  hasFrenzyVariant(): boolean {
    return this.activeFrenzyVariant() !== null;
  }

  hasActiveOrPending(): boolean {
    return this.spawned.length > 0 || this.pending.length > 0;
  }

  clear(): void {
    for (const s of this.spawned) {
      s.sprite.destroy();
      s.magicAura.destroy();
      s.shieldAura?.container.destroy();
    }
    for (const b of this.blooms) {
      b.graphic.destroy();
    }
    this.spawned = [];
    this.pending = [];
    this.blooms = [];
    this.timeSinceLastFrenzySpawn = 0;
  }

  hits(x: number, y: number): boolean {
    return this.spawned.some((s) => {
      if (s.done) return false;
      if (s.variant === 'volatile') {
        if (s.age < VOLATILE_GRACE_SECONDS) return false;
        return Phaser.Math.Distance.Between(x, y, s.x, s.sprite.y) <= 44;
      }
      return (
        s.sprite.getBounds().contains(x, y) ||
        Phaser.Math.Distance.Between(x, y, s.x, s.sprite.y) <= 58
      );
    });
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
   * 1. Plants a spell flower that triggers when a running creature bounds over it.
   * 2. On Arcane Surge (10th combo tap, unlocked at Ch 2 / manaLevel >= 2 or during Sky's Grace),
   *    chains golden lightning to classic creatures (Frenzy threats resist or absorb it).
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
      if (s.variant !== null || s.resonating || s.done) continue;
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
      if (s.variant === 'volatile' || s.variant === 'phasing') continue;
      if (s.variant === 'siphon') {
        playLeylineArc(this.scene, x, y, s.x, s.sprite.y, 0x14b8a6);
        continue;
      }
      playLeylineArc(this.scene, x, y, s.x, s.sprite.y, 0xfbbf24);
      if (twinStorm) {
        playLeylineArc(this.scene, x, y - 8, s.x, s.sprite.y + 8, 0x34d399);
      }
      if (s.variant === 'blighted') {
        this.crackShield(s, twinStorm ? 3 : 1);
        this.onResonanceOrb?.(s.x, s.sprite.y);
      } else if (s.variant === 'vessel') {
        this.onResonanceOrb?.(s.x, s.sprite.y);
        if (twinStorm) this.onResonanceOrb?.(s.x, s.sprite.y);
      } else {
        this.enterResonance(s);
        this.onResonanceOrb?.(s.x, s.sprite.y);
        if (twinStorm) this.onResonanceOrb?.(s.x, s.sprite.y);
      }
    }
  }

  private clearVariantState(s: Spawned, checkWeave = true): void {
    s.variant = null;
    s.phasedOut = false;
    s.shieldPips = 0;
    s.sprite.setAlpha(1);
    s.sprite.clearTint();
    s.sprite.setDepth(5);
    s.shieldAura?.container.setAlpha(1);
    s.shieldAura?.container.setVisible(false);
    this.enterResonance(s, checkWeave);
  }

  private crackShield(s: Spawned, amount = 1, checkWeave = true): void {
    s.shieldPips = Math.max(0, s.shieldPips - amount);
    s.shieldAura?.setPips(s.shieldPips);
    if (s.shieldPips <= 0) {
      this.clearVariantState(s, checkWeave);
    }
  }

  private dodgeVessel(s: Spawned): void {
    s.shieldPips = Math.max(0, s.shieldPips - 1);
    s.shieldAura?.setPips(s.shieldPips);
    if (s.shieldPips <= 0) {
      this.clearVariantState(s);
      return;
    }

    // Evasive vertical bound + forward surge; steer away from any active volatile
    const minY = this.lastBounds.y + 52;
    const maxY = this.lastBounds.y + Math.max(60, this.lastBounds.h - 56);
    const dist = Phaser.Math.Between(65, 95);
    const volatile = this.spawned.find(
      (other) => !other.done && other.variant === 'volatile',
    );
    let dirSign: 1 | -1;
    if (volatile) {
      const upY = s.baseY - dist;
      const downY = s.baseY + dist;
      const upValid = upY >= minY && upY <= maxY;
      const downValid = downY >= minY && downY <= maxY;
      const upGap = Math.abs(upY - volatile.baseY);
      const downGap = Math.abs(downY - volatile.baseY);
      if (upValid && downValid) dirSign = upGap >= downGap ? -1 : 1;
      else if (upValid) dirSign = -1;
      else if (downValid) dirSign = 1;
      else dirSign = upGap >= downGap ? -1 : 1;
    } else {
      dirSign = Math.random() < 0.5 ? -1 : 1;
    }

    const jump = dirSign * dist;
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
  }

  private enterResonance(s: Spawned, checkWeave = true): void {
    if (s.resonating) return;
    s.resonating = true;
    s.resonanceOrbAcc = RESONANCE_TICK_INTERVAL - 0.2;
    s.magicAura.setVisible(true);
    if (checkWeave) this.checkGreatWeave();
  }

  /**
   * Triad Burst (Level 1+):
   * When 3 running creatures are glowing simultaneously, snaps a golden triangle between them
   * and arcs to nearby classic creatures in the valley.
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

    for (const other of this.spawned) {
      if (other.done || trio.includes(other) || isFrenzyVariant(other.variant)) continue;
      playLeylineArc(this.scene, cx, cy, other.x, other.sprite.y, 0x34d399);
      if (other.variant === 'blighted') {
        this.crackShield(other, 1, false);
      } else if (other.variant !== 'vessel') {
        this.enterResonance(other, false);
      }
    }

    this.onConvergence?.(cx, cy);
  }

  private snuffNearestResonating(siphon: Spawned): void {
    if (!this.scene) return;
    let target: Spawned | null = null;
    let bestDist = Infinity;
    for (const other of this.spawned) {
      if (other.done || !other.resonating || other === siphon) continue;
      const d = Phaser.Math.Distance.Between(
        siphon.x,
        siphon.sprite.y,
        other.x,
        other.sprite.y,
      );
      if (d < bestDist) {
        bestDist = d;
        target = other;
      }
    }
    if (!target) return;
    playLeylineArc(
      this.scene,
      siphon.x,
      siphon.sprite.y,
      target.x,
      target.sprite.y,
      0x14b8a6,
    );
    target.resonating = false;
    target.magicAura.setVisible(false);
    target.countedInConvergence = false;
  }

  tick(
    state: GameSave,
    dt: number,
    bounds: { x: number; y: number; w: number; h: number },
  ): void {
    if (!this.scene) return;
    this.lastBounds = bounds;

    if (
      state.playerLevel >= economy.volatileUnlockLevel &&
      !this.hasFrenzyVariant()
    ) {
      this.timeSinceLastFrenzySpawn += dt;
    }

    for (const p of this.pending) p.delay -= dt;
    const ready = this.pending.filter((p) => p.delay <= 0);
    this.pending = this.pending.filter((p) => p.delay > 0);
    for (const p of ready) this.spawnOne(state, bounds, p.creatureId, p.forceVessel);

    for (const s of this.spawned) {
      if (s.done) continue;
      s.age += dt;
      const runMult = s.resonating ? 1.18 : 1;
      s.x += s.dir * s.speed * runMult * dt;
      const isVessel = s.variant === 'vessel';
      s.sprite.x = s.x;
      s.sprite.y =
        s.baseY +
        s.hopY +
        Math.sin(s.age * (isVessel ? 7.5 : 5.5)) * (isVessel ? 6 : 4);
      s.magicAura.setPosition(s.sprite.x, s.sprite.y);
      s.shieldAura?.container.setPosition(s.sprite.x, s.sprite.y);

      if (s.variant === 'phasing') {
        s.phasedOut = s.age % 2.4 >= 1.35;
        s.sprite.setAlpha(s.phasedOut ? 0.26 : 1);
        s.shieldAura?.container.setAlpha(s.phasedOut ? 0.22 : 1);
      } else if (s.variant === 'siphon') {
        this.onSiphonDrain?.(dt);
        s.siphonAcc += dt;
        while (s.siphonAcc >= SIPHON_SNUFF_INTERVAL) {
          s.siphonAcc -= SIPHON_SNUFF_INTERVAL;
          this.snuffNearestResonating(s);
        }
      }

      // Check if running creature bounds over an active spell flower
      for (const b of this.blooms) {
        if (b.consumed) continue;
        if (Phaser.Math.Distance.Between(s.x, s.sprite.y, b.x, b.y) <= BLOOM_PAD_RADIUS) {
          if (s.variant === 'volatile') {
            b.consumed = true;
            b.graphic.destroy();
            this.clearVariantState(s);
            this.onVariantTrap?.('volatile', s.x, s.sprite.y, 1);
            break;
          } else if (s.variant === 'siphon') {
            b.consumed = true;
            b.graphic.destroy();
            playLeylineArc(this.scene, b.x, b.y, s.x, s.sprite.y, 0x14b8a6);
            break;
          } else if (s.variant === 'blighted') {
            b.consumed = true;
            b.graphic.destroy();
            this.crackShield(s, 1);
            this.onResonanceOrb?.(s.x, s.sprite.y);
            break;
          } else if (s.variant === null && !s.resonating) {
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
        s.shieldAura?.container.destroy();
        return false;
      }
      return true;
    });

    // Trigger at most one first-encounter modal per tick once visibly inside bounds
    for (const s of this.spawned) {
      if (
        s.variant === null ||
        s.encounterTriggered ||
        state.seenVariants.includes(s.variant)
      ) {
        continue;
      }
      if (s.x >= bounds.x + 56 && s.x <= bounds.x + bounds.w - 56) {
        s.encounterTriggered = true;
        this.onFirstEncounter?.(s.variant, s.creatureId);
        break;
      }
    }
  }

  private pickVariant(
    state: GameSave,
    forceVessel: boolean,
  ): CreatureVariant | null {
    if (forceVessel && !this.hasVariant('vessel')) {
      return 'vessel';
    }
    if (
      state.playerLevel >= economy.volatileUnlockLevel &&
      !this.hasFrenzyVariant()
    ) {
      const chance =
        state.playerLevel >= economy.siphonUnlockLevel
          ? economy.frenzySpawnChanceL17
          : state.playerLevel >= economy.phasingUnlockLevel
            ? economy.frenzySpawnChanceL15
            : economy.frenzySpawnChanceL12;
      if (
        this.timeSinceLastFrenzySpawn >= economy.frenzyPitySeconds ||
        Math.random() < chance
      ) {
        const pool: FrenzyVariant[] = ['volatile'];
        if (state.playerLevel >= economy.phasingUnlockLevel) pool.push('phasing');
        if (state.playerLevel >= economy.siphonUnlockLevel) pool.push('siphon');
        this.timeSinceLastFrenzySpawn = 0;
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
    if (!this.hasClassicVariant()) {
      if (state.manaLevel >= 3 && Math.random() < 0.08) {
        return 'vessel';
      }
      if (state.tutorialCompleted && Math.random() < economy.blightedSpawnChance) {
        return 'blighted';
      }
    }
    return null;
  }

  private pickBaseY(
    bounds: { x: number; y: number; w: number; h: number },
    variant: CreatureVariant | null,
  ): number {
    const minY = bounds.y + 52;
    const spanY = Math.max(40, bounds.h - 108);
    const randomY = () => minY + Math.random() * spanY;
    if (variant === null) return randomY();

    const specials = this.spawned.filter((s) => !s.done && s.variant !== null);
    if (specials.length === 0) return randomY();

    let bestY = randomY();
    let bestMinDist = -1;
    for (let i = 0; i < 5; i++) {
      const cand = i === 0 ? bestY : randomY();
      const minDist = Math.min(...specials.map((s) => Math.abs(cand - s.baseY)));
      if (minDist >= 120) return cand;
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestY = cand;
      }
    }
    return bestY;
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

    const variant = this.pickVariant(state, forceVessel);
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const startX = dir > 0 ? bounds.x - 40 : bounds.x + bounds.w + 40;
    const span = bounds.w + 80;
    const transitSeconds =
      variant === 'blighted'
        ? Phaser.Math.FloatBetween(4.8, 5.8)
        : variant === 'vessel'
          ? Phaser.Math.FloatBetween(3.6, 4.2)
          : variant === 'volatile'
            ? Phaser.Math.FloatBetween(4.2, 5.0)
            : variant === 'phasing'
              ? Phaser.Math.FloatBetween(4.4, 5.2)
              : variant === 'siphon'
                ? Phaser.Math.FloatBetween(3.0, 3.6)
                : Phaser.Math.FloatBetween(3.4, 4.4);
    const speed = span / transitSeconds;
    const baseY = this.pickBaseY(bounds, variant);

    const sprite = this.scene.add
      .sprite(startX, baseY, texKey(pick.id), `${pick.id}-0`)
      .setOrigin(0.5, 0.5)
      .setFlipX(dir < 0)
      .setDepth(variant === 'volatile' ? 4 : 5);
    const baseScale = Math.min(96 / sprite.width, 72 / sprite.height);
    const finalScale = variant === 'vessel' ? baseScale * 1.15 : baseScale;
    sprite.setScale(finalScale);
    const hitRadius = (variant === 'volatile' ? 44 : 58) / finalScale;
    sprite.setInteractive(
      new Phaser.Geom.Circle(sprite.width / 2, sprite.height / 2, hitRadius),
      Phaser.Geom.Circle.Contains,
    );
    sprite.input!.cursor = 'pointer';
    sprite.play(runKey);

    const magicAura = makeMagicAura(this.scene).setPosition(startX, baseY);
    let shieldAura: ShieldAuraHandle | null = null;

    if (variant !== null) {
      sprite.setTint(VARIANT_TINT[variant]);
      shieldAura = makeShieldAura(this.scene, variant);
      shieldAura.container.setPosition(startX, baseY);
    }

    const entry: Spawned = {
      sprite,
      magicAura,
      shieldAura,
      creatureId: pick.id,
      resonating: false,
      resonanceOrbAcc: 0,
      countedInConvergence: false,
      variant,
      phasedOut: false,
      siphonAcc: 0,
      encounterTriggered: false,
      shieldPips: variant !== null ? VARIANT_PIPS[variant] : 0,
      done: false,
      age: 0,
      x: startX,
      baseY,
      hopY: 0,
      dir,
      speed,
    };

    sprite.on('pointerdown', () => {
      if (entry.done) return;
      if (entry.variant === 'volatile' && entry.age < VOLATILE_GRACE_SECONDS) {
        return;
      }
      this.onTap?.({
        sprite,
        variant: entry.variant,
        phasedOut: entry.phasedOut,
        shieldPips: entry.shieldPips,
        resonating: entry.resonating,
        applyTap: () => {
          if (entry.variant === 'volatile') {
            entry.done = true;
            entry.sprite.setVisible(false);
            entry.magicAura.setVisible(false);
            entry.shieldAura?.container.setVisible(false);
            return;
          }
          if (entry.variant === 'vessel') {
            this.dodgeVessel(entry);
            return;
          }
          if (entry.variant === 'phasing' && entry.phasedOut) {
            return;
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
          if (
            entry.variant === 'blighted' ||
            entry.variant === 'phasing' ||
            entry.variant === 'siphon'
          ) {
            this.crackShield(entry, 1);
          } else if (!entry.resonating) {
            this.enterResonance(entry);
          }
        },
      });
    });

    this.spawned.push(entry);
  }
}
