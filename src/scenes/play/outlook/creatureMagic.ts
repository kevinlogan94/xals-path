import Phaser from 'phaser';

const DARK_BACKING = 0x050407;
const EMERALD = 0x34d399;
const AMBER = 0xfbbf24;
const CYAN = 0x38bdf8;
const PALE_CYAN = 0xbae6fd;
const VIOLET = 0xa855f7;
const PALE_VIOLET = 0xe9d5ff;

function strokeOctagonRune(
  g: Phaser.GameObjects.Graphics,
  r: number,
  width: number,
  color: number,
  alpha: number,
): void {
  const d = r * Math.SQRT1_2;
  g.lineStyle(width, color, alpha);
  g.strokePoints(
    [
      new Phaser.Geom.Point(0, -r),
      new Phaser.Geom.Point(r, 0),
      new Phaser.Geom.Point(0, r),
      new Phaser.Geom.Point(-r, 0),
    ],
    true,
  );
  g.strokePoints(
    [
      new Phaser.Geom.Point(-d, -d),
      new Phaser.Geom.Point(d, -d),
      new Phaser.Geom.Point(d, d),
      new Phaser.Geom.Point(-d, d),
    ],
    true,
  );
}

/** Persistent rotating Blighted Scroll sigil attached to a resonating creature. */
export function makeMagicAura(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const backing = scene.add.graphics();
  backing.fillStyle(DARK_BACKING, 0.72);
  backing.fillCircle(0, 0, 56);
  backing.lineStyle(2.5, EMERALD, 0.85);
  backing.strokeCircle(0, 0, 52);

  const outerRune = scene.add.graphics();
  strokeOctagonRune(outerRune, 48, 6, DARK_BACKING, 0.8);
  strokeOctagonRune(outerRune, 48, 2.5, AMBER, 0.98);

  const innerCore = scene.add.graphics();
  innerCore.fillStyle(EMERALD, 0.45);
  innerCore.fillCircle(0, 0, 22);
  innerCore.fillStyle(PALE_CYAN, 0.92);
  innerCore.fillPoints(
    [
      new Phaser.Geom.Point(0, -13),
      new Phaser.Geom.Point(13, 0),
      new Phaser.Geom.Point(0, 13),
      new Phaser.Geom.Point(-13, 0),
    ],
    true,
  );

  const container = scene.add
    .container(0, 0, [backing, outerRune, innerCore])
    .setDepth(6)
    .setVisible(false);

  scene.tweens.add({
    targets: outerRune,
    angle: 360,
    duration: 2800,
    repeat: -1,
  });
  scene.tweens.add({
    targets: innerCore,
    scale: { from: 0.85, to: 1.2 },
    angle: -180,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  container.once('destroy', () => {
    scene.tweens.killTweensOf([outerRune, innerCore]);
  });

  return container;
}

export interface BlightedAuraHandle {
  container: Phaser.GameObjects.Container;
  setPips: (remaining: number) => void;
}

/** Purple miasma shroud + 3-pip shield indicator for Blighted Beasts. */
export function makeBlightedAura(scene: Phaser.Scene): BlightedAuraHandle {
  const backing = scene.add.graphics();
  backing.fillStyle(DARK_BACKING, 0.76);
  backing.fillCircle(0, 0, 56);
  backing.lineStyle(3, VIOLET, 0.92);
  backing.strokeCircle(0, 0, 50);

  const rune = scene.add.graphics();
  strokeOctagonRune(rune, 46, 6, DARK_BACKING, 0.85);
  strokeOctagonRune(rune, 46, 2.5, VIOLET, 0.95);

  const pips = scene.add.graphics();
  const drawPips = (remaining: number) => {
    pips.clear();
    const xs = [-18, 0, 18];
    const y = -56;
    for (let i = 0; i < 3; i++) {
      const active = i < remaining;
      pips.fillStyle(DARK_BACKING, 0.9);
      pips.fillCircle(xs[i], y, 7);
      pips.lineStyle(2, active ? PALE_VIOLET : 0x4b5563, 0.95);
      pips.strokeCircle(xs[i], y, 6);
      if (active) {
        pips.fillStyle(VIOLET, 1);
        pips.fillCircle(xs[i], y, 4.2);
      }
    }
  };
  drawPips(3);

  const container = scene.add
    .container(0, 0, [backing, rune, pips])
    .setDepth(4)
    .setVisible(false);

  scene.tweens.add({
    targets: rune,
    angle: -360,
    duration: 3200,
    repeat: -1,
  });

  container.once('destroy', () => {
    scene.tweens.killTweensOf(rune);
  });

  return { container, setPips: drawPips };
}

/** Radiant golden aura + 3-pip essence indicator for Ancient Vessels (Ch 3+). */
export function makeVesselAura(scene: Phaser.Scene): BlightedAuraHandle {
  const backing = scene.add.graphics();
  backing.fillStyle(DARK_BACKING, 0.72);
  backing.fillCircle(0, 0, 58);
  backing.lineStyle(3, AMBER, 0.96);
  backing.strokeCircle(0, 0, 52);

  const rune = scene.add.graphics();
  strokeOctagonRune(rune, 48, 6, DARK_BACKING, 0.85);
  strokeOctagonRune(rune, 48, 2.8, AMBER, 1);

  const pips = scene.add.graphics();
  const drawPips = (remaining: number) => {
    pips.clear();
    const xs = [-18, 0, 18];
    const y = -58;
    for (let i = 0; i < 3; i++) {
      const active = i < remaining;
      pips.fillStyle(DARK_BACKING, 0.9);
      pips.fillCircle(xs[i], y, 7);
      pips.lineStyle(2, active ? 0xfef08a : 0x4b5563, 0.95);
      pips.strokeCircle(xs[i], y, 6);
      if (active) {
        pips.fillStyle(AMBER, 1);
        pips.fillCircle(xs[i], y, 4.4);
      }
    }
  };
  drawPips(3);

  const container = scene.add
    .container(0, 0, [backing, rune, pips])
    .setDepth(4)
    .setVisible(false);

  scene.tweens.add({
    targets: rune,
    angle: 360,
    duration: 2100,
    repeat: -1,
  });

  container.once('destroy', () => {
    scene.tweens.killTweensOf(rune);
  });

  return { container, setPips: drawPips };
}

/** Sprouts a temporary procedural golden/emerald flower pad on the valley turf. */
export function spawnBloomFlower(
  scene: Phaser.Scene,
  x: number,
  y: number,
  durationMs = 3500,
  onExpire?: () => void,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y }).setDepth(3).setScale(0.2);

  // Subtle ground rune pad ring + emerald leaves
  g.fillStyle(DARK_BACKING, 0.65);
  g.fillCircle(0, 0, 22);
  g.lineStyle(2, EMERALD, 0.75);
  g.strokeCircle(0, 0, 20);
  g.fillStyle(EMERALD, 0.95);
  g.fillEllipse(-8, 4, 11, 6);
  g.fillEllipse(8, 4, 11, 6);

  // 5 Golden petals
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const px = Math.cos(a) * 6.5;
    const py = Math.sin(a) * 6.5 - 2;
    g.fillStyle(DARK_BACKING, 0.9);
    g.fillCircle(px, py, 5);
    g.fillStyle(AMBER, 1);
    g.fillCircle(px, py, 3.8);
  }
  g.fillStyle(PALE_CYAN, 1);
  g.fillCircle(0, -2, 3.2);

  scene.tweens.add({
    targets: g,
    scale: 1,
    duration: 240,
    ease: 'Back.easeOut',
  });

  scene.tweens.add({
    targets: g,
    angle: { from: -6, to: 6 },
    duration: 700,
    yoyo: true,
    repeat: 4,
    ease: 'Sine.easeInOut',
  });

  const timer = scene.time.delayedCall(durationMs, () => {
    onExpire?.();
    if (!g.scene) return;
    scene.tweens.add({
      targets: g,
      scale: 0.2,
      alpha: 0,
      duration: 280,
      ease: 'Quad.easeIn',
      onComplete: () => g.destroy(),
    });
  });

  g.once('destroy', () => {
    timer.remove(false);
    scene.tweens.killTweensOf(g);
  });

  return g;
}

/** Jagged glowing leyline lightning arc between two points. */
export function playLeylineArc(
  scene: Phaser.Scene,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = EMERALD,
): void {
  const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
  if (dist < 12) return;

  const g = scene.add.graphics().setDepth(7);
  const steps = Math.max(4, Math.min(9, Math.floor(dist / 36)));
  const nx = -(y2 - y1) / dist;
  const ny = (x2 - x1) / dist;

  const pts: Phaser.Geom.Point[] = [new Phaser.Geom.Point(x1, y1)];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const jitter = Phaser.Math.FloatBetween(-14, 14);
    pts.push(
      new Phaser.Geom.Point(
        x1 + (x2 - x1) * t + nx * jitter,
        y1 + (y2 - y1) * t + ny * jitter,
      ),
    );
  }
  pts.push(new Phaser.Geom.Point(x2, y2));

  g.lineStyle(6, DARK_BACKING, 0.75);
  g.strokePoints(pts, false);
  g.lineStyle(2.8, color, 0.95);
  g.strokePoints(pts, false);
  g.lineStyle(1.2, PALE_CYAN, 0.9);
  g.strokePoints(pts, false);

  scene.tweens.add({
    targets: g,
    alpha: 0,
    duration: 380,
    ease: 'Quad.easeOut',
    onComplete: () => g.destroy(),
  });
}

/**
 * Visible `ui-influence` crystals that pop above the creature/cast first (so the eye registers them),
 * then swoop along a curve into the top-left HUD Influence icon.
 */
export function spawnHomingOrbs(
  scene: Phaser.Scene,
  startX: number,
  startY: number,
  target: { x: number; y: number },
  count: number,
  onArrive?: () => void,
  _glowColor = EMERALD,
): void {
  for (let i = 0; i < count; i++) {
    const token = scene.add
      .image(startX, startY, 'ui-influence')
      .setDepth(16);
    const baseScale = 22 / Math.max(1, token.width, token.height);
    token.setScale(baseScale * 0.4);

    const hopX = startX + Phaser.Math.FloatBetween(-26, 26);
    const hopY = startY - Phaser.Math.FloatBetween(24, 42);

    // Beat 1: Crisp pop upward so the player clearly sees the Influence icon
    scene.tweens.add({
      targets: token,
      x: hopX,
      y: hopY,
      scale: baseScale,
      delay: i * 55,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (!token.active) return;
        // Beat 2: Swoop along a quadratic curve into the top-left HUD Crystal
        const ctrlX = (hopX + target.x) * 0.5 + Phaser.Math.FloatBetween(-45, 45);
        const ctrlY = Math.min(hopY, target.y) - Phaser.Math.FloatBetween(20, 60);
        const flight = { t: 0 };
        scene.tweens.add({
          targets: flight,
          t: 1,
          duration: Phaser.Math.Between(420, 520),
          ease: 'Cubic.easeIn',
          onUpdate: () => {
            if (!token.active) return;
            const u = 1 - flight.t;
            token.x =
              u * u * hopX +
              2 * u * flight.t * ctrlX +
              flight.t * flight.t * target.x;
            token.y =
              u * u * hopY +
              2 * u * flight.t * ctrlY +
              flight.t * flight.t * target.y;
            token.setScale(baseScale * (1 - flight.t * 0.35));
          },
          onComplete: () => {
            token.destroy();
            onArrive?.();
          },
        });
      },
    });
  }
}

/**
 * Visible pulse on a running resonating creature: expanding emerald ring + floating `+X` text above its back.
 */
export function playResonancePulse(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
): void {
  const ring = scene.add.graphics({ x, y }).setDepth(7);
  const ringState = { r: 18, alpha: 0.9 };
  const draw = () => {
    ring.clear();
    ring.lineStyle(5, DARK_BACKING, ringState.alpha * 0.65);
    ring.strokeCircle(0, 0, ringState.r);
    ring.lineStyle(2.5, EMERALD, ringState.alpha);
    ring.strokeCircle(0, 0, ringState.r);
  };
  draw();
  scene.tweens.add({
    targets: ringState,
    r: 62,
    alpha: 0,
    duration: 360,
    ease: 'Quad.easeOut',
    onUpdate: draw,
    onComplete: () => ring.destroy(),
  });

  const floater = scene.add
    .text(x, y - 34, label, {
      fontFamily: '"JetBrains Mono", monospace',
      fontStyle: 'bold',
      fontSize: '16px',
      color: '#6ee7b7',
      stroke: '#050407',
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setDepth(15)
    .setScale(0.6);

  scene.tweens.add({
    targets: floater,
    scale: 1.15,
    y: y - 46,
    duration: 130,
    ease: 'Back.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: floater,
        y: y - 76,
        alpha: 0,
        duration: 460,
        ease: 'Quad.easeOut',
        onComplete: () => floater.destroy(),
      });
    },
  });
}

export interface CastBurstOptions {
  sublabel?: string;
  overcharge?: boolean;
  purified?: boolean;
}

/** Cast & Creature-Tap: 4-part "Blighted Scroll" procedural VFX + floating text. */
export function playCastBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  opts: CastBurstOptions = {},
): void {
  const primaryColor = opts.purified ? VIOLET : opts.overcharge ? AMBER : EMERALD;

  if (opts.overcharge || opts.purified) {
    scene.cameras.main.shake(110, 0.004);
  }

  // 0. Contrast Dark-Rune Backing + Core Flash
  const flash = scene.add.graphics({ x, y }).setDepth(7).setScale(0.6);
  flash.fillStyle(DARK_BACKING, 0.65);
  flash.fillCircle(0, 0, 60);
  flash.fillStyle(primaryColor, 0.5);
  flash.fillCircle(0, 0, 34);
  flash.fillStyle(PALE_CYAN, 0.95);
  flash.fillPoints(
    [
      new Phaser.Geom.Point(0, -20),
      new Phaser.Geom.Point(20, 0),
      new Phaser.Geom.Point(0, 20),
      new Phaser.Geom.Point(-20, 0),
    ],
    true,
  );
  scene.tweens.add({
    targets: flash,
    scale: opts.overcharge || opts.purified ? 1.7 : 1.4,
    alpha: 0,
    duration: 380,
    ease: 'Quad.easeOut',
    onComplete: () => flash.destroy(),
  });

  // 1. Spinning Ground Rune (0ms – 450ms)
  const rune = scene.add.graphics({ x, y }).setDepth(8).setScale(0.65).setAlpha(1);
  strokeOctagonRune(rune, 52, 7, DARK_BACKING, 0.8);
  strokeOctagonRune(rune, 52, 3, AMBER, 1);
  rune.lineStyle(2, CYAN, 0.9);
  rune.strokeCircle(0, 0, 32);
  scene.tweens.add({
    targets: rune,
    angle: 45,
    scale: opts.overcharge || opts.purified ? 1.55 : 1.3,
    alpha: 0,
    duration: 450,
    ease: 'Cubic.easeOut',
    onComplete: () => rune.destroy(),
  });

  // 2. Druidic Shockwave Ring (0ms – 500ms)
  const ring = scene.add.graphics({ x, y }).setDepth(8);
  const ringState = { radius: 12, alpha: 1, width: 4.5 };
  const drawRing = () => {
    ring.clear();
    ring.lineStyle(ringState.width + 5, DARK_BACKING, ringState.alpha * 0.7);
    ring.strokeCircle(0, 0, ringState.radius);
    ring.lineStyle(ringState.width, primaryColor, ringState.alpha);
    ring.strokeCircle(0, 0, ringState.radius);
  };
  drawRing();
  scene.tweens.add({
    targets: ringState,
    radius: opts.overcharge || opts.purified ? 110 : 85,
    alpha: 0,
    width: 0.8,
    duration: 500,
    ease: 'Quad.easeOut',
    onUpdate: drawRing,
    onComplete: () => ring.destroy(),
  });

  // 3. Rising Mana Spores Burst (0ms – 650ms)
  const count = opts.overcharge || opts.purified ? 14 : Phaser.Math.Between(10, 12);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.22, 0.22);
    const dist = Phaser.Math.FloatBetween(38, 78);
    const pr = Phaser.Math.FloatBetween(4, 6);
    const color = i % 2 === 0 ? primaryColor : AMBER;
    const spore = scene.add.graphics({ x, y }).setDepth(9);
    spore.lineStyle(2, DARK_BACKING, 0.85);
    spore.fillStyle(color, 1);
    if (i % 2 === 0) {
      spore.fillCircle(0, 0, pr);
      spore.strokeCircle(0, 0, pr);
    } else {
      const pts = [
        new Phaser.Geom.Point(0, -pr * 1.25),
        new Phaser.Geom.Point(pr * 1.25, 0),
        new Phaser.Geom.Point(0, pr * 1.25),
        new Phaser.Geom.Point(-pr * 1.25, 0),
      ];
      spore.fillPoints(pts, true);
      spore.strokePoints(pts, true);
    }
    scene.tweens.add({
      targets: spore,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist - 32,
      scale: 0.15,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => spore.destroy(),
    });
  }

  // 4. Crisp Floating Influence Text (0ms – 800ms)
  const textValue = opts.sublabel ? `${opts.sublabel}\n${label}` : label;
  const floater = scene.add
    .text(x, y - 6, textValue, {
      fontFamily: '"JetBrains Mono", monospace',
      fontStyle: 'bold',
      fontSize: opts.overcharge || opts.purified ? '19px' : '18px',
      align: 'center',
      color: opts.purified ? '#e9d5ff' : opts.overcharge ? '#fde68a' : '#67e8f9',
      stroke: '#050407',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#050407',
        blur: 4,
        stroke: true,
        fill: true,
      },
    })
    .setOrigin(0.5)
    .setDepth(15)
    .setScale(0.5);

  scene.tweens.add({
    targets: floater,
    scale: opts.overcharge || opts.purified ? 1.28 : 1.2,
    duration: 150,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: floater,
        y: y - 58,
        alpha: 0,
        duration: 650,
        ease: 'Quad.easeOut',
        onComplete: () => floater.destroy(),
      });
    },
  });
}
