---
type: bmad-distillate
sources:
  - unity-phaser-ui-parity.md
  - ../src/scenes/play/**
  - ../src/scenes/PlayScene.ts
  - ../src/scenes/PreloadScene.ts
  - ../src/types.ts
  - ../src/systems/{EconomySystem,SaveSystem,SpawnSystem}.ts
  - ../src/data/economy.json
  - ../_bmad-output/planning-artifacts/architecture.md
downstream_consumer: Phaser Unity visual-parity after play/ CLEAN
created: 2026-07-22
token_estimate: 950
parts: 1
---

# Unity visual parity — post-CLEAN implement plan

CLEAN done: thin `/workspace/phaser/src/scenes/PlayScene.ts` orchestrates; UI under `/workspace/phaser/src/scenes/play/`. Do not re-monolith. Keep Tomes geometry, nav order, FIT 390×844, Press Start 2P.

## 1. Files per P0/P1 task

**Settings** — `/workspace/phaser/src/scenes/play/settings/SettingsPanel.ts` (+ `ui/ImageButton.ts`, PlayScene wiring)
- S1: label + speaker + black mute bar; drop blue On/Off; mute via `/workspace/phaser/src/systems/AudioSystem.ts` booleans only (Unity AudioManager mute, no volume slider)
- S2: green Achievements → blue Credits → orange New Game
- S3: Achievements interactive (route `setTab('achievements')` or stub)
- S4: Credits modal (FramedPanel), not toast
- S5: remove portal block; keep travel on PlayScene `onPortalTravel` from Outlook/Map after unlock

**Rewards** — `play/rewards/RewardCard.ts`, `RewardsPanel.ts`, `ui/ScrollList.ts`, `ui/fit.ts`
- R1: aspect-true `ui-achiev-box` (840×260), stop tall squash
- R2: add Watch projections + Earn N Rewards (§2)
- R3: ScrollList for grid overflow
- R4: `Rewards:` prefix; time rewards show `(X influence)` via `passivePerSecond`
- R5: order Helper → Clicker → Video → Earn Rewards → Login → Story
- R6: projections progress without ads SDK (§3)

**Map** — `play/map/ChapterCard.ts`, `MapView.ts`, `PreloadScene.ts`
- M1: locked ch 2–4 show Lvl **and** `2x Mana Increase` (Unity ChapterButton reward text independent of lock)
- M2: card size/typography density
- M3: `Scene.png` on disk unused/unloaded — preload as base under Xal or leave out (no dead key)

**Tomes/HUD/Nav/Outlook**
- T1: `play/nav/BottomNav.ts` + PlayScene refresh — Tomes `!` when helper affordable & not mid-story (Unity ShopManager)
- T2: ScrollList — fix horizontal `scrollBar.png` as vertical thumb
- H1: `play/hud/HudView.ts` — cloud `!` = chapter ready (level≥next, not reading, level≠1), not mana/buff
- H2: HudView + Preload — `mana-bar.png` exists, unloaded; replace flat rects
- H3: `play/ui/Badge.ts` — aspect-true `exclaim.png` (180×400), stop square squash
- N1: BottomNav — stop 85×85→slotW×44 frame squash
- N2: confirm `portal-nav.png` silhouette vs Unity Portal2
- N3: both Rewards-claim and Tomes-afford badges
- O1: `/workspace/phaser/src/systems/SpawnSystem.ts` — `fitInBox` instead of forced 96×72

## 2. Save/schema (R2)

Unity defaults: videoGoal **5**, AchievementGoal **10**; double on claim; video = **10h** influence; meta = **1h**; other claims ++ `CurrentAchievementAmount`.

Extend `AchievementSave` in `/workspace/phaser/src/types.ts`: `videoGoal/videoCount`, `achievementGoal/achievementCount`.

Defaults in `/workspace/phaser/src/data/economy.json` + `/workspace/phaser/src/systems/SaveSystem.ts` create/merge.

`/workspace/phaser/src/systems/EconomySystem.ts`: `claimVideo`/`claimMeta`; bump meta count on other claims; extend `anyClaimable`.

Patch architecture save note: `achievements: { clicker*, helper*, video*, achievement*, login*, story* }`.

## 3. Constrained decisions

- No ads/CloudOnce/analytics in `phaser/src/`
- R6 stub: UI + counters; increment `videoCount` via fake “Watch projection” on card or dev grant behind same hook; document in PR
- Little code; UI stays under `play/`; systems = Economy/Save/Spawn/Audio/Story only
- No tests / no compat shims unless asked

## 4. Defer as P2

S6 spacing; R7–R8 jingle/pressed Receive; M4–M5 Barlog overlay + chapter finger tutorial; T3–T4 tome splash + number collision; O2–O4 walk cycles, news/crystal, cast tutorial; H4 cloud nine-slice; N4 active-tab polish.

## 5. Ownership risks post-CLEAN

- Settings/Credits/Achievements btn → `SettingsPanel.ts`
- Portal must not die in Settings → rehome on Map/Outlook via PlayScene
- Rewards UI → `play/rewards/*` + ScrollList; math → EconomySystem
- Chapter `!` → HudView (wrong today); nav badges → BottomNav (only Rewards refreshed from PlayScene — add Tomes)
- Shared exclaim aspect → Badge.ts; creatures → SpawnSystem; chapter fields → ChapterCard; art keys → PreloadScene
- Risk: ScrollList Tomes-row API needs grid-friendly maxScroll for 6 cards
