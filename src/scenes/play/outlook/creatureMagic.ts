import Phaser from 'phaser';

const DARK_BACKING = 0x050407;
const EMERALD = 0x34d399;
const AMBER = 0xfbbf24;
const CYAN = 0x38bdf8;
const PALE_CYAN = 0xbae6fd;

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

/** Persistent rotating Blighted Scroll sigil attached to a tapped creature. */
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

  return container;
}

/** Cast & Creature-Tap: 4-part "Blighted Scroll" procedural VFX + floating text. */
export function playCastBurst(scene: Phaser.Scene, x: number, y: number, label: string): void {
  // 0. Contrast Dark-Rune Backing + Core Flash (makes emerald/amber pop over bright grass & creatures)
  const flash = scene.add.graphics({ x, y }).setDepth(7).setScale(0.6);
  flash.fillStyle(DARK_BACKING, 0.65);
  flash.fillCircle(0, 0, 60);
  flash.fillStyle(EMERALD, 0.5);
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
    scale: 1.4,
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
    scale: 1.3,
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
    ring.lineStyle(ringState.width, EMERALD, ringState.alpha);
    ring.strokeCircle(0, 0, ringState.radius);
  };
  drawRing();
  scene.tweens.add({
    targets: ringState,
    radius: 85,
    alpha: 0,
    width: 0.8,
    duration: 500,
    ease: 'Quad.easeOut',
    onUpdate: drawRing,
    onComplete: () => ring.destroy(),
  });

  // 3. Rising Mana Spores Burst (0ms – 650ms)
  const count = Phaser.Math.Between(10, 12);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.22, 0.22);
    const dist = Phaser.Math.FloatBetween(38, 74);
    const pr = Phaser.Math.FloatBetween(4, 6);
    const color = i % 2 === 0 ? EMERALD : AMBER;
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
  const floater = scene.add
    .text(x, y - 6, label, {
      fontFamily: '"JetBrains Mono", monospace',
      fontStyle: 'bold',
      fontSize: '18px',
      color: '#67e8f9',
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
    scale: 1.2,
    duration: 150,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: floater,
        y: y - 54,
        alpha: 0,
        duration: 650,
        ease: 'Quad.easeOut',
        onComplete: () => floater.destroy(),
      });
    },
  });
}
