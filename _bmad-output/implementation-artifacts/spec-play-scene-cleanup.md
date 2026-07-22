---
title: 'PlayScene co-location cleanup'
type: 'refactor'
created: '2026-07-22'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '56a4216c104a2108221ce6c2ea1563f5d1b46de0'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/phaser/_bmad-output/planning-artifacts/architecture.md'
warnings:
  - oversized
---

<intent-contract>

## Intent

**Problem:** Nearly all play UI lives in monolithic `PlayScene.ts` (~1258 lines), blocking parallel agents and duplicating panel/button/text/scroll patterns.

**Approach:** Behavior-preserving split of scene-local UI under `phaser/src/scenes/play/` per AGENTS co-location; extract tiny shared helpers only; no visual/feature parity work.

## Boundaries & Constraints

**Always:**
- Keep scene-specific UI under `phaser/src/scenes/`; systems stay in `phaser/src/systems/`
- Behavior-preserving: same tabs, layouts, copy, mute toggles, scroll, badges, chapter card rules as today
- Prefer little code; match existing Phaser patterns
- `PlayScene` remains the registered scene facade (`main.ts` import path unchanged)

**Block If:**
- A split would require changing player-visible behavior to compile

**Never:**
- Unity UI parity fixes (Settings sliders, Rewards 6-card grid, badge semantics, etc.)
- Unit tests, Unity imports, ads/analytics/CloudOnce
- New UI frameworks or speculative abstractions beyond the listed helpers
- Moving UI into `systems/`
- Backwards-compat shims

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Tab switch | Open Settings/Rewards/Tomes/Map/Outlook | Same panels and chrome as pre-split | No error |
| Tab re-tap | Active tab clicked again | Returns to Outlook | No error |
| Tomes scroll | Drag/wheel on Tomes list | Scroll + thumb behave as before; `shopScroll` persists across re-render | No error |
| Buy / claim / mute / new game | Existing interactions | Same economy/audio/save side effects | Toasts unchanged |
| Resize | Scale resize event | Scene restart + layout rebuild as before | No error |

</intent-contract>

## Code Map

- `phaser/src/scenes/PlayScene.ts` — monolith to thin orchestrator (lifecycle, tab routing, update tick, callbacks)
- `phaser/src/scenes/PreloadScene.ts` — dead asset audit (`ui-scene-bg`, `ui-mana-bar`, unused nav/trophy/portal variants, `barlog` image)
- `phaser/src/main.ts` — keep importing `./scenes/PlayScene`
- `phaser/src/systems/SpawnSystem.ts` — creature keys still loaded; do not break spawn textures
- `phaser/_bmad-output/planning-artifacts/architecture.md` — stale Goals/More labels + folder tree
- `phaser/STATUS.md` — note cleanup structure when done

## Tasks & Acceptance

**Execution:**
- [x] `phaser/src/scenes/play/ui/constants.ts` -- export `FONT`, `NAV_H`, colors/panel metrics used by play UI -- single source for magic numbers
- [x] `phaser/src/scenes/play/ui/textStyles.ts` -- shared Press Start text style factories (stroke white/dark labels) -- kill duplicated style literals
- [x] `phaser/src/scenes/play/ui/ImageButton.ts` -- image + centered label + hit area helper -- replace Settings `mkImgBtn` and Rewards Receive button construction
- [x] `phaser/src/scenes/play/ui/FramedPanel.ts` -- extract `addFramedPanel` (dim + panel + banner + list geometry) -- Settings/Rewards/Tomes share one builder
- [x] `phaser/src/scenes/play/ui/ScrollList.ts` -- extract Tomes drag/wheel/mask/thumb scroll; TomesPanel consumes it -- one scroll implementation (Rewards wiring deferred to later parity work)
- [x] `phaser/src/scenes/play/ui/fit.ts` -- extract `fitInBox` aspect-true image helper -- shared by Tomes/badges/nav icons
- [x] `phaser/src/scenes/play/ui/Badge.ts` -- exclaim badge create/show helper using `fit.ts` -- shared badge placement
- [x] `phaser/src/scenes/play/hud/HudView.ts` -- move `buildHud`/`refreshHud` -- co-locate HUD
- [x] `phaser/src/scenes/play/nav/BottomNav.ts` -- move `NAV`, `buildNav`, active-state updates, rewards badge placement -- co-locate nav
- [x] `phaser/src/scenes/play/outlook/OutlookView.ts` -- bg fit, cast/spawn bounds helpers used by PlayScene -- co-locate Outlook
- [x] `phaser/src/scenes/play/map/{MapView,ChapterCard,QuoteBox}.ts` -- portrait/expressions, chapter card, quote box -- co-locate Map
- [x] `phaser/src/scenes/play/tomes/{TomesPanel,TomeRow}.ts` -- move `renderShop` + row build -- co-locate Tomes
- [x] `phaser/src/scenes/play/rewards/{RewardsPanel,RewardCard}.ts` -- move `renderAchievements` + card build -- co-locate Rewards
- [x] `phaser/src/scenes/play/settings/SettingsPanel.ts` -- move `renderSettings` -- co-locate Settings
- [x] `phaser/src/scenes/PlayScene.ts` -- thin orchestrator wiring views; preserve `setTab` panel clear lifecycle and callbacks -- behavior-preserving facade
- [x] `phaser/src/scenes/PreloadScene.ts` -- remove truly unused texture loads (keep spawn/creature/audio needs) -- preload matches runtime
- [x] `phaser/_bmad-output/planning-artifacts/architecture.md` + `phaser/STATUS.md` -- document new `scenes/play/` layout; fix Goals/More → Settings/Rewards/Map/Tomes -- docs match code

**Acceptance Criteria:**
- Given a mid-game save, when switching all five tabs, then HUD/nav/panels/chapter card/quote/tomes scroll match pre-refactor behavior
- Given Tomes open with overflow, when dragging/wheeling, then scroll position and thumb still work
- Given `npm run typecheck` and `npm run build` in `phaser/`, when run after the split, then both succeed
- Given the new tree, when inspecting imports, then no play UI modules live under `systems/` and `main.ts` still loads `PlayScene`
- Given PreloadScene, when auditing keys, then no texture is loaded solely for dead PlayScene references

## Spec Change Log

## Review Triage Log

### 2026-07-22 — Verification pass
- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

## Design Notes

PlayScene keeps ownership of: `ctx`, `tab`, `panel` container lifecycle (`removeAll` on tab change), persistence/resize, `update` economy tick, and callback bridges (`showToast`, `setTab`, buy/claim/mute). Extracted views receive `scene` + callbacks; avoid reading fragile `panel.list[0]` without documenting the dim overlay contract in `FramedPanel`.

Do not implement Rewards scrolling in this refactor — only extract `ScrollList` and use it from Tomes so a later parity PR can adopt it.

## Verification

**Commands:**
- `cd phaser && npm run typecheck` -- expected: exit 0
- `cd phaser && npm run build` -- expected: exit 0

**Manual checks (if no CLI):**
- Smoke each tab in `npm run dev` (Settings toggles, Tomes scroll/buy toast, Rewards Receive disabled alpha, Map chapter card, Outlook cast) — no visible regressions

## Auto Run Result

Status: done

Summary: Split PlayScene UI into co-located `src/scenes/play/` modules while preserving PlayScene as the lifecycle/tab/callback facade.

Files changed:
- `phaser/src/scenes/PlayScene.ts` — thin orchestrator for lifecycle, tabs, persistence, story/economy callbacks, and view wiring.
- `phaser/src/scenes/play/**` — extracted play-only UI helpers and views.
- `phaser/src/scenes/PreloadScene.ts` — removed dead image loads no runtime module references.
- `phaser/_bmad-output/planning-artifacts/architecture.md` — documented `scenes/play/` and current tab labels.
- `phaser/STATUS.md` — documented the cleanup structure.

Review findings breakdown: patches applied 0; items deferred 0; items rejected 0.

Verification performed:
- `cd phaser && npm run typecheck` — exit 0
- `cd phaser && npm run build` — exit 0

Residual risks: visual parity was preserved by code inspection and build/typecheck; no manual browser smoke was run.
