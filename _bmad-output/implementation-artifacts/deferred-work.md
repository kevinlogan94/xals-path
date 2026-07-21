# Deferred Work

- source_spec: `_bmad-output/implementation-artifacts/spec-unity-ui-parity.md`
  summary: Persist BGM/SFX mute preferences across reloads
  evidence: AudioSystem mute flags are session-only; SaveSystem never stores them

- source_spec: `_bmad-output/implementation-artifacts/spec-unity-ui-parity.md`
  summary: Draw Tomes scrollbar chrome using scrollBar.png
  evidence: Asset loaded/copied but PlayScene shop scroll has no scrollbar handle

- source_spec: `_bmad-output/implementation-artifacts/spec-unity-ui-parity.md`
  summary: Live-refresh Rewards cards when auto-claim mutates goals mid-panel
  evidence: renderAchievements runs only on tab enter; EconomySystem claims during tick

- source_spec: `_bmad-output/implementation-artifacts/spec-unity-ui-parity.md`
  summary: Replace chapter card rect with Unity ChapterButton / achiev_box art
  evidence: Known shortcut vs Unity Scene chapter card prefab
