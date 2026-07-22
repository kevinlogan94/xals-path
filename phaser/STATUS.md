# Status — Xal's Path Web

**Updated:** 2026-07-22  
**Branch:** `cursor/play-scene-cleanup-dd6f`

## Done

- Phaser remake with Unity-shaped UX:
  - **Outlook** = BAM world (cast + creatures + region music)
  - **Map** = tower (portrait, chapter cards, banter)
  - **Tomes** = Unity row geometry (aspect-true boxes; name/cost left; owned/`Lvl`+/sec right; square lock avatar)
  - Bottom nav Unity order: Settings → Rewards → Outlook → Map → Tomes (icon + label)
- `PlayScene.ts` is a thin facade; play-only UI lives under `src/scenes/play/`
- Portrait FIT frame **390×844** + pixelArt; dark letterbox on desktop
- Cloud HUD; rocky nav bar; Press Start 2P; framed Settings / Rewards / Tomes
- Rewards: achiev_box cards, progress bars, **Receive** claim flow
- Separate BGM / SFX mute; chapter cards use achiev_box art
- Creatures, portal travel, localStorage saves, PWA manifest

## Remaining vs Unity polish

Canonical gap + cleanup checklist: [`docs/unity-phaser-ui-parity.md`](docs/unity-phaser-ui-parity.md)

Highlights still open:

- Settings audio rows + Achievements/Credits/New Game button set
- Rewards: 6-card grid, scroll, copy, aspect-true frames
- Map chapter card shows Lvl + 2x Mana together when locked
- HUD `!` = chapter ready; Tomes `!` = affordable helper
- Guided finger-pointer tutorial tour
- Creature walk-cycle / aspect-true spawns / Xal book idle layers
- First-tome creature unlock splash panel
- News prompts, influence crystal
- Barlog full overlay presentation
- Achievement jingle
- Finer cloud/bar nine-slice fidelity
- Co-locate PlayScene UI under `src/scenes/play/` (see CLEAN tasks in parity doc)

## Run

```bash
cd phaser
npm install && npm run dev
```
