import type { GameContext } from '../game/GameContext';
import type { ChapterDef, CreatureDef, GameSave, RegionId, TabId } from '../types';
import { formatNumber } from '../utils/format';
import { devPresets } from '../systems/SaveSystem';
import { ACHIEVEMENTS } from '../systems/AchievementSystem';
import { creatureRun } from '../scenes/play/splash/creatureSplash';

const GITHUB = 'https://github.com/kevinlogan94/xals-path';
const COFFEE = 'https://buymeacoffee.com/kevinmlogan';
const SITE = 'https://kevinmlogan.com';
const FEEDBACK = 'https://tally.so/r/jea951';

export type RewardId = 'helper' | 'clicker' | 'meta' | 'login' | 'story';
export type RewardsSubTab = 'milestones' | 'achievements';

export type AchievementClaimInfo = {
  id: RewardId;
  title: string;
  description: string;
  iconKey: string;
  before: string;
  after: string;
};

const CREDITS: [string, string[]][] = [
  ['Game Design', ['Kevin Logan']],
  ['Developer', ['Kevin Logan']],
  ['Music', ['Steven Logan']],
  ['Sound Effects', ['freesound.org']],
  ['Art', ['Kevin Logan', 'Shayne Gadd']],
  ['Story', ['Kevin Logan', 'Elliot Maynard']],
  ['Brand', ['Brock Johnson']],
  [
    'iOS Testers',
    [
      'Ryan Schalk',
      'Michaela Schalk',
      'Kyle Werling',
      'Steven Logan',
      'Steve G. Logan',
      'Shayne Gadd',
      'Katie Waldrop',
      'Collin Hammond',
      'Kevin Hammond',
      'Elliot Maynard',
      'Michael Leone',
      'Lisa Logan',
      'Will Logan',
      'Elisabeth Logan',
    ],
  ],
  ['Android Testers', ['Kyle Ihli', 'Miguel Ortiz', 'Cody Platt', 'Travis Mikolay', 'Tyler Kidwell']],
  ['Backer', ['Elliot Maynard']],
];

function devFlag(): boolean {
  return new URLSearchParams(window.location.search).get('dev') === '1';
}

function openUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openFeedback(source: string, level: number): void {
  openUrl(`${FEEDBACK}?source=${source}&level=${level}`);
}

function modal(kicker: string, title: string, body: string): string {
  return `<section class="scroll-modal"><p class="scroll-kicker">${kicker}</p><h2 class="scroll-title">${title}</h2><div class="scroll-body">${body}</div></section>`;
}

export function settingsHtml(ctx: GameContext): string {
  const musicOn = !ctx.audio.muteBgm;
  const sfxOn = !ctx.audio.muteSfx;
  const toggle = (on: boolean) =>
    `<span class="audio-toggle${on ? '' : ' is-off'}">${on ? 'ON' : 'OFF'}</span>`;
  let extra = '';
  if (devFlag()) {
    extra = `<p class="scroll-section">Testing</p><div class="dev-grid">${devPresets()
      .map((p, i) => `<button type="button" class="scroll-card dev-btn" data-dev="${i}">${p.label}</button>`)
      .join('')}</div>`;
  }
  return modal(
    'Sanctum Configuration',
    'Settings',
    `<p class="scroll-section">Audio</p>
    <button type="button" class="scroll-card audio-row" data-audio="bgm"><span>Music</span>${toggle(musicOn)}</button>
    <button type="button" class="scroll-card audio-row" data-audio="sfx"><span>Effects</span>${toggle(sfxOn)}</button>
    <p class="scroll-section">About</p>
    <div class="about-grid">
      <button type="button" class="scroll-card about-btn" data-about="whats-new">What's New</button>
      <button type="button" class="scroll-card about-btn" data-about="credits">Credits</button>
      <button type="button" class="scroll-card about-btn" data-about="github">GitHub</button>
      <button type="button" class="scroll-card about-btn" data-about="coffee">Coffee</button>
    </div>
    <button type="button" class="ritual-btn" data-new-game>New Game</button>
    ${extra}`,
  );
}

export function bindSettings(
  root: HTMLElement,
  ctx: GameContext,
  handlers: {
    onWhatsNew: () => void;
    onCredits: () => void;
    onNewGame: () => void;
    onJump: (state: GameSave) => void;
  },
): void {
  const presets = devPresets();
  root.querySelectorAll<HTMLElement>('[data-audio]').forEach((row) => {
    row.addEventListener('click', () => {
      const muted = row.dataset.audio === 'bgm' ? ctx.audio.toggleMuteBgm() : ctx.audio.toggleMuteSfx();
      const pill = row.querySelector('.audio-toggle');
      if (!pill) return;
      pill.textContent = muted ? 'OFF' : 'ON';
      pill.classList.toggle('is-off', muted);
    });
  });
  root.querySelectorAll<HTMLElement>('[data-about]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.about;
      if (id === 'whats-new') handlers.onWhatsNew();
      if (id === 'credits') handlers.onCredits();
      if (id === 'github') openUrl(GITHUB);
      if (id === 'coffee') openUrl(COFFEE);
    });
  });
  root.querySelector('[data-new-game]')?.addEventListener('click', handlers.onNewGame);
  root.querySelectorAll<HTMLElement>('[data-dev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = presets[Number(btn.dataset.dev)];
      if (preset) handlers.onJump(preset.save());
    });
  });
}

export function tomesHtml(ctx: GameContext): string {
  const rows = ctx.economy.helpers
    .map((def) => {
      const save = ctx.state.helpers.find((h) => h.id === def.id)!;
      const locked = ctx.state.playerLevel < def.unlockLevel;
      const canBuy = !locked && ctx.state.influence >= save.dynamicCost;
      const cls = `scroll-card tome-row${locked ? ' is-locked' : ''}${canBuy ? ' scroll-card-active' : ''}`;
      return `<button type="button" class="${cls}" data-tome="${def.id}" ${locked ? 'disabled' : ''}>
        <span class="tome-art${locked ? ' is-lock' : ''}" style="background-image:url('${locked ? './assets/ui/lock-sheet.png' : `./assets/ui/tomes/${def.id}.png`}')"></span>
        <div class="tome-copy">
          <div class="tome-name">${def.name}</div>
          <div class="tome-cost"><img src="./assets/ui/influence.png" alt="" /><span data-cost>${formatNumber(save.dynamicCost)}</span></div>
        </div>
        <div class="tome-side">
          <div class="tome-owned">${locked ? `Lvl ${def.unlockLevel}` : save.amountOwned}</div>
          <div class="tome-rate">${formatNumber(save.dynamicIncrement)}/sec</div>
        </div>
      </button>`;
    })
    .join('');
  return modal('Arcane Library', 'Tomes', rows);
}

export function bindTomes(root: HTMLElement, onBuy: (id: string) => void): void {
  root.querySelectorAll<HTMLElement>('[data-tome]').forEach((row) => {
    row.addEventListener('click', () => {
      const id = row.dataset.tome;
      if (id) onBuy(id);
    });
  });
}

export function syncTomes(root: HTMLElement, ctx: GameContext): void {
  ctx.economy.helpers.forEach((def) => {
    const save = ctx.state.helpers.find((h) => h.id === def.id);
    const row = root.querySelector<HTMLElement>(`[data-tome="${def.id}"]`);
    if (!save || !row) return;
    const locked = ctx.state.playerLevel < def.unlockLevel;
    const canBuy = !locked && ctx.state.influence >= save.dynamicCost;
    row.classList.toggle('is-locked', locked);
    row.classList.toggle('scroll-card-active', canBuy);
    row.toggleAttribute('disabled', locked);
    const art = row.querySelector<HTMLElement>('.tome-art');
    if (art) {
      art.classList.toggle('is-lock', locked);
      art.style.backgroundImage = `url('${locked ? './assets/ui/lock-sheet.png' : `./assets/ui/tomes/${def.id}.png`}')`;
    }
    const cost = row.querySelector('[data-cost]');
    if (cost) cost.textContent = formatNumber(save.dynamicCost);
    const owned = row.querySelector('.tome-owned');
    if (owned) owned.textContent = locked ? `Lvl ${def.unlockLevel}` : String(save.amountOwned);
    const rate = row.querySelector('.tome-rate');
    if (rate) rate.textContent = `${formatNumber(save.dynamicIncrement)}/sec`;
  });
}

type RewardRow = {
  id: RewardId;
  title: string;
  n: number;
  goal: number;
  hint: string;
  icon: string;
  iconSrc: string;
};

function rewardRows(ctx: GameContext): RewardRow[] {
  const a = ctx.state.achievements;
  const hoursHint = (hours: number) => `${hours}h of influence`;
  const rows: RewardRow[] = [
    {
      id: 'helper',
      title: `Buy ${a.helperGoal} Tomes`,
      n: a.helperCount,
      goal: a.helperGoal,
      hint: '3x influence from tomes',
      icon: 'ui-reward-shop',
      iconSrc: './assets/ui/reward-shop.png',
    },
    {
      id: 'clicker',
      title: `Cast ${a.clickerGoal} spells`,
      n: a.clickerCount,
      goal: a.clickerGoal,
      hint: '15x influence per click',
      icon: 'ui-reward-star',
      iconSrc: './assets/ui/reward-star.png',
    },
    {
      id: 'meta',
      title: `Earn ${a.achievementGoal} Rewards`,
      n: a.achievementCount,
      goal: a.achievementGoal,
      hint: hoursHint(1),
      icon: 'ui-reward-trophy',
      iconSrc: './assets/ui/reward-trophy.png',
    },
    {
      id: 'login',
      title: `Log in for ${a.loginGoal} days`,
      n: a.loginCount,
      goal: a.loginGoal,
      hint: hoursHint(1),
      icon: 'ui-reward-notepad',
      iconSrc: './assets/ui/reward-notepad.png',
    },
    {
      id: 'story',
      title: 'Finish the Story',
      n: a.storyCount,
      goal: a.storyGoal,
      hint: hoursHint(10),
      icon: 'ui-reward-portal',
      iconSrc: './assets/ui/reward-portal.png',
    },
  ];
  return rows.sort((a, b) => Number(b.n >= b.goal) - Number(a.n >= a.goal));
}

export function rewardsHtml(
  ctx: GameContext,
  subTab: RewardsSubTab = 'milestones',
): string {
  const unlockedSet = new Set(ctx.state.unlockedAchievements);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;
  const anyClaimable = ctx.economy.anyClaimable(ctx.state);
  const tabs = `<div class="rewards-tabs" role="tablist">
    <button type="button" class="rewards-tab${subTab === 'milestones' ? ' is-on' : ''}" data-rewards-tab="milestones">
      <span>Milestones</span>
      ${anyClaimable ? '<span class="rewards-tab-dot">!</span>' : ''}
    </button>
    <button type="button" class="rewards-tab${subTab === 'achievements' ? ' is-on' : ''}" data-rewards-tab="achievements">
      <span>Achievements</span>
      <span class="rewards-tab-count">${unlockedCount}/${ACHIEVEMENTS.length}</span>
    </button>
  </div>`;

  if (subTab === 'achievements') {
    const sorted = [...ACHIEVEMENTS].sort(
      (a, b) => Number(unlockedSet.has(b.id)) - Number(unlockedSet.has(a.id)),
    );
    const rows = sorted
      .map((ach) => {
        const unlocked = unlockedSet.has(ach.id);
        const cls = `scroll-card ach-row ${unlocked ? 'is-unlocked scroll-card-active' : 'is-locked'}`;
        return `<div class="${cls}" data-ach="${ach.id}">
          <img src="${ach.icon}" alt="" />
          <div>
            <div class="reward-title">${ach.title}</div>
            <div class="reward-hint">${ach.description}</div>
          </div>
          <span class="ach-pill ${unlocked ? 'unlocked' : 'locked'}">${unlocked ? 'Unlocked' : 'Locked'}</span>
        </div>`;
      })
      .join('');
    return `<section class="scroll-modal"><p class="scroll-kicker">Hall of Trophies</p><h2 class="scroll-title">Achievements</h2>${tabs}<div class="scroll-body">${rows}</div></section>`;
  }

  const body = rewardRows(ctx)
    .map((row) => {
      const ready = row.n >= row.goal;
      const cls = `scroll-card reward-row${ready ? ' scroll-card-claim' : ''}`;
      const action = ready
        ? `<button type="button" class="claim-btn" data-claim="${row.id}">Claim</button>`
        : `<div class="reward-frac">${row.n}/${row.goal}</div>`;
      const bar = ready
        ? ''
        : `<div class="reward-bar"><span style="width:${Math.min(100, (row.n / Math.max(1, row.goal)) * 100)}%"></span></div>`;
      return `<div class="${cls}" data-reward="${row.id}" data-icon="${row.icon}">
        <img src="${row.iconSrc}" alt="" />
        <div>
          <div class="reward-title">${row.title}</div>
          <div class="reward-hint">${row.hint}</div>
          ${bar}
        </div>
        ${action}
      </div>`;
    })
    .join('');
  return `<section class="scroll-modal"><p class="scroll-kicker">Milestones</p><h2 class="scroll-title">Rewards</h2>${tabs}<div class="scroll-body">${body}</div></section>`;
}

export function bindRewards(
  root: HTMLElement,
  onClaim: (id: RewardId, meta: Pick<AchievementClaimInfo, 'title' | 'description' | 'iconKey'>) => void,
  onSubTab: (subTab: RewardsSubTab) => void,
): void {
  root.querySelectorAll<HTMLElement>('[data-rewards-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subTab = btn.dataset.rewardsTab as RewardsSubTab;
      if (subTab) onSubTab(subTab);
    });
  });
  root.querySelectorAll<HTMLElement>('[data-claim]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.claim as RewardId;
      const card = btn.closest<HTMLElement>('[data-reward]');
      if (!id || !card) return;
      onClaim(id, {
        title: card.querySelector('.reward-title')?.textContent ?? '',
        description: card.querySelector('.reward-hint')?.textContent ?? '',
        iconKey: card.dataset.icon ?? '',
      });
    });
  });
}

export function claimInfo(
  id: RewardId,
  ctx: GameContext,
  meta: Pick<AchievementClaimInfo, 'title' | 'description' | 'iconKey'>,
): AchievementClaimInfo {
  const { influence, clickerIncrement } = ctx.state;
  const passive = ctx.economy.passivePerSecond(ctx.state);
  let before: string;
  let after: string;
  switch (id) {
    case 'helper':
      before = `${formatNumber(passive / 3)}/sec`;
      after = `${formatNumber(passive)}/sec`;
      break;
    case 'clicker':
      before = `${formatNumber(clickerIncrement / 15)}/click`;
      after = `${formatNumber(clickerIncrement)}/click`;
      break;
    case 'story': {
      const grant = passive * 36000;
      before = formatNumber(influence - grant);
      after = formatNumber(influence);
      break;
    }
    default: {
      const grant = passive * 3600;
      before = formatNumber(influence - grant);
      after = formatNumber(influence);
    }
  }
  return { id, ...meta, before, after };
}

export function creditsHtml(): string {
  const pairs = CREDITS.flatMap(([role, people]) =>
    people.map((name, i) => `<span class="credits-role">${i === 0 ? role : ''}</span><span class="credits-name">${name}</span>`),
  ).join('');
  return modal(
    'The Company of the Path',
    'Credits',
    `<p class="credits-wordmark">Xal's Path</p>
    <p class="credits-author-wrap"><a href="${SITE}" target="_blank" rel="noopener noreferrer" class="scroll-kicker credits-author-link">Created By Kevin Logan ↗</a></p>
    <div class="credits-list">${pairs}</div>
    <div class="splash-actions">
      <button type="button" class="ritual-btn" data-credits-feedback>Share Feedback</button>
      <button type="button" class="scroll-card back-btn" data-credits-close>Close</button>
    </div>`,
  );
}

export function chapterHtml(chapter: ChapterDef, locked: boolean): string {
  const mana = chapter.id >= 2 && chapter.id <= 4;
  return `<button type="button" class="scroll-card chapter-card${locked ? ' is-locked' : ''}" data-chapter ${locked ? 'disabled' : ''}>
    <img src="./assets/ui/Portal2.png" alt="" />
    <div>
      <div class="chapter-kicker">Chapter ${chapter.id}</div>
      <div class="chapter-name">${chapter.name}</div>
    </div>
    <div>
      ${locked ? `<div class="tome-cost">Lvl ${chapter.levelRequirement}</div>` : ''}
      ${mana ? '<div class="reward-hint">2x mana</div>' : ''}
    </div>
  </button>`;
}

const REGION_TITLES: Record<RegionId, string> = {
  meadow: 'The Meadows',
  river: 'Galia River',
  altar: 'Sci Nai Mountains',
};

export function unlockedCreatureCount(ctx: GameContext): number {
  return ctx.spawn.creatures.filter((c) => {
    const h = ctx.state.helpers.find((x) => x.id === c.helperId);
    return (h?.amountOwned ?? 0) > 0;
  }).length;
}

export function bestiaryHtml(ctx: GameContext): string {
  const regions: RegionId[] = ['meadow', 'river', 'altar'];
  const total = ctx.spawn.creatures.length;
  const cleansed = unlockedCreatureCount(ctx);

  const sections = regions
    .map((region) => {
      const list = ctx.spawn.creatures.filter((c) => c.region === region);
      const regionUnlocked = list.filter((c) => {
        const h = ctx.state.helpers.find((x) => x.id === c.helperId);
        return (h?.amountOwned ?? 0) > 0;
      }).length;
      const rows = list
        .map((c) => {
          const def = ctx.economy.def(c.helperId);
          const save = ctx.state.helpers.find((h) => h.id === c.helperId);
          const unlockLevel = def?.unlockLevel ?? 1;
          const helperName = def?.name ?? c.helperId;
          const isUnlocked = (save?.amountOwned ?? 0) > 0;
          const isTomeUnlocked = ctx.state.playerLevel >= unlockLevel;
          const cls = `scroll-card bestiary-row ${
            isUnlocked ? 'is-unlocked scroll-card-active' : isTomeUnlocked ? 'is-silhouette' : 'is-locked'
          }`;
          const run = creatureRun(c.id);
          const thumb =
            (isUnlocked || isTomeUnlocked) && run
              ? `<img data-bestiary-thumb="${c.id}" src="${run.src}" alt="" />`
              : `<span class="tome-art is-lock" style="width:38px;height:38px;background-image:url('./assets/ui/lock-sheet.png')"></span>`;
          const title = isUnlocked ? c.name : '???';
          const sub = isUnlocked
            ? `${helperName} Tome • Tap to read lore`
            : isTomeUnlocked
              ? `Summon via ${helperName} Tome`
              : `Unlocks at Level ${unlockLevel}`;
          const side = isUnlocked
            ? `<img class="bestiary-tome-icon" src="./assets/ui/tomes/${c.helperId}.png" alt="" />`
            : `<div class="tome-cost">${isTomeUnlocked ? 'Unsummoned' : `Lvl ${unlockLevel}`}</div>`;
          return `<button type="button" class="${cls}" data-bestiary-creature="${c.id}" ${isUnlocked ? '' : 'disabled'}>
            <div class="bestiary-thumb-box">${thumb}</div>
            <div>
              <div class="bestiary-name">${title}</div>
              <div class="bestiary-sub">${sub}</div>
            </div>
            ${side}
          </button>`;
        })
        .join('');
      return `<p class="scroll-section">${REGION_TITLES[region]} (${regionUnlocked}/${list.length})</p>${rows}`;
    })
    .join('');

  return `<section class="scroll-modal">
    <p class="scroll-kicker">Sanctum Chronicles • ${cleansed} / ${total} Cleansed</p>
    <h2 class="scroll-title">Bestiarum</h2>
    <div class="scroll-body">${sections}</div>
    <div class="splash-actions" style="margin-top:10px">
      <button type="button" class="scroll-card back-btn" data-bestiary-close style="width:100%">Back</button>
    </div>
  </section>`;
}

export function bindBestiary(
  root: HTMLElement,
  ctx: GameContext,
  onSelect: (creature: CreatureDef) => void,
  onClose: () => void,
): void {
  root.querySelectorAll<HTMLImageElement>('[data-bestiary-thumb]').forEach((img) => {
    const id = img.dataset.bestiaryThumb;
    const run = id ? creatureRun(id) : null;
    const frame = run?.frames[0];
    if (!run || !frame) return;
    const boxSize = 48;
    const max = Math.max(...run.frames.flatMap((f) => [f.w, f.h]));
    const scale = boxSize / max;
    const apply = () => {
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      img.style.width = `${sw}px`;
      img.style.height = `${sh}px`;
      img.style.maxWidth = 'none';
      img.style.position = 'absolute';
      img.style.left = `${(boxSize - frame.w * scale) / 2 - frame.x * scale}px`;
      img.style.top = `${(boxSize - frame.h * scale) / 2 - frame.y * scale}px`;
      img.style.clipPath = `inset(${frame.y * scale}px ${sw - (frame.x + frame.w) * scale}px ${sh - (frame.y + frame.h) * scale}px ${frame.x * scale}px)`;
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  });

  root.querySelectorAll<HTMLElement>('[data-bestiary-creature]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.bestiaryCreature;
      const creature = id && ctx.spawn.creatures.find((c) => c.id === id);
      if (creature) onSelect(creature);
    });
  });

  root.querySelector('[data-bestiary-close]')?.addEventListener('click', onClose);
}

export const NAV: { id: TabId; label: string; icon: string }[] = [
  { id: 'settings', label: 'Settings', icon: './assets/ui/Gear.png' },
  { id: 'achievements', label: 'Rewards', icon: './assets/ui/trophy.png' },
  { id: 'outlook', label: 'Outlook', icon: './assets/ui/OutlookFlower.png' },
  { id: 'scene', label: 'Xal', icon: './assets/ui/Portal2.png' },
  { id: 'shop', label: 'Tomes', icon: './assets/ui/Tomes.png' },
];
