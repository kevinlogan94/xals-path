---
title: 'Creature unlock splash'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: '4378568e673912900b27f55831814f395b056af6'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
warnings: ['oversized']
---

<intent-contract>

## Intent

**Problem:** First tome purchase only toasts; Unity shows lock unlock then a New Creature Unlocked splash with the creature running.

**Approach:** On first helper purchase, open creature splash: short lock unlock beat, then title/name/description/Back with looping run animation from Unity sheets.

## Boundaries & Constraints

**Always:** Little code; detail pack copy; first purchase only (`amountOwned === 1` after buy); run animation required; use `elk-run` for elk; Back closes.

**Block If:** Cannot play any run frames for the purchased creature.

**Never:** Ads/survey; full Outlook walk-cycle rewrite; invent descriptions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| First buy | amountOwned becomes 1 | Lock anim → creature panel with run loop | Missing sheet → still show text + Back |
| Repeat buy | amountOwned > 1 | No splash (toast optional skip) | — |
| Back | tap | Close splash | — |

</intent-contract>

## Code Map

- `phaser/src/scenes/play/tomes/TomesPanel.ts` -- buy trigger
- `phaser/src/scenes/play/splash/SplashView.ts` -- shell
- `phaser/src/data/creatures.json` -- descriptions + ids
- `phaser/public/assets/ui/lock-sheet.png`, `creatures/*` -- art
- `phaser/src/scenes/PreloadScene.ts` -- may need spritesheet loads

## Tasks & Acceptance

**Execution:**
- [x] Preload lock sheet frames + creature run spritesheets (minimal frame map) -- animatable textures
- [x] `play/splash/creatureSplash.ts` -- lock then UI with run anim + copy -- feature UI
- [x] TomesPanel/PlayScene -- on first buy open creature splash instead of toast -- trigger

**Acceptance Criteria:**
- Given first tome unlock, when buy succeeds, then splash shows lock unlock then running creature with name/description
- Given Back, when tapped, then splash closes
- Given second purchase of same tome, when buy succeeds, then no creature splash

## Spec Change Log

## Review Triage Log

| Severity | Issue | Fix |
|----------|-------|-----|
| critical | Lock spritesheet `margin:12` + `frameHeight:540` on 550px image → 0 columns | Load `ui-lock-sheet` as image; manual frames at x 12/362/712/1062/1412 |
| critical | Shop `rerender()` → `setTab` dismisses splash opened before rerender | TomesPanel: `rerender()` then `onCreatureUnlock` |
| high | Missing lock frames should not block splash | Skip lock beat; show creature panel immediately |
| high | Missing creature id in PlayScene silent no-op | Toast fallback |
| high | Griffin run anim uses all sheet frames | `frameCount: 11` |

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` -- expected: clean

## Auto Run Result

- Summary: Creature unlock splash with lock beat + run loop; first-buy trigger from Tomes.
- Patched lock frame atlas + rerender ordering.
- Follow-up review recommended: true
