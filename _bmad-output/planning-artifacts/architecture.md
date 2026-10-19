# Architecture — Xal's Path Web

**Stack:** Phaser 3 + Vite + TypeScript  
**Law:** [`docs/seed.md`](../docs/seed.md)  
**Reference:** `unity/` (monorepo sibling)

## Goals

- Simple folder layout, no singleton soup
- Data-driven content (JSON) separated from systems
- Play hub with bottom nav; scene facade stays thin with scene-local views co-located

## Folder structure

```
src/
  main.ts                 # Phaser.Game bootstrap
  types.ts                # shared types + save shape
  data/                   # chapters, helpers, creatures, economy
  game/GameContext.ts     # owns systems + mutable save state
  systems/                # Economy, Story, Save, Audio, Spawn
  scenes/                 # Boot, Preload, Play facade
    play/                 # Play-only HUD, nav, panels, map/outlook UI helpers
  utils/format.ts
public/assets/            # backgrounds, xal, creatures, audio
docs/seed.md
unity/                   # Unity reference (monorepo sibling)
_bmad-output/             # BMAD planning + implementation artifacts
```

## Scene graph

```
Boot → Preload → Play
                   ├ Outlook  (BAM world: cast, creatures, region BGM)
                   ├ Map      (Xal tower: portrait, chapters, banter)
                   ├ Tomes    (shop cards — emblems, cost, owned, /sec)
                   ├ Rewards  (achievement cards + claim flow)
                   └ Settings (mute, portal travel after story, reset)
```

Bottom nav matches Unity order. Re-tapping the active tab returns to Outlook.
Dialogue runs on Map; economy keeps ticking everywhere.

## Systems

| System | Responsibility |
|--------|----------------|
| **SaveSystem** | localStorage load/save/merge defaults; key `xals-path-web-save-v1` |
| **EconomySystem** | cast/mana, passive, shop buys, level-up, buffs, achievements math, offline |
| **StorySystem** | chapter gates, quote advance, region advance on `"It is done."`, portal unlock |
| **AudioSystem** | BGM swap (theme / Barlog / region), SFX, mute |
| **SpawnSystem** | region-eligible creature spawns from owned helpers |

`GameContext` constructs systems once and holds `state: GameSave`. Scenes call `getContext()` — a single factory, not scattered globals.

## Save format (v1)

```ts
{
  version: 1,
  influence, totalInfluenceEarned, playerLevel, experienceRequired,
  clickerIncrement,
  mana, manaMax, manaLevel,
  region, unlockedRegions, portalUnlocked,
  helpers: [{ id, amountOwned, dynamicCost, dynamicIncrement }],
  chapters: [{ id, sceneViewed }],
  achievements: {
    clicker*, helper*, video*, achievement* (meta), login*, story*
  },
  buffedThisLevel, buffClickProgress, buffRemaining,
  savedAt: ISO string
}
```

No ad flags, cloud IDs, or binary migration.

## Data schemas

- `chapters.json` — id, name, levelRequirement, speaker, quotes[{text, expression}]
- `helpers.json` — id, name, unlockLevel, cost, increment, creatureId, region + costMultiplier
- `creatures.json` — id, name, helperId, region
- `economy.json` — numeric constants matching Unity `develop` balance

## UI principles

- Mobile-first vertical layout; BAM background full-bleed behind playfield
- Bottom nav always visible
- Quote box above nav during story
- Number formatting: K / mill / bill / trill

## Out of scope

Unity managers, CloudOnce, ads, analytics — never imported into `src/`.
