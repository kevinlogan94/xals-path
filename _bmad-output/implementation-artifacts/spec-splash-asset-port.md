---
title: 'Splash asset port'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: 'd29844c1da581052fea9891d8fd6f709e82264d5'
final_revision: 'd71bba7953ceffc0a92d7b8336e107d4af802550'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Phaser is missing Unity splash panel art, the unlock lock sheet, correct elk run sheet, and creature descriptions needed before splash UI work.

**Approach:** Copy/fix only the assets and data called out in the splash detail pack; wire preload keys; keep changes minimal.

## Boundaries & Constraints

**Always:** Follow `splash-unity-detail-pack.md`; little code; assets under `phaser/public/assets/`; English.

**Block If:** A required Unity source file is missing from the repo.

**Never:** Build splash UI/panels; port ads/survey; change gameplay systems beyond preload/data needed for assets; overwrite `ui/lock.png` (lvl lock) — add `lock-sheet.png` instead.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Splash art copy | Unity SplashPixlr* present | Files under `phaser/public/assets/ui/splash/` | Halt if source missing |
| Lock sheet | Unity `Pixel/Lock.png` | `ui/lock-sheet.png` added; existing `ui/lock.png` unchanged | Do not replace lvl lock |
| Elk fix | `dark-elk-animation.png` | Replaces wrong `creatures/elk.png` | Keep other creature sheets |
| Descriptions | Unity SO text in detail pack | `creatures.json` gains `description` per creature | Do not invent lore |

</intent-contract>

## Code Map

- `_bmad-output/implementation-artifacts/splash-unity-detail-pack.md` -- asset + description source of truth
- `phaser/public/assets/` -- destination
- `phaser/src/scenes/PreloadScene.ts` -- load new keys
- `phaser/src/data/creatures.json` -- add descriptions
- `phaser/src/types.ts` -- CreatureDef description field if needed

## Tasks & Acceptance

**Execution:**
- [x] `phaser/public/assets/ui/splash/` -- copy SplashPixlr.png, SplashPixlrBigger.png, SplashPixlrBiggerWhite.png from Unity -- panel backgrounds
- [x] `phaser/public/assets/ui/lock-sheet.png` -- copy Unity `Resources/Pixel/Lock.png` -- unlock anim source (do not replace `lock.png`)
- [x] `phaser/public/assets/creatures/elk.png` -- replace with Unity `dark-elk-animation.png` -- correct elk run sheet
- [x] `phaser/src/data/creatures.json` (+ types if needed) -- add descriptions from detail pack -- creature splash copy
- [x] `phaser/src/scenes/PreloadScene.ts` -- preload `ui-splash`, `ui-splash-lg`, `ui-splash-lg-white`, `ui-lock-sheet` -- available to later splash UI

**Acceptance Criteria:**
- Given assets copied, when PreloadScene runs, then splash + lock-sheet keys load without 404
- Given `ui/lock.png`, when inspecting files, then it remains the 130×130 lvl lock art
- Given `creatures.json`, when reading each creature, then `description` matches the detail pack
- Given this segment, when reviewing diff, then no splash open/close UI was added

## Spec Change Log

## Review Triage Log

### 2026-07-31 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 3: (high 1, medium 1, low 1)
- defer: 2: (medium 1, low 1)
- reject: 8
- addressed_findings:
  - `[high]` `[patch]` Split elk still (`elk.png` frame 0) from run sheet (`elk-run.png`) so Outlook spawn is not a full atlas
  - `[medium]` `[patch]` Mark `ui-splash-lg` as default; preload `creature-elk-run`; trim hippocampus trailing space
  - `[low]` `[defer]` Per-frame lock/elk atlas JSON deferred to creature splash segment

## Verification

**Commands:**
- `test -f phaser/public/assets/ui/splash/SplashPixlrBigger.png` -- expected: exists
- `test -f phaser/public/assets/ui/lock-sheet.png && python3 -c "import struct;print(open('phaser/public/assets/ui/lock.png','rb').read(24))"` -- expected: lock.png still small; lock-sheet present

**Manual checks (if no CLI):**
- Diff contains no SplashView/open/close implementation


## Auto Run Result

- Summary: Ported splash art, lock sheet, elk still+run, creature descriptions, preload keys.
- Files: splash PNGs, lock-sheet.png, elk.png, elk-run.png, creatures.json, types.ts, PreloadScene.ts, spec
- Review: patched elk still/run split; deferred full atlas metadata to creature segment
- Follow-up review recommended: false
