# Status — Xal's Path Web

**Updated:** 2026-07-15  
**Branch:** `develop`

## Done

- Phaser remake with Unity-shaped UX:
  - **Outlook** = BAM world (cast + creatures + region music)
  - **Xal (Scene)** = tower (portrait, chapters, banter)
  - **Tomes** = shop cards with emblems / cost / owned /sec
  - Bottom nav matches Unity order; re-tap returns to Outlook
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

## Run

```bash
cd phaser
npm install && npm run dev
```
