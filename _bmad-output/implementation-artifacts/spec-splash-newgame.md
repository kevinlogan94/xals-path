---
title: 'NewGame splash confirm'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: '9170e1f090ff9f87e662424942961124cf5a798c'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-shell.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Settings New Game resets immediately with a toast; Unity shows a confirm splash first.

**Approach:** Open the shared splash shell with New Game copy and Start/Back; only reset on confirm.

## Boundaries & Constraints

**Always:** Little code; use SplashView; copy from detail pack; Play Pop via shell close.

**Block If:** Splash shell API missing.

**Never:** Ads/survey; redesign Settings panel chrome beyond the hook; wipe save on Back.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Open | Settings New Game tap | Splash shows title/body + Start/Back | — |
| Back | Back tap | Splash closes; save unchanged | — |
| Confirm | Start a New Game | Reset save; close splash; return to early game state | — |

</intent-contract>

## Code Map

- `phaser/src/scenes/play/splash/SplashView.ts` -- shell
- `phaser/src/scenes/PlayScene.ts` -- onNewGame
- `phaser/src/scenes/play/settings/SettingsPanel.ts` -- New Game button
- `phaser/src/scenes/play/ui/ImageButton.ts`, `textStyles.ts` -- UI helpers

## Tasks & Acceptance

**Execution:**
- [x] `phaser/src/scenes/play/splash/newGameSplash.ts` (or inline builder) -- build New Game content -- confirm UI
- [x] `phaser/src/scenes/PlayScene.ts` -- onNewGame opens splash; confirm runs existing reset path -- wire trigger

**Acceptance Criteria:**
- Given Settings New Game, when tapped, then splash appears and save is not yet cleared
- Given Back, when tapped, then splash closes and progress remains
- Given Start a New Game, when tapped, then save resets like today and splash closes

## Spec Change Log

## Review Triage Log

### 2026-07-31 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 2: (medium 2)
- defer: 2: (low 2)
- reject: 0
- addressed_findings:
  - `[medium]` `[patch]` Avoid double pop: confirm uses dismiss then setTab; reset lastBuff

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` -- expected: clean

## Auto Run Result

- Summary: New Game confirm splash before reset.
- Follow-up review recommended: false
