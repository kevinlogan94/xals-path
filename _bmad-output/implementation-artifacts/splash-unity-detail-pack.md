# Splash Unity detail pack

Single reference for porting Unity splash panels to Phaser. **Out of scope:** `Advertisement`, `Survey` (exist in Unity; do not port).

## Shell

| Piece | Unity | Notes |
|-------|-------|-------|
| Router | `unity/Assets/Scripts/Splash/SplashManager.cs` | `TriggerSplash(type, objectName?)` → `SplashPanel` on + one typed child |
| Close | `CloseSplash()` | Hides typed children listed below; `AudioManager.Play("Pop")` |
| Enum | `SplashType` | Creature, Achievement, InfluenceOverTime, Buff, EndGame, NewGame, Portal (+ Advertisement, Survey excluded) |

**CloseSplash quirk:** Does **not** deactivate `NewGamePanel` or `LockAnimationObject`. Phaser must close **all** typed splash children including those.

**Stacked / missing lookup:** Unity can leave a blank active splash if `TriggerSplash` fires again while one is open, or if `objectName` does not match (`Creatures`/`Achievements` lookup by `Name` — early `return`, panel may stay on). Phaser should queue/replace and always allow dismiss.

**SplashArt:** `Resources/SplashArt/` has `SplashPixlr.png`, `SplashPixlrBigger.png`, `SplashPixlrBiggerWhite.png` (no scene bindings found). **Phaser default:** shell panel bg = `SplashPixlrBigger.png`.

---

## 1. Creature

**Trigger:** `ShopManager.AddHelper` when `AmountOwned == 0` before increment → `TriggerSplash(Creature, helper.Creature.Name)`.

**Lookup:** `Creatures.FirstOrDefault(x => x.Name == objectName)` — match **display `Name`** (Hippocampus, Abraxas, Bluecap, Void Spawn, …), not SO filename (`WaterHorse.asset`, etc.).

**Copy:** Title `New Creature Unlocked`; creature `Name`; `Description` from SO; rate **`200/second` hardcoded** in `MainScene` (placeholder, not live income); **Back** closes.

**First-purchase caveat:** `Nature` helper SO has `AmountOwned: 1` at start → Elk splash does not fire on first Nature buy (`AmountOwned` already > 0). After NewGame reset (`AmountOwned: 0`), first buy shows splash. Other creatures still document first-purchase flow.

**Flow:** `LockAnimationObject` on → `Unlock.anim` (~3.17s `ActivateNewHorsePanel` → `CreatureUIPanel`; ~3.2s `DisableActiveState` hides lock) → `CreaturePanelScript` plays run anim via `Creature.CreatureAnimation.ToString()` (enum **name**, not int).

**`CreatureAnimations` enum** (`Monitor.cs`): `WaterHorseAnimation`, `FireHorseAnimation`, `RaijuRunAnimation`, `WraithAnimation`, `ElkAnimation`, `WispAnimation`, `GriffinAnimation`, `BasiliskAnimation`, `PhoenixAnimation`, `VoidSpawnAnimation`, `None`.

**Unity sheet → Phaser `creatures.json` id**

| Unity sheet | Phaser id | SO `Name` (lookup key) | `CreatureAnimation` |
|-------------|-----------|--------------------------|---------------------|
| `dark-elk-animation.png` | `elk` | Elk | `ElkAnimation` |
| `waterHorse.png` | `hippocampus` | Hippocampus | `WaterHorseAnimation` |
| `fireHorse.png` | `abraxas` | Abraxas | `FireHorseAnimation` |
| `raiju.png` | `raiju` | Raiju | `RaijuRunAnimation` |
| `wraith-animation.png` | `wraith` | Wraith | `WraithAnimation` |
| `wisp-animation.png` | `bluecap` | Bluecap | `WispAnimation` |
| `griffin.png` | `griffin` | Griffin | `GriffinAnimation` |
| `basilisk.png` | `basilisk` | Basilisk | `BasiliskAnimation` |
| `phoenix.png` | `phoenix` | Phoenix | `PhoenixAnimation` |
| `void-spawn.png` | `voidSpawn` | Void Spawn | `VoidSpawnAnimation` |

**Orphan sheets (do not use for elk):** `unicorn.png`, `pegasus-animation.png` — unrelated; Phaser `elk.png` was wrongly sourced from unicorn.

**Raiju canonical:** `RaijuRunAnimation.anim` binds **`raiju.png`** (5 frames, 191×163). `raiju-animation.png` is distinct/unused by anim — port `raiju.png` for parity.

**Slice notes:** Lock sheet 1750×550 — **5 frames**; use meta rects (x=12/362/712/1062/1412, y=4, ~324×540), not naive equal grid. Elk `dark-elk-animation.png` — **11 irregular** ~130×123 slices from meta (frame 3 width 129, frame 9 height 120); not uniform 536÷11.

**Descriptions** (`unity/Assets/ScriptableObjects/Creatures/*.asset`): see prior table (Elk … Void Spawn) — unchanged text in SOs.

**Phaser gap:** Tomes buy → toast only. Still images in `assets/creatures/{id}.png`; no lock/unlock or run spritesheet. Fix `elk.png` from `dark-elk-animation.png`. `creatures.json` has no descriptions.

---

## 2. Achievement

**Trigger:** Each `*Logic.Receive` → `TriggerSplash(Achievement, AchievementObject.Name)`.

**Chapter finish matrix** (`SceneManager`, on chapter complete): **2–4** → Xal achievement splash (`chapterNumber < 5 && > 1`); **5–6** → no splash; **7** → EndGame (separate type, not achievement).

**Copy:** `Achievement.RewardDescription` + `Artwork`; Before/After delta lines; **Back** closes.

**Artwork paths** (SO `Artwork` → Resources):

| Achievement | Unity path |
|-------------|------------|
| Helper | `Resources/Game/Achievements/shop.png` |
| Clicker | `Resources/Pixel/energyBallSpriteSheet.png` (sprite sub-asset) |
| Video / Advertisement | `Resources/Game/Achievements/videoCamera.png` |
| Login | `Resources/Game/Achievements/star.png` |
| Story | `Resources/Game/Achievements/portal.png` |
| Reward (meta) | `Resources/Game/Achievements/trophy.png` |
| Xal | `Resources/Pixel/manaIcon.png` |
| AppStoreReview | `Resources/Pixel/Achievements/thumbsUp.png` |
| Facebook / Twitter / Instagram | `Resources/Pixel/Achievements/{facebook,twitter,instagram}.png` |

Sparse / external: reuse existing Phaser keys `ui-reward-shop`, `ui-reward-star`, `ui-reward-video`, `ui-reward-trophy`, `ui-reward-notepad`, `ui-reward-portal`.

**Before/After** (`AchievementPanelScript`): Helper → `/sec`; Clicker → `/click`; Xal → mana `(level-1)*100` → `level*100`; Video/Story → influence ± **10h** offline; default → **1h** offline. *(Bonus already applied when panel shows.)*

**Phaser gap:** `RewardsPanel` claim → toast `Reward received` only.

---

## 3. InfluenceOverTime

**Trigger (splash path):** `Monitor.Start` if `LastSavedDateTime != null` && `Chapters[0].SceneViewed`.

**Dual path:** `Monitor.Update` → `IncrementInfluenceForTimeAwayFromGameWithoutKillingApp` auto-grants influence after **>5s** since last frame (cap 10h) **without** splash — background resume can grant silently.

**Copy:** `Influence Earned`; body `While you were away, the incantation from your tomes continued to collect influence.`; `{n} influence`; **Collect** grants then closes.

**Logic:** Seconds since last save, cap **36000s (10h)**; `GetInfluenceReceivedOverTime`; grant **only on Collect** (`CollectAndCloseSplash`) on splash path.

**Phaser gap:** `GameContext` auto-applies `offlineGained` on load; toast — no Collect gate.

---

## 4. Buff

**Trigger:** `BuffManager.CheckAndSpawnBuffCreature` when `ClickCountSinceLastBuff >= 200` **and** `!BuffActive`; tap `BuffCreature` → `TriggerBuffSplash` (sets `BuffTutorialCompleted`).

**Edge:** If `AnimationLimit` (4) horizontal cycles complete without tap, creature hides and `_horizontalAnimationPlayed` resets — **no splash**.

**Copy:** `Blessing of the Gods`; `Yes!! Way to go!!`; `15 Seconds`; **Collect** → 15s mana buff; **Collect 2x** / ad → 30s (ad out of scope).

**Logic:** `BuffPanelScript.CollectAndCloseSplash` → `BuffManager.TriggerBuff(Mana, 15)`; ad path → `AdvertisementManager.ShowBuffRewardAd(Mana, 30)`.

**Phaser gap:** Auto-applies buff at threshold + toast. **Decision:** Collect-only grant for splash parity — when splash is shown, do **not** also auto-apply buff on threshold.

---

## 5. EndGame

**Trigger:** `SceneManager` chapter **7** complete → `TriggerSplash(EndGame)`.

**Copy:** `Congratulations`; `You have reached the end of Xal's Path.\n\nThank you for playing.`; **Credits** → `GameCompletePanelScript.TransitionToCredits`.

**Phaser gap:** Chapter 7 → toast; `CreditsModal` exists separately.

---

## 6. NewGame

**Trigger:** Settings → `NewGame.OpenSplash`.

**Copy:** `New Game`; `Restart the game from the very beginning.`; **Start a New Game** (`SavedData.RefreshData` + scene reload); **Back** closes.

**Phaser gap:** `onNewGame()` immediate `ctx.reset()` + toast — no confirm splash.

---

## 7. Portal

**Trigger:** `SceneManager.OpenPortalPanel` → `TriggerSplash(Portal)`.

**Copy:** Title `Portal`; regions **Meadow**, **River**, **Mountains** (altar) + **Teleport**; current region shows disabled sprite; **Back** closes.

**Teleport** (`TeleportButton`): buttons stay **clickable**; `PerformTeleport` no-ops same region (sprite swap only in `Update`). Else: `WipeActiveCreatureRegions`, `UpdateCanvasBackground`, `ManaBar.DeductAllMana`, SFX `MagicSpell`.

**Phaser gap:** Inline portal bar on Map — no splash panel.

---

## Asset copy table

| Unity source | Phaser dest | Notes |
|--------------|-------------|-------|
| `Resources/SplashArt/SplashPixlrBigger.png` | `phaser/public/assets/ui/splash/SplashPixlrBigger.png` | Default shell panel bg |
| `…/SplashPixlr.png`, `…/SplashPixlrBiggerWhite.png` | `…/` | Alt variants |
| `Resources/Pixel/Lock.png` | `phaser/public/assets/ui/lock-sheet.png` | 5 frames — meta rects x 12/362/712/1062/1412 |
| `…/Creatures/dark-elk-animation.png` | `phaser/public/assets/creatures/elk.png` (spritesheet) | Irregular 11-frame meta slices |
| `…/Creatures/{sheet}.png` | `phaser/public/assets/creatures/` | See sheet→id map |
| `phaser/public/assets/ui/panel.png`, `PanelBanner.png` | — | Present |

**Lock anim:** `Animation/Lock/Unlock.anim` — 3.1667s / 3.2s events; `Lock.cs`.

**Scripts:** `CreaturePanelScript`, `AchievementPanelScript`, `InfluenceOverTimePanelScript`, `BuffPanelScript`, `GameCompletePanelScript`, `NewGame`, `Portal/PortalPanel`, `Portal/TeleportButton`.
