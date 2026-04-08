# Development Guide — Xal's Path

## Prerequisites

- **Unity Hub**  
- **Unity Editor 2023.2.22f1** (exact version in `ProjectSettings/ProjectVersion.txt`)  
- **Git** (clone this repository)  
- For **iOS builds:** Xcode on macOS, Apple developer signing  
- For **Android builds:** Android SDK & NDK via Hub, JDK, keystore for release  

Optional:

- **JetBrains Rider** or **Visual Studio** (Unity packages reference both)

## Opening the project

1. Install **Unity 2023.2.22f1** via Hub.  
2. **Add** the repository root folder as a Unity project.  
3. Open the project; allow Unity to import assets (first open can take time).

## Recommended workflow

- Create a **duplicate scene** or use prefab variants when experimenting; avoid editing `Intro`/`MainScene` blindly.  
- Use **version control** visibility: Unity YAML scenes — expect large diffs on scene saves.  
- Run from **Build Settings** scenes: `Assets/Scenes/Intro.unity`, `MainScene.unity`.

## Running the game

- Open a scene from `Assets/Scenes`.  
- Press **Play** in the Editor.  
- If flow depends on specific initialization, start from **Intro** to mirror build order.

## Building

1. **File → Build Settings**  
2. Select **iOS** or **Android**  
3. **Switch Platform** if needed  
4. Configure **Player Settings** (bundle id, icons, signing, minimum OS)  
5. **Build** or **Build And Run**

Android/iOS **plugins** live under `Assets/Plugins` and vendor folders (`Extensions`, `ExternalDependencyManager`).

## Tests

- Package **com.unity.test-framework** is present.  
- Open **Window → General → Test Runner** to discover/edit tests.  
- Quick scan did not catalog a large first-party test tree; add **Edit Mode** / **Play Mode** tests under a dedicated `Assets/Tests` folder if expanding coverage.

## Project-specific notes

- **Save data:** Changes to `SavedData` or serializable DTOs may break saves — plan **versioning** or migration in save/load code (`SaveGame.cs` and related).  
- **Monetization / privacy:** Unity Ads and analytics require correct **consent** and **store** compliance; verify before any re-release.  
- **CloudOnce / GPGS:** Require dashboard configuration and platform credentials.

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| Wrong Unity version | Match `ProjectVersion.txt` exactly to avoid upgrade noise |
| Missing Android/iOS modules | Install via Hub |
| Plugin resolve errors | Use **External Dependency Manager** menus (Android Resolver) if present |
| Huge merge conflicts in scenes | Use Unity **Smart Merge** or scene isolation discipline |

## References in-repo

- `README.md` — product summary  
- `Packages/manifest.json` — Unity packages  
- `ProjectSettings/EditorBuildSettings.asset` — build scene list  
