---
title: 'Splash shell open/close'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: '06839373945eab64c8b48de6dc1f3e46570853e2'
final_revision: '59c8f396dfbb6373e738de82eaaddd4021f1cc28'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Phaser has no shared splash overlay router; panel segments need one place to open/close.

**Approach:** Add a minimal splash shell (dim + SplashPixlrBigger + content host) with `open`/`close`, single-instance replace, Pop on close, wired from PlayScene for later panels.

## Boundaries & Constraints

**Always:** Little code; colocate under `phaser/src/scenes/play/splash/`; use `ui-splash-lg`; play `pop` on close; only one splash at a time.

**Block If:** Cannot access PlayScene parent container for overlay depth.

**Never:** Implement typed panel contents (NewGame/Creature/etc.); ads/survey; Unity singletons; large abstraction layers.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| open | type + optional payload | Prior splash destroyed; dim+panel shown; content builder runs | Missing builder → empty content host still dismissible |
| open while open | second open | Replace prior (no stack) | Always dismissible |
| close | user/API | Destroy overlay; play pop | Idempotent if already closed |

</intent-contract>

## Code Map

- `phaser/src/scenes/play/settings/CreditsModal.ts` -- overlay pattern to mirror
- `phaser/src/scenes/PlayScene.ts` -- owns root UI; wire splash helper
- `phaser/src/scenes/play/ui/constants.ts` -- NAV_H / layout
- `phaser/public/assets/ui/splash/SplashPixlrBigger.png` -- default panel art (`ui-splash-lg`)

## Tasks & Acceptance

**Execution:**
- [x] `phaser/src/scenes/play/splash/SplashView.ts` -- minimal open/close shell with type registry hook for content builders -- shared router
- [x] `phaser/src/scenes/PlayScene.ts` -- construct splash helper / expose open+close for later segments -- call sites ready
- [x] Optional tiny types for SplashType union (exclude ads/survey) -- match detail pack

**Acceptance Criteria:**
- Given PlayScene, when `splash.open('newGame')` with a temp builder or empty, then dim + `ui-splash-lg` show above gameplay and only one instance exists
- Given close, when called, then overlay gone and pop SFX plays
- Given this segment, when reviewing diff, then no NewGame/Creature/Buff/etc panel UI beyond a stub/empty content area

## Spec Change Log

## Review Triage Log

### Pass 1 — review patch (2026-07-31)

| # | Finding | Fix |
|---|---------|-----|
| 1 | Dim only covered play area; nav clickable under splash | Full-screen dim (`h`), panel stays centered in play area |
| 2 | `getFrame(PANEL_KEY)` unsafe if missing / zero width | Guard `textures.exists` + `frame?.width`; skip panel image |
| 3 | Tall panel could exceed `playH` | `displayH = Math.min(scaled, playH)` |
| 4 | No payload hook for later panels | `data?: unknown` on `SplashOpenOpts` |
| 5 | Splash lingered across tab changes | `setTab` dismisses when `splash.isOpen()` |
| 6 | `build` throw left orphan overlay | `try/catch` destroys overlay before rethrow |

**Patches:** 6 applied (SplashView 4, PlayScene 1, spec 1). No dim tap-to-close (Unity Back only).

## Design Notes

Mirror CreditsModal: named container, destroy prior, dim blocks taps. Content builders registered later by panel segments; shell may accept an optional `build(content, api)` callback in open payload for now.

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` -- expected: clean (or project’s existing check)

**Manual checks (if no CLI):**
- Grep shows SplashView open/close; no full panel implementations

## Auto Run Result

- Summary: Minimal splash shell open/close with ui-splash-lg; wired in PlayScene.
- Review patches: full-screen dim, texture guard, clamp, data opt, setTab dismiss, build throw safety.
- Follow-up review recommended: false
