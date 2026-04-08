# Xal's Path — Project Overview

**Date:** 2026-04-07  
**Type:** Unity game (mobile clicker / narrative)  
**Architecture:** Single-player Unity client; manager-centric runtime with serialized save data

## Executive Summary

**Xal's Path** is a story-driven clicker game built in **Unity** (editor **2023.2.22f1**), targeted at **iOS and Android**. Gameplay and UI are implemented primarily in **C#** under `Assets/Scripts`, with scenes **Intro** and **MainScene** in the build. The repo is a **single cohesive Unity project** (monolith), not a monorepo. Third-party integrations include **Unity Ads**, **Unity Gaming Services** (analytics/core), **Google Play Games** (via `Assets/Extensions/GooglePlayGames`), and **CloudOnce** for cloud saves/leaderboards-style features.

The product is **no longer distributed** on app stores; the repository serves as the full source and asset archive.

## Project Classification

| Attribute | Value |
|-----------|--------|
| **Repository type** | Monolith (single Unity project root) |
| **Project type** | `game` (per documentation-requirements.csv) |
| **Primary language** | C# |
| **Architecture pattern** | Scene-driven flow + **MonoBehaviour** “manager” classes + **`[Serializable]`** save model (`SavedData` and related types) |

## Technology Stack Summary

| Category | Technology | Notes |
|----------|------------|--------|
| Engine | Unity | `ProjectSettings/ProjectVersion.txt` → 2023.2.22f1 |
| Language | C# | Gameplay under `Assets/Scripts` (~69 `.cs` files in `Assets/Scripts` per quick inventory) |
| UI | Unity uGUI + TextMesh Pro | `com.unity.ugui`, TextMesh Pro in `Assets/TextMesh Pro` |
| 2D | Unity 2D packages | Animation, Sprite, Tilemap, Pixel Perfect, PSD Importer, etc. (`Packages/manifest.json`) |
| Ads / monetization | Unity Ads | `com.unity.ads` |
| Analytics / services | Unity Services (Analytics, Core) | `com.unity.services.analytics`, `com.unity.services.core` |
| Notifications | Mobile notifications | `com.unity.mobile.notifications` |
| Mobile plugins | iOS / Android under `Assets/Plugins` | Platform-specific native integration |
| Third-party (Assets) | Google Play Games, CloudOnce, External Dependency Manager | Under `Assets/Extensions`, `Assets/ExternalDependencyManager` |

## Key Features (from README)

- Narrative-focused clicker progression  
- Distinct world areas (Meadows, Galia River, Sci Nai Mountains, Xal’s Tower, Sanctuary)  
- Creature collection / blight-cleansing loop  
- Original soundtrack reference and marketing links (historical)

## Architecture Highlights

- **Entry scenes:** `Assets/Scenes/Intro.unity`, `Assets/Scenes/MainScene.unity` (see `ProjectSettings/EditorBuildSettings.asset`).  
- **Core loop:** Documented at a high level in [architecture.md](./architecture.md) — managers coordinate UI, progression, ads, saves.  
- **Persistence:** Central **`SavedData`** aggregates progress fields; used with save/load flow (see `Assets/Scripts/Manager/SavedData.cs`, `SaveGame.cs`).  
- **Assets:** Large `Assets/Resources` and art/audio under `Assets/Resources`, `Assets/Sounds`, `Assets/Videos` — summarized in [asset-inventory.md](./asset-inventory.md).

## Development Overview

### Prerequisites

- **Unity Hub** + **Unity 2023.2.22f1** (matching `ProjectVersion.txt`)  
- IDE: **Rider** or **Visual Studio** (packages `com.unity.ide.rider`, `com.unity.ide.visualstudio`)  
- Platform build targets: **iOS** (Xcode), **Android** (Android SDK/NDK via Hub)

### Getting started (summary)

Open the project folder in Unity; open `Intro` or `MainScene` from `Assets/Scenes`. Detailed steps: [development-guide.md](./development-guide.md).

### Key commands (Unity-centric)

| Action | Typical approach |
|--------|------------------|
| **Open project** | Unity Hub → Add → select repo root |
| **Run** | Play in Editor with a scene from Build Settings |
| **Tests** | Unity Test Framework is listed in `manifest.json`; no dedicated test assembly layout was identified in quick scan |
| **Build** | File → Build Settings → iOS / Android |

## Related documentation

- [index.md](./index.md) — master index  
- [source-tree-analysis.md](./source-tree-analysis.md) — folder map  
- [architecture.md](./architecture.md) — structure and patterns  
- [development-guide.md](./development-guide.md) — setup and workflows  
- [asset-inventory.md](./asset-inventory.md) — coarse asset counts  

## AI-assisted development notes

- Prefer **`Assets/Scripts`** for gameplay changes; respect existing **Manager** naming and **`SavedData`** fields when altering progression.  
- Scene flow starts from build-listed scenes; changing boot flow requires **Build Settings** and likely `SceneManager`-related scripts in `Assets/Scripts/Scene/`.
