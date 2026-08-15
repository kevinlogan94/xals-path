# Status — Phaser remake vs Unity

**Updated:** 2026-08-15  
**Branch:** `phaser-migration`  
**Law:** [`docs/seed.md`](docs/seed.md) (`KEEP` / `DROP`)  
**Unity:** `unity/` is reference only — never imported into `phaser/src/`

The playable game is in Phaser. What is left is a short list of Unity UX details and web ship work — not missing systems.

## Verdict

| Layer | Status |
|-------|--------|
| Economy, story, save, audio, spawns | Done |
| Outlook / Map / Tomes / Rewards / Settings | Done |
| Splashes, tutorial pointers, news, Barlog ch.6 | Done |
| Ads, CloudOnce, Game Center, analytics, social | Out of scope (`DROP`) |
| Web ship (PWA / title tap) | Thin leftovers |

Run: `cd phaser && npm install && npm run dev`

---

## Unity `Assets/Scripts` → Phaser

Game code in Unity lives under `unity/Assets/Scripts/` (managers, shop, splash, story). Phaser mirrors that as systems + scene-local views.

| Unity | Phaser | Notes |
|-------|--------|--------|
| `Monitor` + `IncrementPanel` + `ManaBar` + `Score` | `EconomySystem` + `PlayScene` cast / float text | Mana-gated clicks, +N popups, regen |
| `ShopManager` / `ShopHelper` | `TomesPanel` / `TomeRow` + `helpers.json` | 10 tomes, ×1.3 cost, `!` when affordable |
| `SceneManager` / `ChapterButton` / `Xal` expressions | `XalView` / `ChapterCard` / `QuoteBox` + `chapters.json` | 7 chapters, back button, banter |
| `barlog.cs` | `BarlogView` | Full overlay + quotes, not BGM-only |
| `SplashManager` + splash scripts | `play/splash/*` | Achievement, creature, buff, IOT, new game, portal, endgame |
| `AchievementManager` + core logics | `RewardsPanel` + `EconomySystem` claims | Helper, Clicker, Video (Watch disabled), Earn Rewards, Login, Story |
| `NewsManager` | `NewsBanner` + `news.json` | Outlook prompts |
| `fingerPointer` + tutorial in `SceneManager` / `AchievementManager` | `TutorialSystem` + `FingerPointer` | Early Map lock, Nature gift, Outlook cast cue |
| `BuffManager` | `EconomySystem` buff + `buffSplash` | 200 clicks → 15s infinite mana |
| `CanvasBackgroundController` | `OutlookView` + region BGM | Meadow / river / altar |
| `CreatureRegion` / creature sheets | `SpawnSystem` + `creatureSplash` run slices + `creatureMagic` | Walk cycles + tap magic |
| `AudioManager` | `AudioSystem` | Theme / Barlog / regions / SFX; separate BGM & SFX mute |
| `SaveGame` / `SavedData` | `SaveSystem` localStorage `xals-path-web-save-v1` | No binary Unity save import |
| `BottomNavManager` / `SettingsManager` | `BottomNav` / `SettingsPanel` / `CreditsModal` | Order: Settings → Rewards → Outlook → Map → Tomes |
| `LevelUp` / `LevelUpPanel` | HUD cloud tap + `levelUpSplash` | Must tap cloud; not auto-level |
| `PortalPanel` / `TeleportButton` | `portalSplash` + Map portal bar after story | |
| `ObjectPooler` | not needed | Spawn/destroy in JS |

### Explicitly not porting (`DROP` or platform)

| Unity | Why |
|-------|-----|
| `AdvertisementManager`, `AdvertisementPanelScript`, Map **Influence Crystal** as ad entry | No ads. Crystal art is reused on the offline splash only. Video card **Watch** stays disabled. |
| `GameCenterManager`, CloudOnce, Settings **Achievements** button | No Game Center / Play Games |
| `TwitterLogic`, `AppStoreReviewLogic`, `SurveyScript` | No social / store / survey hooks |
| `AnalyticsManager` | No analytics |
| `NotificationManager` | No mobile push |
| `PlayIntro` (boot video) | Web skip; not in `KEEP` |
| Google Play / iOS build scripts | Native only |

---

## What is left

### Worth doing before calling it shipped

1. **Title / tap-to-start** — Unity `TitleScreen` after boot. Phaser jumps Preload → Play. A tap-to-start also unlocks browser audio (autoplay policy).
2. **Buff countdown number** — Unity `BuffCountDown` shows remaining seconds. Phaser fills the mana bar for 15s but has no countdown label.
3. **PWA** — `manifest.webmanifest` is linked; no service worker, icon is a raw Xal PNG. Seed phase 5 (ship web / PWA).

### Optional polish (not blocking play)

- Settings parchment vertical spacing vs Unity screenshot
- Rewards **Receive** pressed/disabled art (today: alpha 0.45)
- Tomes huge-number glyph collision at high ownership
- HUD cloud nine-slice vs stretch
- Idle book page-turn on Map (`SceneManager` `BookTurn`)
- Persist BGM/SFX mute across reloads (Unity save also does **not** store mute)

### Stale vs this file

[`docs/unity-phaser-ui-parity.md`](docs/unity-phaser-ui-parity.md) (2026-07-22) still lists P0/P1/P2 that are already done: PlayScene split, mute-line Settings, six Rewards cards, chapter Lvl+2x mana, Tomes `!`, HUD chapter `!`, creature aspect + walk cycles, news, Barlog overlay, tutorial pointers, Credits panel, creature/achievement splashes. Treat **this STATUS** as current; treat that doc as historical.

---

## Already in Phaser (do not rebuild)

Portrait **390×844** FIT + letterbox; Press Start 2P; cloud HUD; stone nav; framed Settings / Rewards / Tomes; Map full-frame `xal-*`; Outlook BAM; creature unlock lock timing; offline IOT splash; New Game confirm; portal after `"It is done."`; login day bump; localStorage persist only after the tutorial closer and the first Outlook tap (reload mid-tour starts over).
