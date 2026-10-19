---
title: 'InfluenceOverTime splash'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: 'cd8ddf83ea725957a9f232ef02a66652d92e8ceb'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Offline influence is auto-applied with a toast; Unity shows Influence Earned splash and grants on Collect.

**Approach:** Keep pending offline amount, show splash on PlayScene start when pending > 0, grant on Collect only.

## Boundaries & Constraints

**Always:** Little code; detail pack copy; Collect grants then closes; skip splash if reward ≤ 0; ch1 viewed gate already in applyOffline.

**Block If:** Changing offline math would break saves without a clear path.

**Never:** Ads/survey; background-resume dual-path parity beyond cold-start splash (defer silent background path).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pending > 0 | Load with offline earnings | Splash shows amount; influence not yet added | — |
| Collect | Collect tap | Grant pending; clear pending; close | — |
| Pending 0 | No offline | No splash | — |

</intent-contract>

## Code Map

- `phaser/src/game/GameContext.ts` -- offlineGained
- `phaser/src/systems/EconomySystem.ts` -- applyOffline currently grants immediately
- `phaser/src/scenes/PlayScene.ts` -- toast stand-in
- `phaser/src/scenes/play/splash/SplashView.ts` -- shell

## Tasks & Acceptance

**Execution:**
- [x] `EconomySystem.applyOffline` -- compute pending without granting (or split compute/apply) -- Collect-only grant
- [x] `PlayScene` + splash builder -- replace toast with InfluenceOverTime splash -- UI parity
- [x] Collect handler -- addInfluence(pending); clear; close -- grant path

**Acceptance Criteria:**
- Given offline earnings on load, when PlayScene starts, then splash shows and wallet has not yet received the amount
- Given Collect, when tapped, then influence increases by pending and splash closes
- Given zero offline, when starting, then no splash

## Spec Change Log

## Review Triage Log

| Issue | Fix |
|-------|-----|
| Splash opened before `setTab()` — `setTab` dismisses open splash | Open IOT splash after initial `setTab` calls |
| Immediate `persist()` after `applyOffline` burned offline window on reload | `pendingOffline` on `GameSave`; `applyOffline` stores pending instead of recomputing |
| Collect did not clear `pendingOffline` | Collect sets `state.pendingOffline = 0` |
| `reset()` left stale `offlineGained` | `GameContext.reset()` sets `offlineGained = 0` |

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` -- expected: clean

## Auto Run Result

- Summary: Offline Collect splash with pendingOffline persistence; open after setTab.
- Follow-up review recommended: false
