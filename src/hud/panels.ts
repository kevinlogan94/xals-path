import type { GameContext } from '../game/GameContext';
import type { ChapterDef, GameSave, TabId } from '../types';
import { formatNumber } from '../utils/format';
import { devPresets } from '../systems/SaveSystem';

const GITHUB = 'https://github.com/kevinlogan94/xals-path';
const COFFEE = 'https://buymeacoffee.com/kevinmlogan';
const SITE = 'https://kevinmlogan.com';

export type RewardId = 'helper' | 'clicker' | 'meta' | 'login' | 'story';

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
      <button type="button" class="scroll-card about-btn" data-about="credits">Credits</button>
      <button type="button" class="scroll-card about-btn" data-about="github">GitHub</button>
      <button type="button" class="scroll-card about-btn" data-about="coffee">Coffee</button>
      <button type="button" class="scroll-card about-btn" data-about="site">Site</button>
    </div>
    <button type="button" class="ritual-btn" data-new-game>New Game</button>
    ${extra}`,
  );
}

export function bindSettings(
  root: HTMLElement,
  ctx: GameContext,
  handlers: {
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
      if (id === 'credits') handlers.onCredits();
      if (id === 'github') openUrl(GITHUB);
      if (id === 'coffee') openUrl(COFFEE);
      if (id === 'site') openUrl(SITE);
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
        <img class="tome-art" src="${locked ? './assets/ui/lock.png' : `./assets/ui/tomes/${def.id}.png`}" alt="" />
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
    const img = row.querySelector<HTMLImageElement>('.tome-art');
    if (img) img.src = locked ? './assets/ui/lock.png' : `./assets/ui/tomes/${def.id}.png`;
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

export function rewardsHtml(ctx: GameContext): string {
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
  return modal('Milestones', 'Rewards', body);
}

export function bindRewards(
  root: HTMLElement,
  onClaim: (id: RewardId, meta: Pick<AchievementClaimInfo, 'title' | 'description' | 'iconKey'>) => void,
): void {
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
    <p class="scroll-kicker">Created By Kevin Logan</p>
    <div class="credits-list">${pairs}</div>
    <button type="button" class="ritual-btn" data-credits-close>Close</button>`,
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

export const NAV: { id: TabId; label: string; icon: string }[] = [
  { id: 'settings', label: 'Settings', icon: './assets/ui/Gear.png' },
  { id: 'achievements', label: 'Rewards', icon: './assets/ui/trophy.png' },
  { id: 'outlook', label: 'Outlook', icon: './assets/ui/OutlookFlower.png' },
  { id: 'scene', label: 'Xal', icon: './assets/ui/Portal2.png' },
  { id: 'shop', label: 'Tomes', icon: './assets/ui/Tomes.png' },
];
