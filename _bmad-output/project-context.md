---
project_name: "Xal's Path"
user_name: "Kevin Logan"
date: "2026-04-07"
sections_completed:
  - technology_stack
  - engine_rules
  - performance_rules
  - organization_rules
  - testing_rules
  - platform_rules
  - anti_patterns
status: complete
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing game code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Area | Version / package |
|------|-------------------|
| Unity Editor | **2023.2.22f1** (stay on this line unless the project is explicitly upgraded) |
| Scripting | C# — default assembly (**no** `.asmdef`; everything compiles into `Assembly-CSharp`) |
| UI | `com.unity.ugui` 2.0.0, **TextMesh Pro** (under `Assets/TextMesh Pro`) |
| 2D | 2D Animation 10.1.1, Pixel Perfect 5.0.3, Sprite/Tilemap packages per `Packages/manifest.json` |
| Ads | `com.unity.ads` 4.4.2 |
| Services | `com.unity.services.analytics` 6.0.2, `com.unity.services.core` 1.12.5 |
| Mobile | `com.unity.mobile.notifications` 2.3.2 |
| Tests | `com.unity.test-framework` 1.3.9 (framework present; first-party test coverage is minimal) |
| Third-party (repo) | **CloudOnce**, **Google Play Games** under `Assets/Extensions`; **EDM4U** under `Assets/ExternalDependencyManager` |

**Build entry:** `Intro.unity` → `MainScene.unity` (see `ProjectSettings/EditorBuildSettings.asset`). New shipped scenes must be registered there.

---

## Critical Implementation Rules

### Engine-Specific Rules (Unity)

- **MonoBehaviour-centric design:** Gameplay is driven by managers and feature scripts under `Assets/Scripts/` (e.g. `Manager/`, `Scene/`, `Splash/`). Prefer extending existing manager patterns over new global singletons without a clear owner.
- **Save pipeline is centralized:** `SaveGame` (`Assets/Scripts/Manager/SaveGame.cs`) writes to `Application.persistentDataPath + "/XalsPathGame.json"` using **`JsonUtility`**. **`SavedData`** is the aggregate serializable snapshot; constructor gathers from subsystems, **`DistributeLoadData()`** applies on load. Any new persistent field must flow through **`SavedData`** and consider **load order** vs `RefreshData()` / singletons.
- **JsonUtility constraints:** Do not assume arbitrary types serialize; prefer `[Serializable]` types with public fields Unity can serialize. Be careful with **`DateTime`** and nested structures—verify round-trip in Editor before relying on new fields. Changing save shape may require **migration** logic (not only adding fields).
- **No namespaces in most scripts:** Project uses global types (no `namespace` blocks in typical scripts). New scripts should **match** existing class naming (`PascalCase`, feature suffixes like `Manager`, `Panel`, `Controller` where consistent).
- **Singletons / Instance patterns:** Many features use `*.Instance` (e.g. `ShopManager`, `AchievementManager`). Follow the same access pattern when touching those systems to avoid duplicate state.
- **Resources:** Runtime-loaded assets live under `Assets/Resources/`. Prefer existing loading conventions; avoid duplicating large assets or breaking paths relied on by scenes.
- **Vendor folders:** Treat `Assets/Extensions/` and `Assets/Plugins/` as **third-party**—minimize edits; patch in wrappers under `Assets/Scripts` when possible.

### Performance Rules

- **Mobile targets:** Ship profile is **iOS & Android** clicker/narrative UI—avoid per-frame allocations on hot paths (increment/click loops, UI tick).
- **Object pooling:** `Assets/Scripts/Manager` includes pooling-related code—reuse existing pooling for frequently spawned objects rather than `Instantiate`/`Destroy` in tight loops.
- **Audio / ads / analytics:** Subsystems exist (`AudioManager`, ads, Unity Analytics)—hook through them instead of ad-hoc APIs that bypass lifecycle or consent assumptions.

### Code Organization Rules

- **Feature folders:** Place new gameplay code under the closest existing area (`Shop/`, `Increment/`, `Achievements/`, `Scene/`, etc.); use **`Manager/`** only for cross-cutting systems.
- **`Model/`:** Domain types and serializable DTOs; keep save-facing shapes aligned with **`SavedData`** and `Serializable` helpers.
- **`AnimationEvents/`:** Animation-driven hooks—coordinate with animation assets when adding new events.
- **Scenes:** `Assets/Scenes/` — keep flow consistent with intro → main; document new scenes in build settings.

### Testing Rules

- Unity Test Framework is available, but there is **no large first-party `Tests/` tree**—before adding tests, align with existing project layout (e.g. `Assets/Tests` + appropriate asmdef if the project later splits assemblies).
- Prefer **Edit Mode** tests for pure C# logic (`SavedData` math, helpers); **Play Mode** for MonoBehaviour integration—keep tests fast and deterministic.

### Platform & Build Rules

- **Conditional compilation:** Platform-specific code uses `#if UNITY_IOS`, `#if UNITY_ANDROID`, `#if UNITY_EDITOR` (see e.g. `NotificationManager`, iOS post-processor). Follow the same style for new platform branches.
- **Stores / SDKs:** GPGS, CloudOnce, Unity Ads, and notifications imply **platform project settings** (IDs, plist/manifest entries). Changing IDs or init order can break builds—coordinate with existing extension setup.
- **Persistence path:** Never hardcode absolute paths; use **`Application.persistentDataPath`** and the existing **`SaveGame`** path constant pattern.

### Critical Don't-Miss Rules

- **Progression changes:** Anything affecting long-term state must update **`SavedData`**, **`SaveGame`**, and any **achievement/tutorial** flags that depend on counters—miss one and you get desync or corrupt saves.
- **Editor-only vs runtime:** iOS build helpers under `Assets/Scripts/iOS/` are editor/post-process oriented—do not assume they run in player builds.
- **`.gitignore`:** `Library/`, `Temp/`, generated `.csproj`/`.sln` are ignored—do not commit generated Unity junk; IDE projects regenerate from the Editor.
- **Do not** introduce a backend/API layer inside this repo for core gameplay—the product is **client-only** persistence + platform services.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any game code.
- Follow ALL rules above; prefer the more restrictive option when unsure.
- After changing save data or platform SDK usage, call out **migration** and **build setting** impacts explicitly.

**For Humans:**

- Keep this file lean; remove rules that become obvious as the team’s Unity habits solidify.
- Update when Unity version, packages, or save format change.
- Re-run discovery if major refactors (e.g. assembly definitions, new platforms) land.

Last Updated: 2026-04-07
