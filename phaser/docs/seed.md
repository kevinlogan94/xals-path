# Xal's Path Web — Project Seed (Law)

**Status:** Locked. Non-negotiable for this remake.  
**Owner:** Kevin  
**Engine:** Phaser 3 + Vite + TypeScript (web-only)

## Reference Source

- This monorepo is the workspace — do **not** use a separate `xals-path-web` or `reference/` clone.
- Unity reference: [`../unity/`](../../unity/) (sibling folder in this repo)
- Prefer remaster art and content already present under `unity/` / ported into `public/assets/`

## Locked Decisions

### Stack
- Pure greenfield remake on **Phaser 3 + Vite + TypeScript**
- NOT a Unity port / not embedding Unity
- Web-only v1; **localStorage** saves
- Prefer remaster art and content from the Unity tree when available

### DROP
- Ads / rewarded video
- Game Center / Google Play Games
- CloudOnce
- ATT / tracking prompts
- Analytics
- Old binary save migration
- Social follow / store review achievement hooks
- Separate experiment repo / `reference/xals-path` checkout

### KEEP
- 7-chapter story (quotes + expressions from Unity)
- Level gates: **1 / 5 / 10 / 20 / 30** (ch 5–7 gate at 30)
- Tutorial + banter
- Barlog chapter 6 special presentation
- BAM backgrounds: meadow → river → altar
- Portal + end game flow
- Click influence (mana-gated casts)
- 10 helpers (Nature → Void) with cost ×1.3
- Level-up (XP from total influence; max 50)
- Buffs (200 clicks → 15s infinite mana)
- Creature spawns tied to owned helpers + region
- Offline earnings (cap 10h)
- Local achievements (clicker, helper, login, story — no ad/social)
- Soundtrack + SFX from Unity reference

### Architecture
- Scenes + systems (Economy, Story, Save, Audio, Spawn)
- JSON/TS data under `src/data/`
- Play hub + bottom nav
- No singleton soup — systems owned by a game context / registry

### Phases
0. Bootstrap (monorepo + BMAD + seed)
1. Clicker slice
2. Story
3. Full economy / world
4. Art / audio polish
5. Ship web / PWA

## Scope Rule

Do not invent features outside KEEP. When uncertain, choose the simplest option consistent with this seed and the `unity/` reference.
