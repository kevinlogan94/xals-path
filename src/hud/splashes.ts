import type { Sfx } from '../systems/AudioSystem';
import type { CreatureDef, RegionId } from '../types';
import { formatNumber } from '../utils/format';
import { creatureFirstFrame, creatureRun } from '../scenes/play/splash/creatureSplash';

const REGION_NAMES: Record<RegionId, string> = {
  meadow: 'The Meadows',
  river: 'Galia River',
  altar: 'Sci Nai Mountains',
};

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

function bindGo(
  host: HTMLElement,
  close: (silent?: boolean) => void,
  go?: () => void,
  silentGo = false,
): void {
  host.querySelector('[data-splash-go]')?.addEventListener('click', () => {
    close(silentGo);
    go?.();
  });
  host.querySelector('[data-splash-close]')?.addEventListener('click', () => close());
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

export function feedbackSplash(): string {
  return shell(
    "Traveler's Counsel",
    'Thanks for Playing',
    `<img class="splash-icon" src="${ICONS['ui-reward-star']}" alt="" />
    <p class="splash-copy">Enjoying Xal's Path so far? Take a quick survey to share what you think and what we can do better.</p>
    <div class="splash-actions">
      <button type="button" class="ritual-btn" data-splash-go>Share Feedback</button>
      <button type="button" class="scroll-card back-btn" data-splash-close>Not Now</button>
    </div>`,
  );
}

export type WhatsNewSplashOpts = {
  unseenIds: string[];
  creaturesUnlocked: number;
  creaturesTotal: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  canViewBestiary: boolean;
  canViewAchievements: boolean;
};

export function whatsNewSplash(opts: WhatsNewSplashOpts): string {
  const showBestiary = opts.unseenIds.includes('bestiary-v1');
  const showAchievements = opts.unseenIds.includes('achievements-v1');
  const onlyBestiary = showBestiary && !showAchievements;

  if (onlyBestiary) {
    const callout =
      opts.creaturesUnlocked > 0
        ? `<p class="whats-new-callout">✨ ${opts.creaturesUnlocked} / ${opts.creaturesTotal} Creatures already recorded in your Bestiarum!</p>`
        : '';
    const viewBtn = opts.canViewBestiary
      ? `<button type="button" class="ritual-btn" data-whats-new-bestiary>View Bestiarum</button>`
      : '';
    return shell(
      'Sanctum Chronicle',
      "What's New",
      `<img class="splash-icon" src="./assets/ui/Tomes.png" alt="" />
      <p class="splash-copy">Xal has opened the shelves of his study. Inspect the Bestiarum anytime from his tower to revisit every creature you have cleansed.</p>
      ${callout}
      <div class="whats-new-list">
        <div class="scroll-card whats-new-card">
          <img src="./assets/ui/Tomes.png" alt="" />
          <div>
            <div class="reward-title">Sanctum Bestiarum</div>
            <div class="reward-hint">Tap the glowing bookcase beside Xal to read creature lore and view their animated forms.</div>
          </div>
        </div>
      </div>
      <div class="splash-actions">
        ${viewBtn}
        <button type="button" class="scroll-card back-btn" data-splash-close>Continue</button>
      </div>`,
    );
  }

  const callouts: string[] = [];
  if (showBestiary && opts.creaturesUnlocked > 0) {
    callouts.push(`${opts.creaturesUnlocked}/${opts.creaturesTotal} Creatures`);
  }
  if (showAchievements && opts.achievementsUnlocked > 0) {
    callouts.push(`${opts.achievementsUnlocked}/${opts.achievementsTotal} Achievements`);
  }
  const calloutHtml =
    callouts.length > 0
      ? `<p class="whats-new-callout">✨ ${callouts.join(' & ')} already recorded from your journey!</p>`
      : '';

  const bestiaryCard = showBestiary
    ? `<button type="button" class="scroll-card whats-new-card whats-new-card-btn scroll-card-active" data-whats-new-bestiary ${opts.canViewBestiary ? '' : 'disabled'}>
        <img src="./assets/ui/Tomes.png" alt="" />
        <div>
          <div class="reward-title">Sanctum Bestiarum (${opts.creaturesUnlocked}/${opts.creaturesTotal})</div>
          <div class="reward-hint">Tap the glowing bookcase beside Xal to read creature lore and view their animated forms.</div>
        </div>
      </button>`
    : '';

  const achCards = showAchievements
    ? `<button type="button" class="scroll-card whats-new-card whats-new-card-btn scroll-card-active" data-whats-new-achievements ${opts.canViewAchievements ? '' : 'disabled'}>
        <img src="./assets/ui/trophy.png" alt="" />
        <div>
          <div class="reward-title">12 Legacy Trophies (${opts.achievementsUnlocked}/${opts.achievementsTotal})</div>
          <div class="reward-hint">Earn permanent badges for story chapters, spell mastery, and realm exploration.</div>
        </div>
      </button>
      <div class="scroll-card whats-new-card">
        <img src="./assets/ui/tomes/rebirth.png" alt="" />
        <div>
          <div class="reward-title">Cross-Run Progress</div>
          <div class="reward-hint">Unlocked achievements and story completion counts persist across New Games.</div>
        </div>
      </div>`
    : '';

  return shell(
    'Sanctum Chronicle',
    "What's New",
    `<p class="splash-copy">Recent additions to Xal's Path. Tap a chronicle below to inspect it directly.</p>
    ${calloutHtml}
    <div class="whats-new-list">
      ${bestiaryCard}
      ${achCards}
    </div>
    <div class="splash-actions">
      <button type="button" class="scroll-card back-btn" data-splash-close>Continue</button>
    </div>`,
  );
}

export function endGameSplash(): string {
  return shell(
    'The Path Is Walked',
    'Congratulations',
    `<p class="splash-copy">You have reached the end of Xal's Path. You may keep tending the realm, or start a New Game anytime from Settings.<br /><br />If you enjoyed the journey, we'd love to hear your thoughts.</p>
    <div class="splash-actions">
      <button type="button" class="ritual-btn" data-splash-feedback>Share Feedback</button>
      <button type="button" class="scroll-card back-btn" data-splash-go>Credits</button>
      <button type="button" class="scroll-card back-btn" data-splash-close>Back</button>
    </div>`,
  );
}

function creaturePanel(creature: CreatureDef, title = 'New Creature Unlocked', helperName?: string): string {
  const frame = creatureFirstFrame(creature.id);
  const portrait = frame
    ? `<div class="splash-portrait"><img data-creature-frame src="${frame.src}" alt="" /></div>`
    : '';
  const pills = helperName
    ? `<div class="splash-meta-pills">
        <span class="splash-pill"><img src="./assets/ui/tomes/${creature.helperId}.png" alt="" />${helperName} Tome</span>
        <span class="splash-pill amber">${REGION_NAMES[creature.region]}</span>
      </div>`
    : `<p class="splash-copy">${creature.name}</p>`;
  return shell(
    'Bestiarum',
    title,
    `${portrait}${pills}<p class="splash-copy">${creature.description}</p>${back()}`,
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
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    img.style.width = `${sw}px`;
    img.style.height = `${sh}px`;
    img.style.marginLeft = `${(96 - frame.w * scale) / 2 - frame.x * scale}px`;
    img.style.marginTop = `${(96 - frame.h * scale) / 2 - frame.y * scale}px`;
    img.style.clipPath = `inset(${frame.y * scale}px ${sw - (frame.x + frame.w) * scale}px ${sh - (frame.y + frame.h) * scale}px ${frame.x * scale}px)`;
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

export type SplashBind = (host: HTMLElement, close: (silent?: boolean) => void) => () => void;

export function bindSimple(go?: () => void, silentGo = false): SplashBind {
  return (host, close) => {
    bindGo(host, close, go, silentGo);
    return () => undefined;
  };
}

export function bindEndGame(onCredits: () => void, onFeedback: () => void): SplashBind {
  return (host, close) => {
    host.querySelector('[data-splash-feedback]')?.addEventListener('click', () => {
      close();
      onFeedback();
    });
    host.querySelector('[data-splash-go]')?.addEventListener('click', () => {
      close();
      onCredits();
    });
    host.querySelector('[data-splash-close]')?.addEventListener('click', () => close());
    return () => undefined;
  };
}

export function bindCreature(
  creature: CreatureDef,
  play: (key: Sfx, volume?: number) => void,
): SplashBind {
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
    at(1000, () => play('lock-rattle', 0.38));
    at(1400, () => play('lock-rattle', 0.38));
    at(2000, () => play('lock-shatter', 0.46));
    const z = [0, -5, 5, -5, 5, 0, 0, -5, 5, -5, 5, 0];
    [1000, 1050, 1100, 1150, 1200, 1267, 1400, 1450, 1500, 1550, 1600, 1667].forEach((ms, i) =>
      at(ms, () => {
        if (lock) lock.style.transform = `rotate(${z[i]}deg)`;
      }),
    );
    at(3167, () => {
      play('creature-reveal', 0.42);
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

export function bindCreatureInspect(creature: CreatureDef, helperName: string): SplashBind {
  return (host, close) => {
    host.innerHTML = creaturePanel(creature, creature.name, helperName);
    const stopRun = playCreatureRun(host, creature.id);
    bindGo(host, close);
    return () => stopRun();
  };
}

export function bindCredits(onFeedback: () => void): SplashBind {
  return (host, close) => {
    host.querySelector('[data-credits-feedback]')?.addEventListener('click', onFeedback);
    host.querySelector('[data-credits-close]')?.addEventListener('click', () => close());
    return () => undefined;
  };
}
