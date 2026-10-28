// Dark arcane SFX. A minor, shared echo, crystal partials.
// Usage: pnpm sfx
import { spawnSync } from 'node:child_process';
import { unlinkSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const ECHO_SEC = 0.18;
const ECHO_GAIN = 0.32;
const A2 = 110;
const E3 = 164.81;
const A3 = 220;
const C4 = 261.63;
const E4 = 329.63;
const A4 = 440;
const B4 = 493.88;
const C5 = 523.25;
const E5 = 659.25;
const A5 = 880;
const C6 = 1046.5;
const E6 = 1318.51;
const A6 = 1760;
const PARTIALS = [1, 2.76, 5.4, 8.93];
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../public/assets/audio');
const LIMIT = 1.5 * 1024 * 1024;
const RETIRED = ['pop.wav', 'coin.mp3', 'cast.wav', 'levelup.wav', 'buff.wav', 'debuff.wav'];

let seed = 0xa15;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const noise = () => rand() * 2 - 1;

const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

function mix(dst, src, atSec, gain = 1) {
  const o = Math.floor(atSec * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * gain;
}

function clink(freq, dur = 0.35) {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    PARTIALS.forEach((r, k) => {
      s += Math.sin(2 * Math.PI * freq * r * t) * Math.exp(-t * (14 + k * 9)) / (k + 1);
    });
    out[i] = s + noise() * Math.exp(-t * 200) * 0.12;
  }
  return out;
}

function tone(freq, dur, decay) {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] = Math.sin(2 * Math.PI * freq * t) * env(t, 0.012, decay);
  }
  return out;
}

function chord(freqs, dur, decay, stagger = 0.04) {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    freqs.forEach((f, k) => {
      const tt = t - k * stagger;
      if (tt < 0) return;
      const a = env(tt, 0.04, decay);
      s += Math.sin(2 * Math.PI * f * tt) * a;
      s += Math.sin(2 * Math.PI * f * 2 * tt) * a * 0.12;
    });
    out[i] = s / freqs.length;
  }
  return out;
}

function noiseBurst(dur, attack, decay, cutoff) {
  const out = buf(dur);
  let lp = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    lp += (noise() - lp) * cutoff;
    out[i] = lp * env(t, attack, decay);
  }
  return out;
}

function whoosh(dur, freq0, freq1) {
  const out = buf(dur);
  let lp = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const k = t / dur;
    lp += (noise() - lp) * (0.06 + 0.45 * k);
    const amp = Math.sin(Math.PI * Math.min(1, k)) ** 1.2;
    const swirl = 0.65 + 0.35 * Math.sin(2 * Math.PI * 2.5 * t);
    const f = freq0 + (freq1 - freq0) * k;
    out[i] = lp * amp * swirl + Math.sin(2 * Math.PI * f * t) * amp * 0.22;
  }
  return out;
}

function rustle() {
  const out = buf(0.32);
  let hp = 0;
  let lp = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const n = noise();
    lp += (n - lp) * 0.4;
    hp += (lp - hp) * 0.08;
    const puff =
      Math.exp(-((t - 0.04) ** 2) / 0.0015) + 0.75 * Math.exp(-((t - 0.15) ** 2) / 0.004);
    out[i] = (lp - hp) * puff;
  }
  return out;
}

function echo(data) {
  const d = Math.floor(ECHO_SEC * SR);
  const out = buf(data.length / SR + ECHO_SEC * 2);
  for (let i = 0; i < data.length; i++) out[i] += data[i];
  for (let i = d; i < out.length; i++) out[i] += out[i - d] * ECHO_GAIN;
  return out;
}

function tick() {
  const out = buf(0.07);
  mix(out, noiseBurst(0.05, 0.001, 0.008, 0.62), 0, 0.85);
  mix(out, clink(A6, 0.06), 0, 0.28);
  return out;
}

function thud() {
  const out = buf(0.26);
  let lp = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    lp += (noise() - lp) * 0.1;
    out[i] = (Math.sin(2 * Math.PI * A2 * t) * 0.85 + lp * 0.4) * env(t, 0.003, 0.055);
  }
  return out;
}

function tome() {
  const out = buf(0.6);
  mix(out, tone(A2, 0.28, 0.06), 0, 1);
  mix(out, noiseBurst(0.08, 0.001, 0.02, 0.2), 0, 0.45);
  mix(out, clink(A5, 0.4), 0.07, 0.5);
  return echo(out);
}

function rattle() {
  const out = buf(0.42);
  for (let k = 0; k < 5; k++) {
    mix(out, clink(780 + rand() * 380, 0.18), k * 0.045 + rand() * 0.008, 0.7);
  }
  return echo(out);
}

function shatter() {
  const out = buf(0.9);
  mix(out, noiseBurst(0.2, 0.002, 0.06, 0.35), 0, 0.8);
  mix(out, tone(70, 0.25, 0.08), 0, 0.55);
  for (let k = 0; k < 10; k++) {
    mix(out, clink(E5 + rand() * 1400, 0.28), 0.02 + rand() * 0.28, 0.28);
  }
  return echo(out);
}

function reveal() {
  const out = buf(2.4);
  const notes = [A3, C4, E4, B4, E5];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    let s = 0;
    notes.forEach((f, k) => {
      const a = env(Math.max(0, t - k * 0.07), 0.06, 0.9);
      s += Math.sin(2 * Math.PI * f * t) * a * 0.22;
    });
    out[i] = s;
  }
  [E5, A5, C6, E6].forEach((f, k) => mix(out, clink(f, 0.7), 0.12 + k * 0.08, 0.32));
  return echo(out);
}

function magicSpark(root, dur, rise) {
  const out = buf(dur);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const f = root * (1 + rise * (1 - Math.exp(-t / 0.07)));
    const bloom = env(t, 0.02, dur * 0.5);
    let s = 0;
    PARTIALS.forEach((r, k) => {
      s += Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * (7 + k * 4)) / (k + 1);
    });
    const breath = Math.sin(2 * Math.PI * root * 0.5 * t) * env(t, 0.012, 0.14) * 0.28;
    out[i] = s * bloom + breath;
  }
  return out;
}

function burn(sec) {
  for (let i = 0; i < Math.ceil(sec * SR); i++) noise();
}

function cast() {
  const out = buf(0.46);
  mix(out, magicSpark(A4, 0.4, 0.16), 0, 0.75);
  mix(out, magicSpark(E5, 0.34, 0.4), 0.045, 0.5);
  mix(out, magicSpark(C6, 0.26, 0.22), 0.09, 0.32);
  // ponytail: keep the old click's random draws so the rest of the set does not shift.
  burn(0.08);
  burn(0.26);
  burn(0.26);
  burn(0.26);
  return echo(out);
}

function creatureTap() {
  const out = buf(0.4);
  mix(out, magicSpark(E5, 0.32, 0.55), 0, 0.4);
  mix(out, magicSpark(A6, 0.3, 0.28), 0.035, 0.72);
  burn(0.32);
  return echo(out);
}

function barrier() {
  const out = buf(1.05);
  mix(out, tone(A2, 1.0, 0.45), 0, 0.7);
  mix(out, whoosh(0.9, A3, E5), 0.08, 0.85);
  return echo(out);
}

function portal() {
  return echo(whoosh(1.05, A3, A5));
}

function wings() {
  const out = buf(0.55);
  mix(out, whoosh(0.42, E4, A6), 0, 0.9);
  mix(out, clink(A6, 0.3), 0.06, 0.25);
  return echo(out);
}

function rising(notes) {
  const out = buf(1.15);
  notes.forEach((f, i) => mix(out, clink(f, 0.7), i * 0.11, 0.7));
  return echo(out);
}

function falling(notes) {
  const out = buf(1.15);
  notes.forEach((f, i) => mix(out, clink(f, 0.65), i * 0.13, 0.72 - i * 0.12));
  return echo(out);
}

function levelReady() {
  const out = buf(0.62);
  mix(out, tone(A5, 0.32, 0.1), 0, 0.55);
  mix(out, tone(C6, 0.32, 0.12), 0.16, 0.45);
  return echo(out);
}

function levelUp() {
  const out = buf(1.45);
  mix(out, chord([A3, C4, E4, A4], 1.35, 0.85), 0, 0.9);
  [E5, A5, C6, E6].forEach((f, i) => mix(out, clink(f, 0.45), 0.06 + i * 0.08, 0.32));
  return echo(out);
}

function collect() {
  const out = buf(0.85);
  [E5, A5, C6, E6, A6].forEach((f, i) => mix(out, clink(f, 0.4), i * 0.07, 0.55));
  return echo(out);
}

function achievement() {
  const out = buf(0.7);
  [E5, A5, C6].forEach((f, i) => mix(out, clink(f, 0.5), i * 0.04, 0.6));
  return echo(out);
}

function reward() {
  return echo(chord([A3, C4, E4, B4], 1.5, 1.05, 0.03));
}

function endGame() {
  return echo(chord([A2, E3, A3, C4, E4], 3.1, 1.5, 0.09));
}

function chapter() {
  const out = buf(1.35);
  mix(out, clink(A3, 1.25), 0, 1);
  mix(out, clink(E4, 1.1), 0.04, 0.4);
  return echo(out);
}

function pair(freqs) {
  const out = buf(0.45);
  freqs.forEach((f, i) => mix(out, clink(f, 0.4), i * 0.02, 0.7));
  return out;
}

const sounds = {
  'ui-tap': tick(),
  denied: thud(),
  barrier: barrier(),
  cast: cast(),
  'creature-tap': creatureTap(),
  'tome-buy': tome(),
  'lock-rattle': rattle(),
  'lock-shatter': shatter(),
  'creature-reveal': reveal(),
  'page-turn': rustle(),
  'chapter-start': chapter(),
  portal: portal(),
  'pegasus-enter': wings(),
  'pegasus-tap': echo(pair([A6, E6])),
  'blessing-on': rising([A4, C5, E5, A5]),
  'blessing-off': falling([A5, E5, C5, A4]),
  'level-ready': levelReady(),
  'level-up': levelUp(),
  collect: collect(),
  achievement: achievement(),
  reward: reward(),
  'end-game': endGame(),
};

function fadeTail(data) {
  const n = Math.min(160, data.length >> 3);
  for (let i = 0; i < n; i++) data[data.length - 1 - i] *= i / n;
}

function writeWav(name, data) {
  fadeTail(data);
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  if (peak < 0.05) throw new Error(`${name} is silent`);
  if (data.length < SR * 0.04 || data.length > SR * 6) throw new Error(`${name} bad length`);
  const g = 0.89 / peak;
  const b = Buffer.alloc(44 + data.length * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + data.length * 2, 4);
  b.write('WAVE', 8);
  b.write('fmt ', 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => {
    const s = Math.max(-1, Math.min(1, v * g));
    b.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  });
  const path = join(OUT, name);
  writeFileSync(path, b);
  return { path, sec: data.length / SR, peak };
}

for (const old of RETIRED) {
  const path = join(OUT, old);
  if (existsSync(path)) unlinkSync(path);
}

const keys = Object.keys(sounds);
const written = keys.map((key) => {
  const info = writeWav(`${key}.wav`, sounds[key]);
  console.log(`${key}.wav  ${info.sec.toFixed(2)}s`);
  return info.path;
});

let total = written.reduce((n, path) => n + statSync(path).size, 0);
console.log(`wav total ${(total / 1024).toFixed(0)} KB`);

if (total > LIMIT) {
  for (const path of written) {
    const mp3 = path.replace(/\.wav$/, '.mp3');
    const run = spawnSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-i', path, '-codec:a', 'libmp3lame', '-b:a', '96k', '-ac', '1', mp3],
      { stdio: 'inherit' },
    );
    if (run.status !== 0) throw new Error(`ffmpeg failed for ${path}`);
    unlinkSync(path);
  }
  total = keys.reduce((n, key) => n + statSync(join(OUT, `${key}.mp3`)).size, 0);
  console.log(`mp3 total ${(total / 1024).toFixed(0)} KB`);
}
