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

## Deferred from: code review (2026-07-22)

- Helper row still uses non-null `helpers.find(...)!` in `renderShop.ts` — pre-existing; SaveSystem.mergeDefaults always materializes every helper id, so missing rows are not reachable via normal load.
- Settings mute toggle still treats label text ending in `Off` as mute protocol — pre-existing; moved with settings extract, not introduced.
- Rewards claim dispatch remains a nested ternary on `r.id` — pre-existing control flow preserved by the move.
- `TabId` `'achievements'` vs UI label "Rewards" vs `renderRewards` naming — pre-existing tab id; rename would touch nav/types beyond this PR.
- Receive button can no-op if `claim*` returns false after `ready` was true (e.g. corrupted goal=0) — pre-existing edge; no toast on failure.
