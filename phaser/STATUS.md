# Status — Xal's Path Web

**Updated:** 2026-07-22  
**Branch:** `cursor/agent-friendly-play-split-040e`

## Done

- Phaser remake with Unity-shaped UX:
  - **Outlook** = BAM world (cast + creatures + region music)
  - **Map (Scene)** = tower (portrait, chapter cards, banter) over `Scene.png`
  - **Tomes** = shop cards with emblems / cost / owned /sec in framed panel + scrollbar
  - Bottom nav Unity order: Settings → Rewards → Outlook → Map · Tomes (icon + label)
- Portrait FIT frame **390×844** + pixelArt; dark letterbox on desktop
- Cloud HUD; rocky nav bar; Press Start 2P; framed Settings / Rewards / Tomes
- Rewards: achiev_box cards, progress bars, **Receive** claim flow
- Separate BGM / SFX mute; chapter cards use achiev_box art
- Creatures, portal travel, localStorage saves, PWA manifest
- Hub panels colocated under `src/scenes/play/` (agent-friendly blast radius); see `UI_RECIPES.md`

## Remaining (gameplay / content — not visual parity)

- Guided finger-pointer tutorial tour
- Creature walk-cycle / Xal book idle layers
- First-tome creature unlock splash panel
- News prompts, influence crystal
- Barlog full overlay presentation
- Achievement jingle

## Agent notes

- Prefer remaster PNGs under `public/assets/ui/`; do not redraw branded chrome or chase nine-slice fidelity.
- Edit Tomes / Rewards / Settings in `src/scenes/play/`, not by growing `PlayScene.ts`.

## Run

```bash
cd phaser
npm install && npm run dev
```
