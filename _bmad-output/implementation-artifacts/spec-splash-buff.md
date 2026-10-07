---
title: 'Buff splash'
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

**Problem:** Buff threshold auto-applies 15s infinite mana + toast; Unity shows Blessing splash and grants on Collect only.

**Approach:** `buffOfferPending` flag on threshold; splash on pending; `acceptBuffOffer` grants `buffDurationSeconds` on Collect. No ad/2x button.

## Boundaries & Constraints

**Always:** Little code; detail pack copy; Collect grants buff then closes; pending until Collect; reopen splash if dismissed while pending.

**Block If:** Changing buff click threshold math without parity note.

**Never:** Collect 2x / rewarded ad path.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Threshold hit | 200th click, !buffedThisLevel | `buffOfferPending=true`; no `buffRemaining` | — |
| Splash open | pending && !isOpen | Buff splash once per pending cycle | — |
| Collect | Collect tap | `acceptBuffOffer`; 15s buff; buff sfx; close | — |
| Dismiss w/o Collect | setTab / dismiss | pending stays; reopen next update | — |
| Buff ends | buffRemaining → 0 | debuff sfx (unchanged) | — |

</intent-contract>

## Code Map

- `phaser/src/types.ts` — `buffOfferPending`
- `phaser/src/systems/SaveSystem.ts` — default + merge
- `phaser/src/systems/EconomySystem.ts` — `afterClick`, `acceptBuffOffer`
- `phaser/src/scenes/play/splash/buffSplash.ts` — builder
- `phaser/src/scenes/PlayScene.ts` — pending check; remove offer toast

## Tasks & Acceptance

**Execution:**
- [x] `buffOfferPending` on GameSave + SaveSystem
- [x] `afterClick` sets pending; no auto `buffRemaining`
- [x] `acceptBuffOffer(state)` — grant 15s, clear pending
- [x] `buildBuffSplash` — Collect-only; detail pack copy
- [x] PlayScene — open when pending && !isOpen; Collect sfx; no offer toast

**Acceptance Criteria:**
- Given 200 clicks without buff this level, when threshold hit, then splash opens and mana is not yet infinite
- Given Collect, when tapped, then 15s buff starts and splash closes
- Given dismiss without Collect, when update runs, then splash reopens while pending

## Spec Change Log

## Review Triage Log

| Issue | Fix |
|-------|-----|
| Auto buff + toast at threshold | Offer flag + Collect-only grant |
| setTab dismisses splash | Pending persists; reopen on update |

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` — expected: clean

## Auto Run Result

- Summary: Buff Collect splash with `buffOfferPending`; grant on Collect only.
- Follow-up review recommended: false
