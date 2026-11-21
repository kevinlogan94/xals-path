import type { Sfx } from '../systems/AudioSystem';
import type { CreatureDef, CreatureVariant, RegionId } from '../types';
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
    "Sky's Grace",
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
  canViewOutlook: boolean;
  canViewBestiary: boolean;
  canViewAchievements: boolean;
};

type WhatsNewCardSpec = {
  icon: string;
  title: string;
  hint: string;
  actionAttr?: string;
  enabled?: boolean;
};

type WhatsNewEntrySpec = {
  id: string;
  heroIcon?: string;
  intro: string;
  callout?: string;
  cta?: { label: string; attr: string };
  cards: WhatsNewCardSpec[];
  listSummaryCard?: WhatsNewCardSpec;
};

function renderWhatsNewCard(c: WhatsNewCardSpec, clickable = true): string {
  const inner = `<img src="${c.icon}" alt="" /><div><div class="reward-title">${c.title}</div><div class="reward-hint">${c.hint}</div></div>`;
  if (clickable && c.actionAttr) {
    return `<button type="button" class="scroll-card whats-new-card whats-new-card-btn scroll-card-active" ${c.actionAttr} ${c.enabled === false ? 'disabled' : ''}>${inner}</button>`;
  }
  return `<div class="scroll-card whats-new-card">${inner}</div>`;
}

export function whatsNewSplash(opts: WhatsNewSplashOpts): string {
  const entries: WhatsNewEntrySpec[] = [
    {
      id: 'variants-v1',
      intro:
        'The corruption across the realm is growing bolder. New mid-late threats now challenge your aim, timing, and focus for much bigger rewards.',
      cta: opts.canViewOutlook
        ? { label: 'Open Outlook', attr: 'data-whats-new-outlook' }
        : undefined,
      cards: [
        {
          icon: './assets/ui/OutlookFlower.png',
          title: 'New Creature Variants (Lvl 12-17)',
          hint: 'Face Unstable, Phantom, and Leech creatures as you level up, with visual guides on your first encounter.',
        },
        {
          icon: './assets/ui/influence.png',
          title: 'Wild Frenzy Multiplier',
          hint: 'Outsmart these threats to spark Wild Frenzy, stacking up to 8× all live Influence and XP for 12 seconds.',
        },
        {
          icon: './assets/ui/manaIcon.png',
          title: 'Watch Your Taps',
          hint: 'Tripping an Unstable or faded Phantom briefly locks your mana and cools your multiplier.',
        },
      ],
      listSummaryCard: {
        icon: './assets/ui/OutlookFlower.png',
        title: 'Creature Variants & Wild Frenzy',
        hint: 'Face new Unstable, Phantom, and Leech threats (Lvl 12-17) to stack up to 8× Wild Frenzy across all live Influence and XP.',
        actionAttr: 'data-whats-new-outlook',
        enabled: opts.canViewOutlook,
      },
    },
    {
      id: 'fold-v1',
      heroIcon: './assets/ui/Portal2.png',
      intro:
        'The sanctum now unfolds cleanly across foldable displays, keeping cards, scrolls, and dialogue framed while the realm fills the screen.',
      cards: [
        {
          icon: './assets/ui/Portal2.png',
          title: 'Foldable Display Support',
          hint: 'Tailored layout for unfolded screens: full-bleed realm art with centered chapter cards, scrolls, and dialogue.',
        },
      ],
    },
    {
      id: 'outlook-v1',
      intro:
        'The valley is alive with running creatures, spell combos, and cleansing magic.',
      cta: opts.canViewOutlook
        ? { label: 'Enter the Valley', attr: 'data-whats-new-outlook' }
        : undefined,
      cards: [
        {
          icon: './assets/ui/manaIcon.png',
          title: 'Empowered Spell Combos',
          hint: 'Low mana never stops your casting! Cast while mana is charged to build up to a 5× Combo and trigger 10-spell Bursts.',
        },
        {
          icon: './assets/ui/OutlookFlower.png',
          title: 'Cleansing & Triad Burst',
          hint: 'Tap running creatures or plant Bloom Runes in their path to cleanse them. Light up 3 at once to link a Triad Burst (+10× burst!).',
        },
        {
          icon: './assets/ui/tomes/lightning.png',
          title: 'Corrupted Beasts & Chapter Powers',
          hint: "Tap purple Corrupted creatures 3× to shatter their blight, and unlock new spell surges as Xal's story unfolds.",
        },
      ],
      listSummaryCard: {
        icon: './assets/ui/OutlookFlower.png',
        title: 'Living Valley & Spell Weaving',
        hint: 'Build 5× spell combos, cleanse running & corrupted beasts, link 3 for a Triad Burst, and unlock chapter mana powers.',
        actionAttr: 'data-whats-new-outlook',
        enabled: opts.canViewOutlook,
      },
    },
    {
      id: 'sound-v1',
      heroIcon: './assets/ui/tomes/mystic.png',
      intro:
        'The sanctum now resonates with dark arcane sound effects across every ritual, spell cast, and creature awakening.',
      cards: [
        {
          icon: './assets/ui/tomes/mystic.png',
          title: 'Arcane Soundscape',
          hint: 'New custom sound effects for creature unlocks, spell casting, story pages, and sanctum rewards.',
        },
      ],
    },
    {
      id: 'bestiary-v1',
      heroIcon: './assets/ui/Tomes.png',
      intro:
        'Xal has opened the shelves of his study. Inspect the Bestiary anytime from his tower to revisit every creature you have cleansed.',
      callout:
        opts.creaturesUnlocked > 0
          ? `${opts.creaturesUnlocked} / ${opts.creaturesTotal} Creatures already recorded in your Bestiary!`
          : undefined,
      cta: opts.canViewBestiary
        ? { label: 'View Bestiary', attr: 'data-whats-new-bestiary' }
        : undefined,
      cards: [
        {
          icon: './assets/ui/Tomes.png',
          title: 'Sanctum Bestiary',
          hint: 'Tap the glowing bookcase beside Xal to read creature lore and view their animated forms.',
          actionAttr: 'data-whats-new-bestiary',
          enabled: opts.canViewBestiary,
        },
      ],
    },
    {
      id: 'achievements-v1',
      intro:
        "Recent additions to Xal's Path. Tap a chronicle below to inspect it directly.",
      callout:
        opts.achievementsUnlocked > 0
          ? `${opts.achievementsUnlocked}/${opts.achievementsTotal} Achievements already recorded from your journey!`
          : undefined,
      cta: opts.canViewAchievements
        ? { label: 'View Trophies', attr: 'data-whats-new-achievements' }
        : undefined,
      cards: [
        {
          icon: './assets/ui/trophy.png',
          title: `12 Legacy Trophies (${opts.achievementsUnlocked}/${opts.achievementsTotal})`,
          hint: 'Earn permanent badges for story chapters, spell mastery, and realm exploration.',
          actionAttr: 'data-whats-new-achievements',
          enabled: opts.canViewAchievements,
        },
        {
          icon: './assets/ui/tomes/rebirth.png',
          title: 'Cross-Run Progress',
          hint: 'Unlocked achievements and story completion counts persist across New Games.',
        },
      ],
    },
  ];

  const active = entries.filter((e) => opts.unseenIds.includes(e.id));

  if (active.length === 1) {
    const entry = active[0];
    const heroHtml = entry.heroIcon
      ? `<img class="splash-icon" src="${entry.heroIcon}" alt="" />`
      : '';
    const calloutHtml = entry.callout
      ? `<p class="whats-new-callout">✨ ${entry.callout}</p>`
      : '';
    const ctaHtml = entry.cta
      ? `<button type="button" class="ritual-btn" ${entry.cta.attr}>${entry.cta.label}</button>`
      : '';
    return shell(
      'Sanctum Chronicle',
      "What's New",
      `${heroHtml}
      <p class="splash-copy">${entry.intro}</p>
      ${calloutHtml}
      <div class="whats-new-list">
        ${entry.cards.map((c) => renderWhatsNewCard(c, !entry.cta)).join('')}
      </div>
      <div class="splash-actions">
        ${ctaHtml}
        <button type="button" class="scroll-card back-btn" data-splash-close>Continue</button>
      </div>`,
    );
  }

  const callouts: string[] = [];
  if (opts.unseenIds.includes('bestiary-v1') && opts.creaturesUnlocked > 0) {
    callouts.push(`${opts.creaturesUnlocked}/${opts.creaturesTotal} Creatures`);
  }
  if (opts.unseenIds.includes('achievements-v1') && opts.achievementsUnlocked > 0) {
    callouts.push(`${opts.achievementsUnlocked}/${opts.achievementsTotal} Achievements`);
  }
  const calloutHtml =
    callouts.length > 0
      ? `<p class="whats-new-callout">✨ ${callouts.join(' & ')} already recorded from your journey!</p>`
      : '';

  return shell(
    'Sanctum Chronicle',
    "What's New",
    `<p class="splash-copy">Recent additions to Xal's Path. Tap a chronicle below to inspect it directly.</p>
    ${calloutHtml}
    <div class="whats-new-list">
      ${active
        .flatMap((e) => (e.listSummaryCard ? [e.listSummaryCard] : e.cards))
        .map((c) => renderWhatsNewCard(c, true))
        .join('')}
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
    'Bestiary',
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

const VARIANT_ENCOUNTER: Record<
  CreatureVariant,
  {
    kicker: string;
    title: string;
    lore: string;
    callout: string;
    cta: string;
    pips: number;
  }
> = {
  blighted: {
    kicker: 'Corruption Spreads',
    title: 'Corrupted Creature',
    lore: 'The rot Xal warned you of has reached the wilds, wrapping creatures in dark purple haze.',
    callout:
      '<strong>Tap it 3 times</strong> to shatter the purple haze, unleashing a <strong>huge burst of Influence</strong> and leaving it glowing with magic.',
    cta: 'Cleanse It',
    pips: 3,
  },
  vessel: {
    kicker: 'Rare Sighting',
    title: 'Golden Creature',
    lore: 'As your power deepens, rare creatures gleaming with pure golden essence have begun darting through the wilds.',
    callout:
      'It leaps away every time you strike. <strong>Catch it 3 times</strong> before it flees for rich bursts of Influence and a <strong>giant jackpot</strong> on the final tap. A 25-spell combo also draws one out.',
    cta: 'Chase It',
    pips: 3,
  },
  volatile: {
    kicker: "Barlog's Corruption Deepens",
    title: 'Unstable Creature',
    lore: "Barlog's corruption is growing volatile. Some creatures now crackle with unstable crimson energy ready to blow.",
    callout:
      "<strong>Don't tap it directly</strong> or it locks your mana for 5s. Instead, <strong>tap the ground ahead of it</strong> to snare it with a glowing spell flower, sparking <strong>Wild Frenzy</strong> to multiply all Influence and XP.",
    cta: 'Trap It',
    pips: 0,
  },
  phasing: {
    kicker: 'The Wilds Fray',
    title: 'Phantom Creature',
    lore: 'The spreading curse is thinning the air itself, letting tainted creatures slip in and out of sight.',
    callout:
      '<strong>Tap it twice while solid</strong>. Striking while it is faded locks your mana for 3s. Snaring it fuels <strong>Wild Frenzy</strong>, multiplying everything you earn.',
    cta: 'Watch Closely',
    pips: 2,
  },
  siphon: {
    kicker: 'The Curse Pushes Back',
    title: 'Leech',
    lore: "Barlog's rot is learning to fight back. Swift, hungry creatures now drain the magic right out of the wilds.",
    callout:
      'It snuffs glowing creatures and drains <strong>Wild Frenzy</strong> fast. <strong>Tap it twice quickly</strong> to stop the drain and earn a <strong>double Wild Frenzy boost</strong>.',
    cta: 'Stop It',
    pips: 2,
  },
};

export function variantEncounterSplash(
  variant: CreatureVariant,
  creatureId: string,
): string {
  const spec = VARIANT_ENCOUNTER[variant];
  const frame = creatureFirstFrame(creatureId);
  const pipsHtml =
    spec.pips > 0
      ? `<div class="variant-preview-pips">${Array.from({ length: spec.pips }, () => '<span class="variant-preview-pip"></span>').join('')}</div>`
      : '';
  const preview = frame
    ? `<div class="variant-preview is-${variant}">
        <span class="variant-preview-ring" aria-hidden="true"></span>
        ${pipsHtml}
        <div class="splash-portrait"><img data-creature-frame src="${frame.src}" alt="" /></div>
      </div>`
    : '';
  return shell(
    spec.kicker,
    spec.title,
    `${preview}
    <p class="splash-copy">${spec.lore}</p>
    <p class="variant-callout is-${variant}">${spec.callout}</p>
    ${collect(spec.cta)}`,
  );
}

export function bindVariantEncounter(
  variant: CreatureVariant,
  creatureId: string,
): SplashBind {
  return (host, close) => {
    host.innerHTML = variantEncounterSplash(variant, creatureId);
    const stopRun = playCreatureRun(host, creatureId);
    bindGo(host, close);
    return () => stopRun();
  };
}
