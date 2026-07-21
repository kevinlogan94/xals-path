# Status — Xal's Path Web

**Updated:** 2026-07-21  
**Branch:** `cursor/unity-ui-parity-22ce`

## Done

- Phaser remake with Unity-shaped UX:
  - **Outlook** = BAM world (cast + creatures + region music)
  - **Map (Scene)** = tower (portrait, chapter cards, banter) over `Scene.png`
  - **Tomes** = shop cards with emblems / cost / owned /sec in framed panel
  - Bottom nav Unity order: Settings → Rewards → Outlook → Map → Tomes (icon + label)
- Portrait FIT frame **390×844** + pixelArt; dark letterbox on desktop
- Cloud HUD (influence + level/XP/mana bars); framed Settings / Rewards / Tomes chrome
- Separate BGM / SFX mute toggles
- Creatures cross left→right (~2.5s); tap spends mana for ×5/×10; magic re-tap ×1
- Empty-ground cast summons a creature; passive tomes schedule region-gated spawns
- Portal travel (post-story) drains mana and clears creatures
- BMAD planning + review cycle; localStorage saves; PWA manifest

## Remaining vs Unity polish

- Guided finger-pointer tutorial tour
- Creature walk-cycle / Xal book idle layers
- First-tome creature unlock splash panel
- News prompts, influence crystal
- Barlog full overlay presentation
- Achievement jingle
- Pixel-perfect cloud/bar layout vs Unity screenshots
- Scrollbar chrome on Tomes list

## Run

```bash
cd phaser
npm install && npm run dev
```
