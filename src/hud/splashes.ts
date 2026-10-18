import type { CreatureDef } from '../types';
import { formatNumber } from '../utils/format';
import { creatureFirstFrame, creatureRun } from '../scenes/play/splash/creatureSplash';

const ICONS: Record<string, string> = {
  'ui-influence': './assets/ui/influence.png',
  'ui-mana-icon': './assets/ui/manaIcon.png',
  'ui-reward-shop': './assets/ui/reward-shop.png',
  'ui-reward-star': './assets/ui/reward-star.png',
  'ui-reward-trophy': './assets/ui/reward-trophy.png',
  'ui-reward-notepad': './assets/ui/reward-notepad.png',
  'ui-reward-portal': './assets/ui/reward-portal.png',
};

const LOCK_FRAMES = 5;

function shell(kicker: string, title: string, inner: string): string {
  return `<section class="scroll-modal splash-modal"><p class="scroll-kicker">${kicker}</p><h2 class="scroll-title">${title}</h2><div class="scroll-body">${inner}</div></section>`;
}

function collect(label = 'Collect'): string {
  return `<div class="splash-actions"><button type="button" class="ritual-btn" data-splash-go>${label}</button></div>`;
}

function back(): string {
  return `<div class="splash-actions"><button type="button" class="scroll-card back-btn" data-splash-close>Back</button></div>`;
}

function bindGo(host: HTMLElement, close: () => void, go?: () => void): void {
  host.querySelector('[data-splash-go]')?.addEventListener('click', () => {
    go?.();
    close();
  });
  host.querySelector('[data-splash-close]')?.addEventListener('click', close);
}

function splashDescription(raw: string): string {
  const line = raw.split('\n')[0].replace(/^Rewards:\s*/i, '').trim();
  return line
    .replace(/\b\d+x\s+/i, '')
    .replace(/\bworth of\b/i, 'of')
    .replace(/^([a-z])/, (c) => c.toUpperCase());
}

export function influenceSplash(amount: number): string {
  return shell(
    'While You Were Away',
    'Influence Earned',
    `<img class="splash-icon" src="${ICONS['ui-influence']}" alt="" />
    <p class="splash-copy">While you were away, the incantation from your tomes continued to collect influence.</p>
    <p class="splash-stat">${formatNumber(amount)} influence</p>
    ${collect()}`,
  );
}

export function achievementSplash(opts: {
  description: string;
  iconKey?: string;
  before?: string;
  after?: string;
}): string {
  const src = opts.iconKey ? ICONS[opts.iconKey] : '';
  const delta =
    opts.before != null && opts.after != null
      ? `<p class="splash-stat">${opts.before}  &gt;&gt;  ${opts.after}</p>`
      : '';
  return shell(
    'Milestone',
    'Reward Received',
    `${src ? `<img class="splash-icon" src="${src}" alt="" />` : ''}
    <p class="splash-copy">${splashDescription(opts.description)}</p>
    ${delta}
    ${back()}`,
  );
}

export function buffSplash(): string {
  return shell(
    'Blessing of the Gods',
    'Yes!! Way to go!!',
    `<p class="splash-stat">15 Seconds</p>${collect()}`,
  );
}

export function newGameSplash(): string {
  return shell(
    'Ritual Reset',
    'New Game',
    `<p class="splash-copy">Restart the game from the very beginning.</p>
    <div class="splash-actions">
      <button type="button" class="ritual-btn" data-splash-go>Start a New Game</button>
      <button type="button" class="scroll-card back-btn" data-splash-close>Back</button>
    </div>`,
  );
}

export function portalSplash(): string {
  return shell(
    'The Path Closes',
    'Portal',
    `<p class="splash-copy">The path closes… The portal opens.</p>${back()}`,
  );
}

export function levelUpSplash(reward: number): string {
  return shell(
    'Level Up Rewards',
    'Level Up',
    `<p class="splash-stat">${formatNumber(reward)} influence</p>${collect()}`,
  );
}

export function endGameSplash(): string {
  return shell(
    'The Path Is Walked',
    'Congratulations',
    `<p class="splash-copy">You have reached the end of Xal's Path.<br /><br />Thank you for playing.</p>
    <div class="splash-actions">
      <button type="button" class="ritual-btn" data-splash-go>Credits</button>
      <button type="button" class="scroll-card back-btn" data-splash-close>Back</button>
    </div>`,
  );
}

function creaturePanel(creature: CreatureDef): string {
  const frame = creatureFirstFrame(creature.id);
  const portrait = frame
    ? `<div class="splash-portrait"><img data-creature-frame src="${frame.src}" alt="" /></div>`
    : '';
  return shell(
    'Bestiarum',
    'New Creature Unlocked',
    `${portrait}<p class="splash-copy">${creature.name}</p><p class="splash-copy">${creature.description}</p>${back()}`,
  );
}

function playCreatureRun(host: HTMLElement, id: string): () => void {
  const run = creatureRun(id);
  const img = host.querySelector<HTMLImageElement>('[data-creature-frame]');
  const box = host.querySelector<HTMLElement>('.splash-portrait');
  if (!run || !img || !box) return () => undefined;
  let i = 0;
  const max = Math.max(...run.frames.flatMap((f) => [f.w, f.h]));
  const scale = 96 / max;
  const apply = () => {
    const frame = run.frames[i];
    img.style.width = `${img.naturalWidth * scale}px`;
    img.style.height = `${img.naturalHeight * scale}px`;
    img.style.marginLeft = `${(96 - frame.w * scale) / 2 - frame.x * scale}px`;
    img.style.marginTop = `${(96 - frame.h * scale) / 2 - frame.y * scale}px`;
  };
  let tick = 0;
  const start = () => {
    apply();
    tick = window.setInterval(() => {
      i = (i + 1) % run.frames.length;
      apply();
    }, 1000 / run.fps);
  };
  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
  return () => window.clearInterval(tick);
}

export type SplashBind = (host: HTMLElement, close: () => void) => () => void;

export function bindSimple(go?: () => void): SplashBind {
  return (host, close) => {
    bindGo(host, close, go);
    return () => undefined;
  };
}

export function bindEndGame(onCredits: () => void): SplashBind {
  return (host, close) => {
    host.querySelector('[data-splash-go]')?.addEventListener('click', () => {
      close();
      onCredits();
    });
    host.querySelector('[data-splash-close]')?.addEventListener('click', close);
    return () => undefined;
  };
}

export function bindCreature(creature: CreatureDef): SplashBind {
  return (host, close) => {
    const timers: number[] = [];
    let stopRun = () => undefined as void;
    const at = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };
    host.innerHTML =
      '<div class="splash-lock" style="background-image:url(\'./assets/ui/lock-sheet.png\')"></div>';
    const lock = host.querySelector('.splash-lock') as HTMLElement | null;
    const showFrame = (i: number) => {
      if (lock) lock.style.backgroundPosition = `${(i / (LOCK_FRAMES - 1)) * 100}% 0`;
    };
    showFrame(0);
    [2000, 2050, 2100, 2150].forEach((ms, i) => at(ms, () => showFrame(i + 1)));
    const z = [0, -5, 5, -5, 5, 0, 0, -5, 5, -5, 5, 0];
    [1000, 1050, 1100, 1150, 1200, 1267, 1400, 1450, 1500, 1550, 1600, 1667].forEach((ms, i) =>
      at(ms, () => {
        if (lock) lock.style.transform = `rotate(${z[i]}deg)`;
      }),
    );
    at(3167, () => {
      host.innerHTML = creaturePanel(creature);
      stopRun = playCreatureRun(host, creature.id);
      bindGo(host, close);
    });
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      stopRun();
    };
  };
}

export function bindCredits(host: HTMLElement, close: () => void): () => void {
  host.querySelector('[data-credits-close]')?.addEventListener('click', close);
  return () => undefined;
}
