---
title: 'Phaser early-game tutorial parity'
type: 'feature'
created: '2026-07-31'
status: 'in-review'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: '2a36e3ccea2bc4314b1a97c649665fe7ecb1f089'
context:
  - phaser/docs/unity-phaser-ui-parity.md
  - phaser/STATUS.md
warnings: []
---

<intent-contract>

## Intent

**Problem:** Phaser has no finger-pointer tutorial, no nav/input scoping during early tutorial, and no post–Chapter-1 gift influence → buy Nature → return to Xal → unlock Outlook tour. New players can leave Map or tap other nav before finishing talk + first purchase.

**Approach:** Add a small `TutorialSystem`, Unity tutorial strings in data, reusable bobbing finger UI from Unity `pointer.png`, and wire nav lock + pointers in `BottomNav` / `PlayScene` / `XalView` / Tomes / Outlook. Pause passive helper income while early tutorial is active (Unity `ShopManager` pattern).

## Boundaries & Constraints

**Always:** Active remake in `phaser/`; scene UI colocated under `phaser/src/scenes/`; shared systems in `phaser/src/systems/`; data in `phaser/src/data/`; match existing Phaser patterns; minimal code; NPC name is Xal; do not import Unity managers into `phaser/src/`.

**Block If:** Unity tutorial strings cannot be sourced from `MainScene.unity`; `pointer.png` missing from Unity assets; nav lock breaks existing mid-game saves in untestable ways.

**Never:** Port Unity manager graph; unit tests unless I/O matrix requires; backwards-compat shims; push or PR from this run.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| FRESH_GAME | New save, ch1 not viewed | Map tab only; other nav hidden/disabled; after ~10s idle on Map, finger on Chapter 1 card | No crash if assets missing — skip pointer |
| CH1_READING | Chapter 1 dialogue active | Nav locked to Map; cannot open Outlook/Shop/Settings/Rewards | Block tab switch silently |
| CH1_COMPLETE | Finish Chapter 1 dialogue | Tutorial starts; Xal shows line 0; tap advances | Gift influence on shop-unlock step |
| SHOP_STEP | Tutorial at shop-unlock step | Tomes nav unlocks; influence gifted ≈ Nature cost; finger on Tomes then Nature row | Buy blocked only by economy rules |
| WAIT_NATURE | Tutorial waiting Nature owned≥1 | Portrait tap does not advance lines; passive income paused | Resume when Nature purchased |
| NATURE_BOUGHT | Nature amountOwned becomes 1 | Shop pointers hide; finger on Xal; lines continue | Auto-advance past wait step |
| TUTORIAL_DONE | All lines shown, Nature owned | Outlook unlocks; fingers on Outlook tab + cast area; passive income resumes; tutorialCompleted saved | Persist on save |
| MID_GAME | ch1 viewed, tutorialCompleted | No nav lock; no tutorial pointers | Normal play |

</intent-contract>

## Code Map

- `phaser/src/systems/TutorialSystem.ts` -- tutorial step/active, gift influence, wait Nature, nav lock rules, passive pause
- `phaser/src/data/tutorial.json` -- Unity `SceneManager.Tutorial` strings from `MainScene.unity`
- `phaser/src/scenes/play/ui/FingerPointer.ts` -- reusable bobbing finger from `ui-pointer`
- `phaser/public/assets/ui/pointer.png` -- copied from `unity/Assets/Resources/Pixel/pointer.png`
- `phaser/src/scenes/play/nav/BottomNav.ts` -- tab lock / hide non-allowed nav
- `phaser/src/scenes/PlayScene.ts` -- wire tutorial lifecycle, pointers, portrait tap routing
- `phaser/src/scenes/play/xal/XalView.ts` -- chapter-card pointer anchor
- `phaser/src/scenes/play/tomes/TomesPanel.ts` -- Nature row pointer when shop open
- `phaser/src/scenes/play/outlook/OutlookView.ts` -- cast-area pointer anchor
- `phaser/src/scenes/PreloadScene.ts` -- load `ui-pointer`
- `phaser/src/types.ts` + `phaser/src/systems/SaveSystem.ts` -- `tutorialCompleted` flag
- `phaser/src/systems/EconomySystem.ts` -- skip passive tick when tutorial pauses

## Tasks & Acceptance

**Execution:**
- [x] `phaser/public/assets/ui/pointer.png` -- copy Unity pointer asset -- visual parity
- [x] `phaser/src/data/tutorial.json` -- add Unity tutorial lines -- dialogue parity
- [x] `phaser/src/systems/TutorialSystem.ts` -- implement step machine, nav lock, gift, wait Nature -- core logic
- [x] `phaser/src/scenes/play/ui/FingerPointer.ts` -- bobbing pointer UI -- reusable finger
- [x] `phaser/src/scenes/PreloadScene.ts` -- load ui-pointer texture
- [x] `phaser/src/types.ts` + `phaser/src/systems/SaveSystem.ts` -- tutorialCompleted on GameSave
- [x] `phaser/src/scenes/play/nav/BottomNav.ts` -- enforce tab lock / hide disallowed tabs
- [x] `phaser/src/scenes/PlayScene.ts` -- wire tutorial start after ch1, pointers, passive pause, portrait tap
- [x] `phaser/src/scenes/play/xal/XalView.ts` -- expose chapter-card pointer position
- [x] `phaser/src/scenes/play/tomes/TomesPanel.ts` -- Nature row pointer hook
- [x] `phaser/src/systems/EconomySystem.ts` -- gate passive income during tutorial pause

**Acceptance Criteria:**
- Given a fresh save, when the game loads, then only Map nav is usable and Outlook/Shop/Settings/Rewards are blocked until Chapter 1 rules allow.
- Given idle on Map before Chapter 1, when ~10 seconds pass, then a bobbing finger appears on the Chapter 1 card.
- Given Chapter 1 dialogue finishes, when tutorial starts, then Xal shows Unity tutorial lines on portrait tap.
- Given tutorial shop-unlock step, when it runs, then influence is gifted to Nature cost and Tomes nav unlocks with finger cues.
- Given tutorial waits for Nature, when passive helpers would earn income, then no passive influence is added until tutorial completes.
- Given Nature is purchased during tutorial, when player returns to Xal, then remaining lines play and Outlook unlocks with finger on Outlook and cast area.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `cd phaser && npm run build` -- expected: TypeScript compiles without errors

**Manual checks (if no CLI):**
- Fresh game: Map only nav; finger on chapter card after delay; complete ch1 → tutorial → buy Nature → Outlook unlock with pointers
