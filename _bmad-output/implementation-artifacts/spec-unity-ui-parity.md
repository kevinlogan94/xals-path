---
title: 'Unity UI parity — portrait frame + chrome'
type: 'feature'
created: '2026-07-21'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
baseline_revision: 'c5572ec8362858c15437383b0c10ea25ae2284c3'
context:
  - '{project-root}/phaser/docs/seed.md'
  - '{project-root}/AGENTS.md'
warnings:
  - multiple-goals
---

<intent-contract>

## Intent

**Problem:** The Phaser remake plays in landscape desktop mode with text-only HUD/nav and flat overlays; Unity is portrait mobile with cloud HUD, icon nav, and wooden panel chrome.

**Approach:** Lock a portrait FIT frame, copy missing Unity UI art, and restyle PlayScene HUD/nav/panels to match Unity screenshots with minimal code (no new scene graph).

## Boundaries & Constraints

**Always:**
- Remake stays in `phaser/`; Unity is reference only (copy assets, do not import Unity scripts)
- Portrait letterbox on desktop; game design size fixed (390×844)
- Bottom nav order: Settings → Rewards → Outlook → Map → Tomes (Unity order)
- KEEP/DROP from `phaser/docs/seed.md` (no CloudOnce Achievements button, no ads)
- Prefer little code; match existing PlayScene patterns

**Block If:**
- Required Unity PNG sources missing under `unity/Assets/Resources/Pixel/`

**Never:**
- Unit tests
- Import Unity managers / CloudOnce / ads / analytics into `phaser/src/`
- Backwards-compat shims for old landscape layout
- New abstraction layers or UI frameworks

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Desktop wide window | Browser wider than 390:844 | Game letterboxed portrait, centered | No error |
| Tall narrow phone | ~390×844 viewport | Game fills height/width via FIT | No error |
| Tab re-tap | Active tab clicked again | Returns to Outlook | No error |
| BGM mute only | Toggle BGM off | Music stops; SFX still play | No error |
| Locked chapter | Level below requirement | Chapter card shows lock + Lvl gate | No error |

</intent-contract>

## Code Map

- `phaser/src/main.ts` — scale mode, design size, pixelArt
- `phaser/index.html` — letterbox page background
- `phaser/src/scenes/PlayScene.ts` — HUD, nav, Settings/Rewards/Tomes/Scene chrome
- `phaser/src/scenes/PreloadScene.ts` — load new UI textures
- `phaser/src/systems/AudioSystem.ts` — separate BGM / SFX mute
- `phaser/public/assets/ui/` — destination for Unity chrome copies
- `unity/Assets/Resources/Pixel/` — source art

## Tasks & Acceptance

**Execution:**
- [x] `phaser/public/assets/ui/**` -- Copy missing Unity Pixel chrome (clouds, nav icons, banner, speakers, buttons, manaIcon, QuoteBox, Scene.png, scrollBar) -- need art for parity
- [x] `phaser/src/main.ts` + `phaser/index.html` -- FIT 390×844, pixelArt true, dark letterbox body -- force mobile portrait frame
- [x] `phaser/src/scenes/PreloadScene.ts` -- Register new UI keys -- so PlayScene can draw chrome
- [x] `phaser/src/systems/AudioSystem.ts` -- Split muteBgm / muteSfx (replace single muted) -- Settings needs two toggles
- [x] `phaser/src/scenes/PlayScene.ts` -- Cloud HUD; icon nav (correct order + labels); framed Settings/Rewards/Tomes; chapter card on Map; use panel banner -- match Unity screenshots
- [x] `phaser/STATUS.md` -- Note portrait + chrome parity pass -- keep status honest

**Acceptance Criteria:**
- Given a wide desktop browser, when the game loads, then the playfield is a centered portrait letterbox (~9:16), not full-bleed landscape
- Given any tab, when viewing HUD, then influence sits in a left cloud (icon + total + /sec) and level/XP/mana sit in a right cloud with bars
- Given bottom nav, when inspecting order, then it is Settings, Rewards, Outlook, Map, Tomes with icons (not More/Goals/Xal text-only order)
- Given Settings tab, when opened, then framed Settings panel shows BGM toggle, SFX toggle, Credits stub, New Game — no CloudOnce Achievements
- Given Rewards tab, when opened, then framed panel lists achievement-style rows with progress (not a raw stats dump titled Goals)
- Given Tomes tab, when opened, then list sits under a Tomes banner inside framed panel chrome
- Given Map tab with unread chapter, when viewing, then a chapter card (lock/title/lvl/reward) appears instead of only a text button over meadow
- Given `npm run typecheck` in `phaser/`, when run, then it exits 0

## Design Notes

**Nav labels** match user Unity screenshots (Settings / Rewards / Outlook / Map / Tomes), even though some older remake docs said More/Goals/Xal.

**Minimal framing helper** inside PlayScene: one private method builds banner + panel from `ui-panel` / `ui-banner` rather than a new UI module.

**Rewards rows:** local achievements only (clicker, helper, login, story) — seed DROP for video/social. Show progress + claim affordance if economy already supports claim; otherwise progress display is enough for this pass.

**Scene background:** when Map tab active, show `Scene.png` (or hide meadow behind full portrait); Outlook keeps BAM backgrounds.

## Verification

**Commands:**
- `cd phaser && npm run typecheck` -- expected: exit 0
- `cd phaser && npm run build` -- expected: exit 0

**Manual checks (if no CLI):**
- Screenshot portrait FIT on 1280×720 and 390×844; verify HUD clouds, icon nav order, Settings/Rewards/Tomes frames


## Auto Run Result

**Status:** done

**Summary:** Locked Phaser remake to portrait FIT 390×844 with Unity chrome — cloud HUD, icon nav (Settings→Rewards→Outlook→Map→Tomes), framed Settings/Rewards/Tomes, Map scene background + chapter cards, split BGM/SFX mute. Review patches hardened audio mute and chapter hit targets.

**Files changed:**
- `phaser/src/main.ts` — FIT portrait + pixelArt
- `phaser/index.html` — letterbox page chrome
- `phaser/src/scenes/PlayScene.ts` — HUD/nav/panels/chapter card
- `phaser/src/scenes/PreloadScene.ts` — UI texture keys
- `phaser/src/systems/AudioSystem.ts` — muteBgm/muteSfx + desired track
- `phaser/public/assets/ui/**` — Unity Pixel chrome copies
- `phaser/STATUS.md` — parity status

**Review:** 7 patches applied; 4 deferred; 6 rejected (letterbox intentional, etc.)

**Follow-up review recommended:** false

**Verification:** `npm run typecheck` pass; `npm run build` pass; manual puppeteer screenshots on 1280×720 letterbox and 390×844 phone for Map/Outlook/Tomes/Rewards/Settings

**Residual risks:** Mute prefs not persisted; Tomes scrollbar chrome not drawn; chapter card art still simple rect vs Unity prefab sprites
