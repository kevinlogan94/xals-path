---
title: 'Splash manager final playtest'
type: 'playtest'
created: '2026-07-31'
status: 'done'
baseline_revision: '79a9913ce5e9cc72596b2e548fa594bb6f6c4a47'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-shell.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-integration.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-newgame.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-influence-over-time.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-buff.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-creature.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-achievement.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-endgame-portal.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Splash manager work spans shell, seven typed builders, asset port, and PlayScene integration — needs a final automated + static playtest pass before sign-off.

**Approach:** Run build/typecheck, static wiring checklist, asset existence, Playwright smoke-load; document manual paths for splashes not triggerable in a cold start.

## Boundaries & Constraints

**Always:** No Advertisement or Survey splash types; single splash instance; gameplay gated while open.

**Block If:** `tsc` or `build` fails; missing splash assets; builder not wired from PlayScene.

**Never:** Add new splash types in this pass; full interactive splash QA without human.

</intent-contract>

## Verification Commands

| Command | Result |
|---------|--------|
| `cd phaser && npx tsc --noEmit` | **PASS** (exit 0) |
| `cd phaser && npm run build` | **PASS** (tsc + vite build, 49 modules, exit 0) |
| `npm run dev` + Playwright smoke load | **PASS** (see Auto Run Result) |

## Static Checklist

### Splash assets (`public/assets/`)

| Asset | Path | Status |
|-------|------|--------|
| SplashPixlr | `ui/splash/SplashPixlr.png` | **PASS** (37 KB) |
| SplashPixlrBigger | `ui/splash/SplashPixlrBigger.png` | **PASS** (57 KB) |
| SplashPixlrBiggerWhite | `ui/splash/SplashPixlrBiggerWhite.png` | **PASS** (60 KB) |
| Lock sheet | `ui/lock-sheet.png` | **PASS** (42 KB) |
| Elk run sheet | `creatures/elk-run.png` | **PASS** (54 KB) |

Preload wiring: `PreloadScene.ts` loads `ui-splash*` keys; `creatureSplash.preloadCreatureSplashAssets` loads lock-sheet + creature run sheets.

### Builder files + PlayScene wiring

| Type | Builder file | `build*Splash` export | `PlayScene` import + `splash.open` |
|------|--------------|----------------------|-----------------------------------|
| Shell | `SplashView.ts` | `createSplash` | `create()` line ~100 |
| NewGame | `newGameSplash.ts` | yes | Settings → `onNewGame()` |
| IOT | `influenceOverTimeSplash.ts` | yes | `create()` when `offlineGained > 0` |
| Creature | `creatureSplash.ts` | yes | TomesPanel `onCreatureUnlock` |
| Buff | `buffSplash.ts` | yes | `update()` when `buffOfferPending && !isOpen()` |
| Achievement | `achievementSplash.ts` | yes | Story ch 2–4 finish + RewardsPanel claim |
| EndGame | `endGameSplash.ts` | yes | Story ch 7 finish |
| Portal | `portalSplash.ts` | yes | Story `portalJustUnlocked` |

`SplashType` union in `SplashView.ts` lists exactly seven types (no ad/survey).

### Input gates (`splash.isOpen()`)

| Location | Purpose | Status |
|----------|---------|--------|
| `pointerdown` (outlook cast) | Block cast during splash | **PASS** |
| `onCreatureTap` | Block creature tap during splash | **PASS** |
| `update` buff offer | Queue buff until splash closed | **PASS** |
| `setTab` | Dismiss splash on nav (buff can reopen) | **PASS** |

### Advertisement / Survey exclusion

| Check | Status |
|-------|--------|
| `grep -ri 'advertisement\|survey' phaser/src` | **PASS** (no matches) |
| `SplashType` union | **PASS** (7 types only) |

## Playwright Smoke Load

- Tool: `playwright@1.62.1` (ephemeral `npm install --no-save`, Chromium headless)
- URL: `http://localhost:5173/` (Vite dev)
- Viewport: 390×844 (matches Phaser scale config)
- Wait: canvas present + 4s settle
- Screenshot: `phaser/_bmad-output/playtest-screenshots/splash-playtest-load.png`
- Canvas: 390×844, title `Xal's Path`
- Console errors: none
- Failed network requests: none
- HTTP asset probes (dev server): all five splash-related assets returned 200

Cold-start screenshot shows Play scene (Chapter 1 card on scene tab) — no splash on default save.

## Manual Playtest Paths (human)

Splashes not auto-triggered on cold load; verify in browser:

| Splash | How to trigger |
|--------|----------------|
| **NewGame** | Settings tab → New Game |
| **IOT** | Set `pendingOffline` / reload with offline gain (or dev save) |
| **Creature** | Shop → buy first tome that unlocks a creature |
| **Buff** | Play until `buffOfferPending` (economy timer) with no other splash open |
| **Achievement** | Achievements tab → claim reward; or finish story chapter 2–4 |
| **EndGame** | Finish chapter 7 story |
| **Portal** | Finish chapter that sets `portalJustUnlocked` |

## Bugs Found / Fixes

None blocking. No code changes required for this playtest pass.

## Auto Run Result

- **Overall: PASS**
- `npx tsc --noEmit`: PASS
- `npm run build`: PASS
- Static asset checklist: PASS (5/5 assets on disk + HTTP 200)
- Builder files exist: PASS (8 files under `phaser/src/scenes/play/splash/`)
- PlayScene wiring: PASS (7 `splash.open` call sites, all builders imported)
- Splash triggers present: PASS (NewGame, IOT, Creature, Buff, Achievement, EndGame, Portal)
- No Advertisement/Survey types: PASS
- Input gates: PASS (4 `isOpen` guard sites)
- Playwright smoke load: PASS (canvas rendered, zero console errors, screenshot captured)
- Playtest-blocking bugs fixed: N/A (none found)
- Follow-up review recommended: false
