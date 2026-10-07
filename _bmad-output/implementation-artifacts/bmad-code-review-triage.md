# BMAD Code Review — Triage

**Workflow:** `gds-code-review`  
**Target:** `main...HEAD` TypeScript remake (`src/**/*.ts`)  
**Mode:** full (seed + epics + GDD + architecture)  
**Date:** 2026-07-15  
**Layers:** Blind Hunter ✅ | Edge Case Hunter ✅ | Acceptance Auditor ✅

## Summary

| Bucket | Count |
|--------|------:|
| patch | 12 |
| defer | 4 |
| dismiss | 3 |
| decision_needed | 0 |

## Patch (implement now)

1. **Creature tap exploit + double cast** (blind+edge+auditor) — despawn/disable on tap; exclude creature hits from cast; optional mana/clicker parity simplified as despawn + no double cast
2. **BAM visual lag on `"It is done."`** (auditor) — call `applyRegionVisual` (+ region BGM) when region changes mid-dialogue
3. **Free travel before portal** (auditor) — More→Travel only if `portalUnlocked`
4. **Login day-1 never counts** (blind+auditor) — new save: `lastLoginDay` empty or count first day
5. **Story achievement skips level-up** (edge+auditor) — grant via `EconomySystem.addInfluence`
6. **Offline double-grant window** (edge) — persist immediately after applying offline
7. **Resize / restart leaks** (blind+edge) — clear spawns; don't stack visibility listeners; recreate/reattach audio safely
8. **Achievement while goal<=0 hang** (edge) — clamp goals to ≥1
9. **Save setItem throws** (blind+edge) — try/catch persist
10. **Quote box / nav on story start** (blind) — hide quote on tab change; use `setTab('play')` when starting chapter; portal toast only on first unlock
11. **Shop touch scroll** (auditor) — pointer drag scroll in addition to wheel
12. **Minimal end/portal UX** (auditor KEEP) — after all chapters: end splash text + portal travel entry from Play/More clearly gated

## Defer

- Guided Nature/Outlook pointer tour (STATUS)
- Creature walk / Xal idle animation layers (STATUS)
- UTC vs local login day (STATUS)
- Full end-credits cinematic parity with Unity splash

## Dismiss

- “Singleton contradicts no-singleton-soup” — factory is intentional; document only
- shockedDown → shocked_side mapping — matches available remaster art filenames
- Achievement SFX never played — polish, not KEEP break

## Next

Story `6-1-review-patch-cycle` → `gds` game-dev implement → re-review.
