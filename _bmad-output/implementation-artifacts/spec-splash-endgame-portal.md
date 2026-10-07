---
title: 'EndGame and Portal splash'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: 'ea839c91fea8b8c8b0e8c8e8c8e8c8e8c8e8c8e8'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Chapter 7 finish toasts only; portal unlock toasts — Unity shows EndGame splash (Credits) and Portal splash (short message + Back). Map portal bar already handles travel.

**Approach:** `buildEndGameSplash(onCredits)` and `buildPortalSplash()`; PlayScene triggers on ch7 finish and `portalJustUnlocked` (non-ch7 path).

## Boundaries & Constraints

**Always:** Little code; detail pack copy; Credits → close splash + `showCreditsModal`; Portal Back only (no teleport UI in splash).

**Block If:** Rebuilding portal region picker in splash.

**Never:** Ad/credits Unity transition beyond existing modal.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ch 7 finish | story complete | EndGame: Congratulations + thank you; Credits + Back | — |
| Credits tap | EndGame open | Close splash; showCreditsModal | — |
| Back | tap | Close splash | — |
| Portal unlock | portalJustUnlocked, not ch7 | Portal splash; toast replaced | ch7 → EndGame only |
| Portal Back | tap | Close; use map portal bar | — |

</intent-contract>

## Code Map

- `phaser/src/scenes/play/splash/endGameSplash.ts` — Congratulations + Credits/Back
- `phaser/src/scenes/play/splash/portalSplash.ts` — portal opened message + Back
- `phaser/src/scenes/PlayScene.ts` — ch7 EndGame; portalJustUnlocked splash
- `phaser/src/scenes/play/settings/CreditsModal.ts` — existing credits overlay

## Tasks & Acceptance

**Execution:**
- [x] `endGameSplash.ts` — detail pack copy; Credits closes + modal
- [x] `portalSplash.ts` — toast replacement copy + Back
- [x] PlayScene — ch7 → endGame; portalJustUnlocked → portal (skip if ch7)

**Acceptance Criteria:**
- Given chapter 7 story finish, when dialogue ends, then EndGame splash with Credits and Back
- Given Credits, when tapped, then splash closes and credits modal opens
- Given portal first unlock (non-ch7 edge), when unlocked, then portal splash not toast
- Given ch7 finish with portal unlock, when dialogue ends, then EndGame only (no duplicate portal splash)

## Spec Change Log

## Review Triage Log

| Issue | Fix |
|-------|-----|
| Portal toast only | Portal splash on portalJustUnlocked |
| ch7 + portal same event | EndGame takes priority over portal splash |

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` — expected: clean

## Auto Run Result

- Summary: EndGame splash on ch7; Portal splash replaces unlock toast.
- Follow-up review recommended: false
