---
title: 'Unity visual parity — Settings, Rewards, HUD/nav, Map, Tomes, Outlook'
type: 'feature'
created: '2026-07-22'
status: 'done'
review_loop_iteration: 1
followup_review_recommended: false
baseline_revision: 'dcb63fa0ae05b329eca2355fd4b8aa198cdcca10'
final_revision: '24134a4a3827ecd0cb97bb1f2190c40e0b0e1c05'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/phaser/docs/unity-phaser-ui-parity.md'
  - '{project-root}/phaser/_bmad-output/planning-artifacts/architecture.md'
warnings:
  - multiple-goals
  - oversized
---

<intent-contract>

## Intent

**Problem:** After co-location cleanup, Phaser UI still diverges from Unity screenshots on Settings controls/buttons, Rewards card set/copy/scroll/aspect, HUD/nav badge semantics, Map chapter-card fields, Tomes affordability badge, and creature aspect.

**Approach:** Implement Part A **P0/P1** tasks from `phaser/docs/unity-phaser-ui-parity.md` against the co-located `scenes/play/**` modules; stub projections without an ads SDK; defer P2 polish.

## Boundaries & Constraints

**Always:**
- Remake stays in `phaser/`; Unity is reference only (assets/behavior, no Unity script imports)
- Prefer little code; edit co-located play modules, not a new framework
- Bottom nav order remains Settings → Rewards → Outlook → Map → Tomes; re-tap → Outlook
- Mute remains boolean BGM/SFX (Unity has no continuous volume API)
- Projections card works without Unity Ads / analytics / CloudOnce

**Block If:**
- Required UI art for mute-line / scrollbar / mana bar is missing from `phaser/public/assets` and cannot be copied from `unity/Assets/Resources/Pixel/`

**Never:**
- Unit tests
- Import Unity managers, CloudOnce, ads SDKs, analytics
- P2 work: tutorials, walk-cycles, Barlog overlay, news/crystal, achievement jingle, nine-slice cloud polish, first-tome splash
- Backwards-compat shims for old Settings portal-in-settings UX

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Settings mute | Tap BGM or SFX black mute control / speaker | Toggles mute; speaker icon updates; no blue On/Off button | No error |
| Settings buttons | Open Settings | Green Achievements, blue Credits, orange New Game; no portal row | Credits opens panel/modal (not toast-only) |
| Achievements btn | Tap Achievements in Settings | Opens Rewards tab (web stand-in for platform achievements) | No error |
| Rewards grid | Open Rewards mid-game | 6 cards, readable frames, scroll when needed, `Rewards:` copy + live influence for time rewards | Claim only when `n >= goal` |
| Projections stub | Tap Watch on projections card (or in-card watch action) | Increments `videoCount` without ads SDK | Cap/claim via normal Receive flow |
| HUD `!` | Next chapter unlocked, not reading, level ≠ 1 | Level-cloud `!` visible | Hidden otherwise |
| Tomes `!` | Affordable unlocked helper and story idle | Tomes nav `!` visible | Hidden when unaffordable / mid-chapter |
| Map locked ch 2–4 | Chapter locked | Card shows `Lvl X` **and** `2x Mana Increase` | Unlocked clears Lvl text, keeps reward text for 2–4 |
| Creatures | Spawn on Outlook | Aspect-true sizing (no forced 96×72 squash) | No error |

</intent-contract>

## Code Map

- `phaser/docs/unity-phaser-ui-parity.md` — canonical P0/P1 checklist
- `phaser/src/scenes/play/settings/SettingsPanel.ts` — audio rows + button set
- `phaser/src/scenes/play/rewards/{RewardsPanel,RewardCard}.ts` — 6-card grid, copy, aspect, scroll
- `phaser/src/scenes/play/ui/ScrollList.ts` — Rewards scroll + Tomes thumb
- `phaser/src/scenes/play/ui/Badge.ts` / `fit.ts` — badge aspect
- `phaser/src/scenes/play/hud/HudView.ts` — chapter-ready `!`; mana bar art
- `phaser/src/scenes/play/nav/BottomNav.ts` — Rewards + Tomes badges; nav frame aspect
- `phaser/src/scenes/play/map/ChapterCard.ts` — Lvl + 2x Mana together when locked
- `phaser/src/scenes/PlayScene.ts` — wire Settings→Rewards, portal rehome, badge refresh
- `phaser/src/systems/{EconomySystem,SaveSystem}.ts` + `types.ts` + `data/economy.json` — video + meta achievement goals
- `phaser/src/systems/SpawnSystem.ts` — creature aspect-true size
- `phaser/src/scenes/PreloadScene.ts` — mana-bar / scrollbar art; Scene.png dropped
- `phaser/_bmad-output/planning-artifacts/architecture.md` — save shape note

## Tasks & Acceptance

**Execution:**
- [x] `phaser/src/scenes/play/settings/SettingsPanel.ts` -- Unity audio rows (label + speaker + black mute line toggle); buttons Achievements green → Credits blue → New Game orange; remove portal sealed/portal buttons -- Settings screenshot parity
- [x] `phaser/src/scenes/PlayScene.ts` -- Achievements opens Rewards tab; Credits opens a real credits panel/modal; rehome portal travel to Map/Outlook after unlock (not Settings) -- S3–S5 wiring
- [x] `phaser/src/types.ts` + `phaser/src/data/economy.json` + `phaser/src/systems/SaveSystem.ts` -- add `videoGoal/videoCount` (start 5) and `achievementGoal/achievementCount` (start 10); merge defaults -- R2 schema
- [x] `phaser/src/systems/EconomySystem.ts` -- claimVideo (10h influence), claimMeta/earn-rewards (1h); double goals on claim; increment meta count when other rewards claim -- R2/R6 economy
- [x] `phaser/src/scenes/play/rewards/{RewardCard,RewardsPanel}.ts` + `ui/ScrollList.ts` -- 6 cards (Helper, Clicker, Video, Earn Rewards, Login, Story), readable frames, scroll+thumb, `Rewards:` copy + live influence amounts, projections stub progress -- R1–R6
- [x] `phaser/src/scenes/play/map/ChapterCard.ts` -- when locked show Lvl **and** `2x Mana Increase` for chapters 2–4; tighten card density -- M1–M2
- [x] `phaser/src/scenes/play/hud/HudView.ts` + `PreloadScene.ts` -- HUD `!` = chapter ready (Unity rule); use mana-bar art if available -- H1–H2
- [x] `phaser/src/scenes/play/ui/Badge.ts` -- keep square display for exclaim (no tall-asset squash) -- H3
- [x] `phaser/src/scenes/play/nav/BottomNav.ts` + `PlayScene.ts` -- Tomes affordability `!` + Rewards claim `!`; reduce nav frame stretch -- N1/N3/T1
- [x] `phaser/src/scenes/play/ui/ScrollList.ts` -- vertical scrollbar thumb without distorting horizontal `scrollBar.png` -- T2
- [x] `phaser/src/systems/SpawnSystem.ts` -- aspect-true creature display size -- O1
- [x] `phaser/src/scenes/PreloadScene.ts` + `play/map/MapView.ts` -- drop unused `Scene.png` -- M3
- [x] `phaser/_bmad-output/planning-artifacts/architecture.md` + `phaser/STATUS.md` -- document new achievement fields; point remaining polish to P2 list -- docs

**Acceptance Criteria:**
- Given Settings open, when comparing to Unity screenshot, then mute rows are speaker + black line (not blue On/Off) and buttons are Achievements / Credits / New Game in green / blue / orange with no portal block
- Given Rewards open with overflow progress, when viewing, then six cards scroll with readable frames and Unity-like `Rewards:` copy
- Given projections stub used enough times, when Receive is ready, then claim grants ~10h influence and goal doubles (cumulative watches kept)
- Given next chapter unlocked and not reading, when on any tab, then level-cloud `!` shows; Tomes `!` shows only when a helper is affordable
- Given locked Chapter 3 at Lvl 6, when Map open, then card shows Searching, Lvl 10, and 2x Mana Increase together
- Given Outlook spawns, when creatures appear, then sprites keep source aspect ratio
- Given `npm run typecheck` and `npm run build`, when run, then both exit 0

## Spec Change Log

- 2026-07-22: Step-04 review patches — drag/claim, Unity video/meta claim math, reward card layout, credits singleton, portal vs chapter card, mana fill rect, Scene.png removed, goal clamps, New Game scroll reset.

## Review Triage Log

| Finding | Severity | Disposition | Notes |
|---------|----------|-------------|-------|
| Rewards drag blocks Receive; Watch on pointerdown | high | fixed | `ImageButton` → `pointerup`; `ScrollList.resetDrag`; Watch/Receive guard `wasDrag` |
| video/meta claim subtracts counts | medium | fixed | Match Unity: keep cumulative counts; double goal; meta `++` after claim |
| Reward content below short aspect frame | medium | fixed | Stretch achiev-box to readable slot; left-align title; newline influence hints |
| Credits modal stacks; dim no dismiss | medium | fixed | Named singleton + dim/Close dismiss |
| Portal bar overlaps chapter card | medium | fixed | Hide portal while chapter card visible |
| Mana fill squashes `mana-bar.png` | medium | fixed | Track image + rectangle fill |
| New Game leaves scroll offsets | low | fixed | Reset `shopScroll` / `rewardsScroll` |
| Save goals can be 0 | low | fixed | `Math.max(1, …)` on goal merge |
| Unused `Scene.png` | low | fixed | Deleted asset; docs/STATUS updated |
| Accidental distillate md in tree | low | fixed | Removed `unity-phaser-ui-parity-distillate.md` |

## Design Notes

**Projections stub:** In-card Watch increments `videoCount` by 1 with toast — no ad network. Receive claims when `videoCount >= videoGoal` without resetting cumulative watches.

**Portal rehome:** After story unlock, portal region travel is on Map — hidden while the chapter card is showing.

**Card order:** Helper, Clicker, Video, Earn Rewards, Login, Story (Unity screenshot grid).

## Verification

**Commands:**
- `cd phaser && npm run typecheck` -- expected: exit 0
- `cd phaser && npm run build` -- expected: exit 0

**Manual checks (if no CLI):**
- Capture Settings / Rewards / Map-locked / Tomes-with-badge / Outlook creature screens under `/opt/cursor/artifacts/` or `phaser/docs/parity-screens/` and confirm checklist fields


## Auto Run Result

- typecheck: exit 0
- build: exit 0
- P0/P1 execution tasks completed; P2 deferred per spec
- Step-04 review patches applied; smoke captures under `/opt/cursor/artifacts/parity-r2-*.png`
- Deferred residuals (P2 only): claim jingle, nine-slice clouds, Barlog overlay, walk-cycles, news/crystal, tutorials
