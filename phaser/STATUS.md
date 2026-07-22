# Status — Xal's Path Web

**Updated:** 2026-07-22  
**Branch:** `cursor/unity-visual-parity-dd6f`

## Done

- Phaser remake with Unity-shaped UX:
  - **Outlook** = BAM world (cast + creatures + region music)
  - **Map** = tower (portrait, chapter cards, banter, portal travel after unlock)
  - **Tomes** = Unity row geometry (aspect-true boxes; name/cost left; owned/`Lvl`+/sec right; square lock avatar)
  - Bottom nav Unity order: Settings → Rewards · Outlook · Map · Tomes (icon + label)
- `PlayScene.ts` is a thin facade; play-only UI lives under `src/scenes/play/`
- Portrait FIT frame **390×844** + pixelArt; dark letterbox on desktop
- Cloud HUD; rocky nav bar; Press Start 2P; framed Settings / Rewards / Tomes
- Settings: speaker + black mute-line toggles; Achievements (green) / Credits (blue) / New Game (orange)
- Rewards: 6-card grid (Helper, Clicker, Video, Earn Rewards, Login, Story), aspect-true frames, scroll, `Rewards:` copy + live influence; projections Watch stub
- Save: `videoGoal/Count` (5), `achievementGoal/Count` (10); claims double goals; meta bumps on other claims
- Map chapter card: locked ch 2–4 shows Lvl **and** 2x Mana Increase
- HUD `!` = chapter ready; Tomes affordability `!` + Rewards claim `!`
- Creatures aspect-true; mana-bar art; scroll thumb rotated (no horizontal→vertical squash)
- `Scene.png` intentionally unused (full-frame `xal-*` tower scenes)
- Separate BGM / SFX mute; localStorage saves; PWA manifest

## Remaining vs Unity (P2 only)

Canonical checklist: [`docs/unity-phaser-ui-parity.md`](docs/unity-phaser-ui-parity.md)

- S6 Settings vertical spacing polish
- R7 Achievement claim SFX/jingle
- R8 Claimed/disabled Receive pressed-state polish
- M4 Barlog full overlay
- M5 Finger-pointer / first-chapter tutorial cues
- T3 First-tome creature unlock splash
- T4 Large-number text collision
- O2 Creature walk-cycles
- O3 News prompts + influence crystal
- O4 Guided finger-pointer tutorial tour
- H4 Cloud nine-slice / sizing fidelity
- N2 Map icon silhouette vs Unity Portal2 (confirm)
- N4 Active tab treatment closer to Unity

## Run

```bash
cd phaser
npm install && npm run dev
```
