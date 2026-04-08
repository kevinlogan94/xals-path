# Project Documentation Index — Xal's Path

**Generated:** 2026-04-07  
**Scan:** Initial project scan — **Quick** (pattern- and manifest-based; not exhaustive source read)

## Project overview

| Field | Value |
|-------|--------|
| **Type** | Monolith — single Unity game project |
| **Primary language** | C# |
| **Engine** | Unity 2023.2.22f1 |
| **Architecture** | Scene-driven client; manager MonoBehaviours; `SavedData` serialization |

## Quick reference

- **Entry build scenes:** `Assets/Scenes/Intro.unity` → `Assets/Scenes/MainScene.unity`  
- **Gameplay scripts:** `Assets/Scripts/` (Managers, Scene, Splash, Shop, Achievements, …)  
- **Save / progression model:** `Assets/Scripts/Manager/SavedData.cs` (+ `SaveGame.cs`)  
- **Packages:** `Packages/manifest.json`

## Generated documentation

- [Project overview](./project-overview.md) — summary, stack, classification  
- [Architecture](./architecture.md) — patterns, persistence, subsystems  
- [Source tree analysis](./source-tree-analysis.md) — annotated directory map  
- [Development guide](./development-guide.md) — prerequisites, run, build, tests  
- [Asset inventory](./asset-inventory.md) — coarse asset counts by type  

## Not generated (not applicable or not found in quick scan)

| Document | Reason |
|----------|--------|
| API contracts | No HTTP API layer in this Unity client repo |
| Data models (SQL/ORM) | No server/database schema in scope |
| Deployment guide (CI/CD) | No `.github/workflows` or deployment manifests found in quick scan; use Unity Build Settings + store pipelines |
| Contribution guide | No `CONTRIBUTING.md` found |
| Component inventory (web-style) | Game profile uses Unity scenes/prefabs; see architecture + asset inventory instead |

To deepen any section, re-run documentation with **Deep** or **Exhaustive** scan (see `gds-document-project` workflow).

## Existing documentation in repository

- [README.md](../README.md) — game description, features, links (historical store listings)

## Getting started (for developers / AI)

1. Read [project-overview.md](./project-overview.md) then [architecture.md](./architecture.md).  
2. Use [source-tree-analysis.md](./source-tree-analysis.md) to locate `Scripts` subsystems.  
3. Before changing progression, inspect **`SavedData`** and save/load paths.  
4. For build/release, follow [development-guide.md](./development-guide.md).

## Brownfield / AI context

Point planning or implementation workflows at this file: **`_bmad-output/index.md`**. It links the technical overview, architecture, tree, dev setup, and asset snapshot for **Xal's Path** as of the scan date.
