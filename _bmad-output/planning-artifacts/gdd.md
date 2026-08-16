# Xal's Path Web — Game Design Document

**Platform:** Web (desktop + mobile browser), PWA-capable  
**Engine:** Phaser 3  
**Law:** `docs/seed.md`  
**Content source:** Unity `develop` branch

## Concept

Story-driven idle/clicker: the player channels Influence to cleanse corrupted creatures while Xal (and later Barlog) reveal a morally layered seven-chapter arc. Web remake preserves gameplay and narrative from the Unity game; drops platform services (ads, Game Center, analytics).

## Core loop

1. Tap the playfield to cast (spend mana) → gain Influence  
2. Buy Tomes (helpers) → passive Influence + creature spawns  
3. Level up from total Influence earned → unlock chapters & helpers  
4. Read chapters → advance BAM regions → portal / ending  
5. Return later → offline Influence (capped)

## Progression

| Gate | Chapter |
|------|---------|
| Level 1 | 1 The beginning |
| Level 5 | 2 A Blinding Need |
| Level 10 | 3 Searching |
| Level 20 | 4 Find and Take |
| Level 30 | 5–7 (incl. Barlog ch.6, Full Circle) |

Helpers unlock at levels 1, 3, 7, 10, 13, 17, 20, 25, 30, 35 (Nature → Void). Cost multiplies ×1.3 per purchase.

## Regions (BAM)

Meadow → River → Altar. Auto-advance on quote `"It is done."` while story progresses; free travel after portal unlock (all chapters viewed).

## Systems (player-facing)

- **Mana:** regenerates; casts cost `manaMax / (manaLevel × 3)`; manaLevel rises with chapters 2–4  
- **Buff:** 200 casts in a level → 15s infinite mana (once per level)  
- **Creatures:** spawn from owned helpers in current region; tap for ×5 or ×10 Influence  
- **Achievements (local):** Clicker, Helper, Login, Story — no ads/social  
- **Offline:** passive × seconds, max 10 hours, after chapter 1 viewed  
- **Audio:** Xal theme / Barlog theme / region tracks + SFX  

## UI

Play hub + bottom nav: Play · Tomes · Story · Goals · More.

## Explicit non-goals (v1)

Ads, cloud saves, Game Center, ATT, analytics, binary save import, social achievements.

## Phases

0 Bootstrap → 1 Clicker slice → 2 Story → 3 Economy/world → 4 Art/audio → 5 Ship web/PWA
