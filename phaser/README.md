# Xal's Path Web (Phaser)

Story-driven idle/clicker remake on **Phaser 3 + Vite + TypeScript**.

Lives in the [`xals-path`](../) monorepo next to the original Unity project.

## Source of truth

- Unity reference: [`../unity/`](../unity/) (open that folder in Unity Hub)
- Project law: [`docs/seed.md`](docs/seed.md)
- Repo BMAD / Cursor skills: live at the **monorepo root** (not duplicated here)

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (default `http://localhost:5173`).

```bash
pnpm build      # production build → dist/
pnpm preview    # serve dist/
pnpm typecheck
```

Saves use **localStorage** only (`xals-path-web-save-v1`).

## Stack

- Phaser 3 scenes: Boot → Preload → Play (hub + bottom nav)
- Systems: Economy, Story, Save, Audio, Spawn (via `GameContext`)
- Content: `src/data/*.json` extracted from Unity ScriptableObjects
- Assets: under `public/assets/` (ported from Unity)

## Scope (v1)

**Keep:** 7 chapters, gates 1/5/10/20/30, helpers, buffs, creatures, offline earnings, local achievements, portal/regions, audio.

**Drop:** ads, Game Center/CloudOnce, ATT, analytics, binary save migration.
