# Unity → Phaser UI Parity Review + Cleanup Plan

**Date:** 2026-07-22  
**Branch base:** `phaser-migration`  
**Purpose:** Action list for visual parity with Unity screenshots, plus a cleanup/co-location pass so agents can work safely without fighting a 1,200+ line scene file.

Unity (`unity/`) is **reference only**. Do not import Unity managers, CloudOnce, ads SDKs, or analytics into `phaser/src/`.

---

## How this review was done

1. Ran Phaser locally (`cd phaser && npm install && npm run dev`).
2. Captured live Phaser screens for Settings / Rewards / Map / Tomes / Outlook (fresh + mid-game seeded save).
3. Compared those captures against the Unity phone screenshots provided in session (Settings, Rewards, Map/Hall, Tomes, Outlook).
4. Cross-checked Unity source for behavior that screenshots alone do not explain (`BottomNavManager`, `ChapterButton`, `AchievementManager` + achievement logics, `ShopManager`, `AudioManager`, `SceneManager`).

### Phaser captures in this repo

| Screen | File |
|--------|------|
| Outlook (fresh) | [`parity-screens/02-outlook.png`](parity-screens/02-outlook.png) |
| Settings (fresh) | [`parity-screens/05-settings.png`](parity-screens/05-settings.png) |
| Outlook (seeded Lvl 6) | [`parity-screens/07-outlook-seeded.png`](parity-screens/07-outlook-seeded.png) |
| Tomes (seeded) | [`parity-screens/08-tomes-seeded.png`](parity-screens/08-tomes-seeded.png) |
| Rewards (seeded) | [`parity-screens/09-rewards-seeded.png`](parity-screens/09-rewards-seeded.png) |
| Settings (seeded) | [`parity-screens/10-settings-seeded.png`](parity-screens/10-settings-seeded.png) |
| Map (seeded Chapter 3) | [`parity-screens/11-map-seeded.png`](parity-screens/11-map-seeded.png) |

### Current Phaser shape (baseline)

- Game frame: **390×844**, `FIT`, `pixelArt`, Press Start 2P.
- Almost all play UI lives in **`src/scenes/PlayScene.ts` (~1,258 lines)**.
- Bottom nav order already matches Unity: **Settings → Rewards → Outlook → Map → Tomes**.
- Tomes row geometry is the closest match today (recent parity work).
- Shared systems under `src/systems/` are reasonably clean; UI is not.

---

## Priority legend for fix tasks

| Tag | Meaning |
|-----|---------|
| **P0** | Obvious screenshot mismatch / broken chrome |
| **P1** | Content or layout parity that players notice immediately |
| **P2** | Polish, motion, tutorial, fidelity |
| **CLEAN** | Co-location / dedupe — do early so later parity PRs stay small |

Recommended order for agents:

1. **CLEAN-1** split `PlayScene` (below)
2. **P0 / P1** screen fixes
3. **P2** polish from `STATUS.md` + this doc

---

# Part A — Screen-by-screen differences

## A1. Settings

### Unity (screenshot + code)

- Framed parchment modal + green wooden banner titled **Settings** (corner gems are part of banner art).
- Two audio rows:
  - Label **Background Music**
  - Speaker icon
  - Thick black horizontal control (mute-style control in Unity UI; `AudioManager` only exposes mute, not continuous volume)
  - Same pattern for **Sound Effects**
- Action buttons (stacked):
  1. **Achievements** — green
  2. **Credits** — blue
  3. **New Game** — orange
- No “Portal sealed” / portal travel row inside Settings in the provided screenshots (portal travel is separate in Unity after story).

### Phaser now

See [`parity-screens/10-settings-seeded.png`](parity-screens/10-settings-seeded.png).

- Same banner/panel family, but audio rows are **blue On/Off buttons** (`Music On` / `SFX On`) beside speaker icons — not the Unity black slider/line control.
- Buttons:
  - **Credits** is **green** (should be blue)
  - **Achievements** button is **missing**
  - Extra **Portal sealed** / `Portal: meadow|river|altar` controls appear here
  - **New Game** orange — matches color, placement differs because of portal block
- Credits only toasts `"Xal's Path — web remake"`; Unity opens a real Credits panel.
- Lots of empty parchment below controls (Unity also sparse, but control set differs).

### Fix tasks

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| S1 | P0 | Rebuild audio rows to match Unity: label + speaker + black horizontal mute control (toggle is fine; store mute booleans). Remove blue On/Off button chrome. | Settings screenshot matches Unity audio rows |
| S2 | P0 | Button set/order/colors: green **Achievements**, blue **Credits**, orange **New Game**. | Matches Unity Settings screenshot |
| S3 | P1 | **Achievements** button: open platform/web stub or route to Rewards tab — decide in implementation, but button must exist visually. | Button present and interactive |
| S4 | P1 | Real **Credits** panel/modal (not toast). | Dedicated credits UI |
| S5 | P1 | Move portal travel out of Settings (Outlook/Map portal flow after unlock), matching Unity separation. | Settings no longer hosts portal region buttons |
| S6 | P2 | Tighten vertical spacing so controls sit like Unity (less dead parchment if Unity is denser). | Visual spacing parity |

---

## A2. Rewards

### Unity (screenshot + code)

2-column scrollable grid of wooden achievement cards. Mid-game screenshot cards:

| Card | Title example | Reward copy |
|------|---------------|-------------|
| Helper | Buy 120 Tomes | `Rewards:` **3x influence from tomes** |
| Clicker | Cast 300 spells | `Rewards:` **15x influence per click** |
| Video | Watch 5 projections | `Rewards:` **10 hours worth of influence (31.1mill influence)** |
| Meta | Earn 10 Rewards | `Rewards:` **1 hour worth of influence (3.11mill influence)** |
| Login | Log in for 2 days | `Rewards:` **1 hour worth of influence (…)** |
| Story | Finish the Story | `Rewards:` **10 hours worth of influence (…)** |

Defaults in Unity `AchievementManager.SetAchievementGoalDefaults()`:

- clicker **150**, helper **30**, video **5**, earn-rewards **10**, login **2**, story **2**
- Goals double on claim (screenshot values like 300 / 120 are post-claim progress)

Card anatomy:

- Icon top-left
- Goal title
- Progress bar with `n/goal`
- **“Rewards:”** + description (time rewards append live influence amount)
- Green **Receive**
- Right-edge scrollbar when content overflows
- Card frame uses achievement box art at a **wide** aspect (Unity prefab), not a tall square

### Phaser now

See [`parity-screens/09-rewards-seeded.png`](parity-screens/09-rewards-seeded.png).

- Only **4** cards: Cast / Buy Tomes / Log in / Finish Story
- **Missing:** Watch projections, Earn N Rewards
- Card order differs (Phaser leads with Cast, Unity screenshot leads with Buy Tomes)
- Hint text is terse (`×15…`, `1 hour of influence`) — missing **`Rewards:`** prefix and live `(X influence)` suffix for time rewards
- **No scrollbar / no scroll** — large empty parchment under the 2×2 grid
- `achiev-box.png` is **840×260** but drawn as ~square tall cards (`cardH = 148`) → frame distortion
- Receive uses alpha-disabled green button; OK functionally, polish differs
- No achievement jingle (`STATUS.md`)

### Fix tasks

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| R1 | P0 | Preserve achievement-box **aspect** (same approach as Tomes rows). Stop squashing 840×260 into tall cards. | Card frames look like Unity |
| R2 | P0 | Add missing cards: **Watch N projections**, **Earn N Rewards**. Extend save/economy accordingly. | Six Unity core cards present |
| R3 | P0 | Add scroll + scrollbar to Rewards (reuse Tomes scroll pattern after CLEAN split). | Can scroll; thumb visible when needed |
| R4 | P1 | Match card copy: `Rewards:` prefix; time rewards show computed influence in parentheses. | Copy matches Unity assets/logic |
| R5 | P1 | Match card order to Unity grid (Helper, Clicker, Video, Earn Rewards, Login, Story — verify against prefab/order if unsure). | Order matches Unity |
| R6 | P1 | **Projections** card without Unity Ads SDK: implement UI + progress hook that does not pull in ad libraries (e.g. stub/dev grant, or optional rewarded path later). Document choice in PR. | Card works; no Unity Ads import |
| R7 | P2 | Achievement claim SFX/jingle parity. | Distinct claim feedback |
| R8 | P2 | Claimed/disabled Receive visuals closer to Unity pressed states. | Clear ready vs not-ready |

Save/schema notes for R2:

- Extend `AchievementSave` + `economy.json` defaults (`videoGoal: 5`, `achievementGoal: 10`, counts).
- Mirror Unity double-on-claim for those goals.
- Update `architecture.md` save shape when done.

---

## A3. Map / Scene (Hall)

### Unity (screenshot + `ChapterButton.cs`)

- Full wizard study scene (bookshelf, antler throne, desk, rune portal, window).
- Chapter card over desk:
  - Lock (or portal) avatar
  - `Chapter N`
  - Chapter name (e.g. **Searching**)
  - When locked: **`Lvl X`**
  - For chapters 2–4: **`2x Mana Increase`** is shown **even while locked** (Unity keeps `ClickerRewardText` independent of lock state)
- Bottom nav label appears as Map / Hall / Hat in OCR depending on font; icon is portal-like. Phaser label **Map** is acceptable if icon/art matches.

### Phaser now

See [`parity-screens/11-map-seeded.png`](parity-screens/11-map-seeded.png).

- Study scene comes from full-frame `xal_*.png` expressions (good direction).
- `Scene.png` was unused and has been **removed** (Map uses full-frame `xal-*`).
- Chapter card (`260×92`) using achiev-box:
  - Locked: shows `Lvl 10`, **hides** `2x Mana Increase`
  - Unlocked: shows `2x Mana Increase`, hides level
  - Unity locked Chapter 3 shows **both**
- Level requirement text color/placement differ slightly from Unity card density.
- Barlog still lacks full overlay presentation (`STATUS.md`).
- No finger-pointer chapter tutorial.

### Fix tasks

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| M1 | P0 | Chapter card: when locked, show **Lvl requirement and** `2x Mana Increase` (chapters 2–4), matching `ChapterButton.UpdateButton`. | Locked Chapter 3 matches Unity screenshot fields |
| M2 | P1 | Revisit chapter card size/typography/icon well so it reads like Unity’s desk card (not a cramped strip). | Visual density parity |
| M3 | P1 | Decide fate of `Scene.png`: use as base layer under expressions, or delete preload if truly unused. | No dead preload; composition intentional |
| M4 | P2 | Barlog full overlay (separate panel/avatar), not only BGM swap. | Barlog chapters feel distinct |
| M5 | P2 | Finger-pointer / first-chapter tutorial cues. | New players guided like Unity |

---

## A4. Tomes

### Unity (screenshot)

- Green **Tomes** banner + parchment list
- Rows: emblem / lock, name, crystal cost, owned **or** `Lvl N`, `/sec`
- Locked rows darker; scrollbar on right
- Tomes nav **!** when a helper is affordable (`ShopManager.ManageExclamationPoint`)

### Phaser now

See [`parity-screens/08-tomes-seeded.png`](parity-screens/08-tomes-seeded.png).

**Closest screen.** Nature/Lightning unlocked + Earth/Water/Mystic locked layout largely matches.

Remaining gaps:

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| T1 | P1 | **Tomes nav badge (!)** when any unlocked helper is affordable and story not blocking — Unity shows this constantly in screenshots; Phaser only badges Rewards today. | `!` on Tomes when buyable |
| T2 | P1 | Scroll thumb: `scrollBar.png` is **200×8** horizontal, drawn as vertical `7×26` — replace with correct vertical thumb art or rotate/nine-slice properly. | Thumb not distorted |
| T3 | P2 | First-tome creature unlock splash panel (Unity has dedicated splash; Phaser only toasts). | Splash parity |
| T4 | P2 | Text collision checks for large formatted numbers at high ownership. | No overlapping glyphs |

---

## A5. Outlook (world)

### Unity (screenshot)

- Meadow (mountains, river, flowers)
- Creatures running across field (deer/elk, shadowy beasts)
- Top HUD clouds + rocky bottom nav
- Cast-anywhere idle field

### Phaser now

See [`parity-screens/07-outlook-seeded.png`](parity-screens/07-outlook-seeded.png).

- Meadow background art is present and full-bleed above nav.
- Creatures spawn from owned helpers, but:
  - Still images, forced **96×72** (distorts sources; e.g. elk 683×365, voidSpawn 1200×300)
  - Simple L→R tween + bob — **no walk cycles**
  - Clustering/behavior differs from Unity’s livelier field
- Missing Unity systems called out in `STATUS.md`: news prompts, influence crystal, finger-pointer cast tutorial.

### Fix tasks

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| O1 | P1 | Fit creatures **aspect-true** (like Tomes emblems), not forced 96×72. | No stretched creatures |
| O2 | P2 | Walk-cycle / multi-frame motion where assets allow. | Creatures feel alive |
| O3 | P2 | News prompts + influence crystal UX (web-safe, no ad SDK required for crystal stub). | Outlook has Unity’s ambient prompts |
| O4 | P2 | Guided finger-pointer tutorial tour. | Tutorial parity |

---

## A6. Shared HUD + bottom nav

### HUD

Unity right-cloud `!` means **chapter ready** (`SceneManager.ManageExclamationPoint`: next chapter unlocked, not mid-dialogue, level ≠ 1).  
Phaser `exclaim` means **buff active or mana full** — wrong semantic.

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| H1 | P0 | Level-cloud `!` = chapter available (Unity rule). Mana/buff need different feedback if desired. | Badge meaning matches Unity |
| H2 | P1 | Use `mana-bar.png` (or proper bar art) instead of flat rectangles; preserve pixel fidelity / nine-slice. | Bars match Unity chrome |
| H3 | P1 | `exclaim.png` is **180×400** drawn square — fix aspect. | `!` not squashed |
| H4 | P2 | Cloud nine-slice / sizing fidelity (`STATUS.md`). | Clouds not soft-stretched |

### Nav

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| N1 | P1 | Nav button frames are **85×85** stretched to `slotW×44` — preserve aspect or use dedicated wide frames. | Frames not oval-squashed |
| N2 | P1 | Map icon: confirm `portal-nav.png` vs Unity Portal2 swirl; match screenshot silhouette. | Icon matches Unity |
| N3 | P1 | Support **both** Rewards claim badge and Tomes affordability badge (Unity has both systems). | Badges on correct tabs |
| N4 | P2 | Active tab treatment closer to Unity (frame + label emphasis). | Active state obvious |

---

## A7. Already close / keep

- Portrait FIT frame 390×844 + letterbox.
- Bottom nav **order** and re-tap → Outlook.
- Tomes row geometry / lock wells / cost+owned+/sec layout.
- Framed panel + `PanelBanner` title pattern for Settings/Rewards/Tomes.
- Region backgrounds + Xal full-scene Map approach.
- Press Start 2P + pixelArt pipeline.

Do not regress these while fixing the gaps above.

---

# Part B — Project cleanup (co-location + dedupe)

## B1. Why cleanup first

`PlayScene.ts` currently owns:

- HUD, nav, toast
- Framed panel chrome
- Settings / Rewards / Tomes renderers
- Map portrait, chapter card, quote box
- Outlook cast input + spawn bounds
- Scroll state, tab routing, persistence hooks

That blocks safe parallel agent work and causes copy-paste UI (text styles, image buttons, scrollbars, badges).

Per `AGENTS.md` **Scene colocation**:

- Scene-specific UI/helpers → under `phaser/src/scenes/`
- Shared systems → `phaser/src/systems/`
- Shared data → `phaser/src/data/`
- Elevate only when **multiple scenes** need it (today there is effectively one play scene)

## B2. Target layout after cleanup

```text
phaser/src/scenes/
  BootScene.ts
  PreloadScene.ts
  PlayScene.ts                 # thin orchestrator: tab routing, update tick, wire views
  play/
    ui/
      constants.ts             # FONT, NAV_H, colors, panel metrics
      textStyles.ts            # shared TextStyle factories
      ImageButton.ts           # image + centered label + hit
      FramedPanel.ts           # dim + panel + banner + list geometry
      ScrollList.ts            # drag/wheel + track/thumb (Tomes + Rewards)
      Badge.ts                 # exclaim badge helper (aspect-true)
    hud/
      HudView.ts               # left/right clouds, bars, chapter !
    nav/
      BottomNav.ts             # NAV config, active state, badges
    outlook/
      OutlookView.ts           # bg fit, cast bounds, spawn rect
    map/
      MapView.ts               # portrait fit, expressions
      ChapterCard.ts
      QuoteBox.ts
    tomes/
      TomesPanel.ts
      TomeRow.ts
    rewards/
      RewardsPanel.ts
      RewardCard.ts
    settings/
      SettingsPanel.ts
```

Keep `systems/` for Economy / Story / Save / Audio / Spawn only.  
Do **not** invent a generic UI framework beyond the tiny helpers above.

## B3. Cleanup task list

| ID | Priority | Task | Acceptance |
|----|----------|------|------------|
| CLEAN-1 | CLEAN | Split `PlayScene` into the folders above **without behavior changes**. | Gameplay identical; PlayScene thin |
| CLEAN-2 | CLEAN | Centralize `FONT` + stroke text styles in `textStyles.ts`. | No duplicated style literals in panels |
| CLEAN-3 | CLEAN | Extract `ImageButton` used by Settings + Rewards Receive (+ future Credits). | One button builder |
| CLEAN-4 | CLEAN | Extract `FramedPanel` from `addFramedPanel`. | Settings/Rewards/Tomes share one builder |
| CLEAN-5 | CLEAN | Extract `ScrollList` from Tomes; Rewards consumes it for R3. | One scroll implementation |
| CLEAN-6 | CLEAN | Aspect-fit helper (`fitInBox`) shared by Tomes, Rewards frames, creatures, badges. | No more one-off stretch bugs |
| CLEAN-7 | CLEAN | Preload audit: remove or use dead keys (`ui-scene-bg` / `Scene.png`, unused bar art). | Preload matches runtime |
| CLEAN-8 | CLEAN | Update stale docs: `architecture.md` still says Goals/More; align to Settings/Rewards/Map/Tomes. Update `STATUS.md` to point at this parity doc. | Docs match code |
| CLEAN-9 | CLEAN | Optional: move `format.ts` stays in `utils/`; do not create extra abstraction layers. | Still little code |

### Duplication hotspots to kill during CLEAN

1. **Text style blobs** — white/black pixel text with `#1a1208` stroke appears dozens of times in `PlayScene`.
2. **Image + label buttons** — Settings `mkImgBtn` and Rewards Receive are the same pattern.
3. **Panel chrome** — Settings/Rewards/Tomes all call `addFramedPanel` then reinvent list layout details.
4. **Scroll** — only Tomes has it; Rewards needs the same thing.
5. **Aspect handling inconsistency** — Tomes preserves 840×260; Rewards/nav/scrollbar/exclaim/creatures stretch. One `fitInBox` / `coverBox` policy.
6. **Badge placement** — Rewards badge hardcoded in nav; Tomes/HUD badges should share `Badge`.

### What not to clean

- Do not port Unity singleton managers.
- Do not add test suites unless asked (`AGENTS.md`).
- Do not keep compatibility shims for old UI layouts.
- Do not move scene UI into `systems/`.

---

# Part C — Suggested agent work packages

Small PRs, in this order:

1. **Cleanup PR** — CLEAN-1…CLEAN-6, CLEAN-8 (structure only).
2. **Settings PR** — S1–S5.
3. **HUD/Nav badges PR** — H1–H3, N1–N3, T1.
4. **Rewards PR** — R1–R6 (depends on ScrollList from cleanup).
5. **Map chapter card PR** — M1–M3.
6. **Outlook creatures PR** — O1 (+ O2 if assets ready).
7. **Polish PR** — M4–M5, O3–O4, T3, R7, H4, S6.

Each PR should attach a before/after screenshot under `phaser/docs/parity-screens/` or `/opt/cursor/artifacts/`.

---

# Part D — Quick reference: Unity vs Phaser cheat sheet

| Area | Unity | Phaser today |
|------|-------|--------------|
| Settings audio | Speaker + black mute line | Speaker + blue On/Off button |
| Settings buttons | Achievements green, Credits blue, New Game orange | Credits green, Portal block, New Game orange |
| Rewards cards | 6 (+ scroll) | 4, no scroll |
| Rewards copy | `Rewards: …` + live influence for time rewards | Short hints |
| Rewards frame | Wide achiev box | Squashed tall card |
| Map chapter card | Lvl + 2x Mana together when locked (ch 2–4) | Mutually exclusive fields |
| Tomes list | Match | Mostly match |
| Tomes `!` | Affordability | Missing (Rewards `!` only) |
| HUD `!` | Chapter ready | Mana full / buff |
| Creatures | Animated field presence | Stills, forced 96×72 |
| Code structure | Many Unity behaviours | One monolithic `PlayScene` |

---

# Part E — Out of scope reminders

From architecture / `AGENTS.md`:

- No CloudOnce / Game Center wiring required for web unless product asks.
- No Unity Ads SDK — projections/crystal features need web-safe stand-ins.
- No analytics ports.
- Prefer little code; match existing Phaser patterns after the CLEAN split.

---

## Related files

- Phaser UI: `phaser/src/scenes/PlayScene.ts`
- Phaser status notes: `phaser/STATUS.md`
- Architecture: `phaser/_bmad-output/planning-artifacts/architecture.md`
- Unity refs: `unity/Assets/Scripts/Manager/BottomNavManager.cs`, `SettingsManager.cs`, `ShopManager.cs`, `Scene/ChapterButton.cs`, `Scene/SceneManager.cs`, `Achievements/Logic/*.cs`, `Achievements/AchievementManager.cs`
