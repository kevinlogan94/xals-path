# Architecture — Xal's Path

**Project:** Unity mobile game (clicker + narrative)  
**Scan:** Quick — informed by folder structure, `Packages/manifest.json`, `EditorBuildSettings`, and spot-check of `SavedData.cs`.

## 1. Executive summary

The game is a **single Unity client**. Runtime behavior is organized around **MonoBehaviour managers** under `Assets/Scripts/Manager` and feature folders (`Scene`, `Splash`, `Shop`, `Achievements`, etc.). **Progress and meta-progress** are represented by **`[Serializable]`** C# types aggregated in **`SavedData`**, which ties together influence, levels, chapters, helpers, achievements, and tutorial flags.

There is **no separate API server or database** in this repository; persistence is **local/serialized game state** plus third-party **cloud save / platform services** where CloudOnce / Play Games are configured.

## 2. Technology stack

| Layer | Choice |
|-------|--------|
| Runtime | Unity 2023.2.22f1 |
| Scripting | C# (.NET / Unity scripting backend) |
| UI | uGUI (`com.unity.ugui`) + TextMesh Pro |
| 2D pipeline | Unity 2D animation, sprites, tilemap, pixel-perfect (see manifest) |
| Ads | Unity Ads package |
| Analytics / cloud identity | Unity Gaming Services (Analytics, Core) |
| Push | `com.unity.mobile.notifications` |
| Android / iOS extras | Plugins in `Assets/Plugins`; GPGS + CloudOnce in `Assets/Extensions` |

## 3. Architectural pattern

**Pattern:** **Scene-based application** + **manager singletons / scene singletons** (common Unity pattern) + **serialized game state object** (`SavedData`).

- **Scenes** gate major flow (intro → main).  
- **Managers** encapsulate subsystems: audio, saves, ads, analytics, notifications, shop, achievements, etc.  
- **Models** (`Assets/Scripts/Model`) define small POCOs; **`Serializable`** types under `Model/Serializable` mirror persisted slices.

## 4. Data / persistence architecture

- **In-memory model:** `SavedData` holds longitudinal counters, chapter list, helper list, logs, achievement progress, mana/buff flags, etc.  
- **Serialization:** Standard Unity **`JsonUtility`** or custom save path (implementation in `SaveGame.cs` — not fully read in quick scan; treat as the save/load choke point).  
- **No RDBMS:** Not applicable.  
- **Cloud / platform:** **CloudOnce** and **Google Play Games** suggest optional cloud sync and leaderboards/achievements; exact wiring is in extension code and Unity project settings.

## 5. API design

**Not applicable** — client-only game; no HTTP API surface documented in-repo for this product.

## 6. UI / presentation

- **uGUI** canvases and panels across `Splash`, `Shop`, `Increment`, `LevelUp`, etc.  
- **TextMesh Pro** for text rendering (large `Assets/TextMesh Pro` tree).  
- **Bottom navigation** and **canvas background** logic appear in `BottomNavManager`, `CanvasBackgroundController`.

## 7. Subsystem map (by folder)

| Area | Responsibility (inferred) |
|------|-----------------------------|
| `Manager/` | Cross-cutting: save/load, ads, audio, analytics, notifications, object pooling, monitoring |
| `Scene/` | Chapter flow, scene backgrounds, scene-level UI |
| `Splash/` | Onboarding, surveys, portals, creature panels |
| `Achievements/` | Achievement definitions and platform-specific logic (`Logic/`). |
| `Shop/` | Shop UI and purchases (helpers, etc.) |
| `Buff/` | Timed buffs / creatures |
| `Increment/` | Core clicker UI (increments, mana bar) |
| `LevelUp/` | Level-up UX |
| `AnimationEvents/` | Animation-driven gameplay hooks |
| `Model/` | Game entities and DTOs for saves |

## 8. Testing strategy

- **Unity Test Framework** is listed in `Packages/manifest.json`.  
- Quick scan did not find a large first-party `Tests/` assembly; production tests may be minimal or excluded from patterns searched.

## 9. Deployment / ops (high level)

- Builds are produced via **Unity Build Settings** for **iOS** and **Android**.  
- **No `.github/workflows`** was found in quick scan — CI may be manual or external.  
- Store listings are historical per README.

## 10. Constraints for new work

- Changing progression requires aligning **`SavedData`** and any **save migration** logic.  
- New scenes must be added to **`EditorBuildSettings`** if they participate in shipped flow.  
- Third-party SDKs (Ads, GPGS, CloudOnce) impose **platform project settings** and **privacy/store** constraints outside this doc.
