# Hub UI recipes (for agents)

Canonical chrome lives under `public/assets/ui/`. Prefer remaster PNGs + Phaser `Image`/`Text`/`Container`. Do **not** redraw branded chrome with `Graphics`, invent a UI framework, or chase Unity nine-slice pixel parity.

## Where to edit

| Screen | File |
|--------|------|
| Tomes (shop) | `renderShop.ts` |
| Rewards | `renderRewards.ts` |
| Settings | `renderSettings.ts` |
| Hub shell (nav, HUD, outlook/map) | `../PlayScene.ts` |
| Shared frame | `framedPanel.ts` |
| `FONT` / `NAV_H` | `constants.ts` |

## Recipes

- **Framed modal:** `addFramedPanel(scene, panel, title)` → `{ contentTop, dimmer }` — dimmer + `ui-panel` + `ui-banner` + title text. Use returned `dimmer` for overlay input (do not assume `panel.list[0]`).
- **Button:** `ui-btn-green` / `ui-btn-blue` / `ui-btn-orange` image + centered `Text` (FONT, white, dark stroke). Stretch with `setDisplaySize`.
- **Card boxes:** `ui-tome-box` / `ui-tome-locked`, `ui-achiev-box`. Use `ui-achiev-box-pressed` only for Map chapter cards in `PlayScene`.
- **Anonymous chrome only:** rectangles for dimmers, XP/mana fills, scroll tracks — not for buttons/panels.
- **Text:** always `FONT` from `constants.ts`; typical stroke `#1a1208`.

## Scope

Keep Unity UX shape (bottom nav order, framed overlays). Do not import more Pixel chrome unless a KEEP feature needs it. Preload keys are registered in `PreloadScene.ts`.
