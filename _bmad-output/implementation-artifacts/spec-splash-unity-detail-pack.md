---
title: 'Splash Unity detail pack'
type: 'chore'
created: '2026-07-31'
status: 'done'
baseline_revision: '2a36e3ccea2bc4314b1a97c649665fe7ecb1f089'
final_revision: 'bccce741aaa382afedcca427302d5c7fc498ea48'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/AGENTS.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Phaser has no splash system; later agents need one Unity-derived detail pack so they do not re-open Unity.

**Approach:** Write a single compact detail pack covering splash types we will port (exclude ads/survey), with triggers, copy, assets, logic, and Phaser gaps.

## Boundaries & Constraints

**Always:** Prefer little content; exact Unity asset paths; Creature lock→run animation + descriptions; English; docs under `_bmad-output/implementation-artifacts/`.

**Block If:** Cannot verify a required splash type’s trigger or primary art path from the repo.

**Never:** Implement Phaser splash UI; port Advertisement or Survey; invent missing copy; import Unity C# into Phaser.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Pack written | Unity Splash + triggers readable | `splash-unity-detail-pack.md` lists all 7 types + asset map + creature anim notes | Halt if a type cannot be documented from repo |
| Exclusions | Ads/Survey exist in Unity | Pack explicitly marks them out of scope | Do not document as build work |

</intent-contract>

## Code Map

- `unity/Assets/Scripts/Splash/SplashManager.cs` -- shell + SplashType router
- `unity/Assets/Scripts/Splash/*.cs` + `Portal/` -- panel behaviors
- `unity/Assets/Resources/SplashArt/` -- splash panel art
- `unity/Assets/Resources/Game/Characters/Creatures/` -- run sheets
- `unity/Assets/ScriptableObjects/Creatures/` -- names/descriptions/anim enums
- `unity/Assets/Scripts/AnimationEvents/Lock.cs` + `Animation/Lock/` -- unlock beat
- `phaser/src/scenes/PlayScene.ts` -- toast stand-ins
- `phaser/src/data/creatures.json` -- missing descriptions; still-image preload

## Tasks & Acceptance

**Execution:**
- [x] `_bmad-output/implementation-artifacts/splash-unity-detail-pack.md` -- create compact pack for Creature, Achievement, InfluenceOverTime, Buff, EndGame, NewGame, Portal -- single source for later segments
- [x] Same file -- include Unity→Phaser asset copy table, creature sheet/frame notes, descriptions source, Phaser toast gaps -- so asset/shell agents need no Unity re-scan

**Acceptance Criteria:**
- Given the pack exists, when a later agent opens it, then each of the 7 types has trigger, copy/buttons, assets, special logic, and Phaser stand-in
- Given Creature section, when read, then lock sequence, run animation sheets, and SO descriptions are covered
- Given ads/survey, when scanning the pack, then they are listed as excluded only

## Spec Change Log

## Review Triage Log

### 2026-07-31 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 18: (high 4, medium 10, low 4)
- defer: 0
- reject: 0
- addressed_findings:
  - `[high]` `[patch]` CloseSplash/NewGame/Lock, Name lookup, lock/elk slice accuracy, sheet→id map
  - `[medium]` `[patch]` chapter matrix, IOT dual path, portal/buff edges, stacked splash, placeholders
  - `[low]` `[patch]` orphan sheets, raiju canonical, SplashArt default

## Verification

**Manual checks (if no CLI):**
- Pack file exists and is readable; every required type present; no Phaser splash UI code changes in this segment


## Auto Run Result

- Summary: Wrote Unity splash detail pack for 7 types (ads/survey excluded); patched after Grok review.
- Files: `_bmad-output/implementation-artifacts/splash-unity-detail-pack.md`, `spec-splash-unity-detail-pack.md`
- Review: 18 patches applied; 0 deferred; follow-up review not recommended
- Verification: pack readable; 7 types + asset map present; no Phaser UI code
- Residual risks: some Unity sprite rects still need meta verification at asset-port time
