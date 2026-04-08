# Asset Inventory — Xal's Path

**Method:** Quick scan — file counts by extension under `Assets/` (April 2026). Counts include third-party samples (e.g. TextMesh Pro “Examples & Extras”) unless excluded.

## Summary

| Category | Approx. count | Extensions / notes |
|----------|---------------|---------------------|
| Textures / sprites | 253 | `.png` |
| Raster photos | 10 | `.jpg` |
| Audio | 13 | `.wav` (6), `.mp3` (7) |
| Scenes | 32 | `.unity` |
| Prefabs | 16 | `.prefab` |
| Materials | 22 | `.mat` |
| Animation clips | 37 | `.anim` |
| Animator controllers | 22 | `.controller` |

## Notable directories

| Path | Contents (high level) |
|------|------------------------|
| `Assets/Resources` | Game art (`Game/`, `Pixel/`), UI, splash, icons, backgrounds |
| `Assets/Sounds` | Game audio |
| `Assets/Videos` | Video assets |
| `Assets/Animation` | Creature / lock animations |
| `Assets/TextMesh Pro` | TMP fonts, materials, shaders, examples |

## Caveats

- **Quick scan** does not compute disk size or differentiate **first-party** vs **vendor/example** assets (TMP examples inflate counts).  
- **`.meta` files** accompany assets for Unity GUID stability — do not delete casually.  
- **Addressables / Resources:** Heavy use of `Resources/` suggests `Resources.Load` patterns; verify before moving assets.

## Follow-up (optional)

For migration or cleanup, run a **deep scan** that excludes `TextMesh Pro/Examples & Extras` and vendor folders, and totals **size on disk** per folder.
