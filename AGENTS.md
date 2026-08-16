# Agent guidelines

Rules for work in this repo. Prefer these over default habits unless the user says otherwise.

## Prefer little code

When planning or implementing, meet the acceptance criteria in as little code as possible. Avoid speculative abstractions, extra layers, and “just in case” structure.

## Keep code simple

Favor straightforward, readable changes. Do not over-engineer. Match existing patterns in the project you are editing.

## No unit tests by default

Do not add unit tests unless the user asks for them.

## No backwards compatibility by default

Do not preserve backwards compatibility unless the user asks for it. Prefer the cleanest current solution over compatibility shims.

## Prefer terminal for file ops

When interacting with files, prefer terminal commands over editing files directly when possible (saves tokens). Example: use `mv` instead of writing the file in the new location and removing the old one.

## Package manager

Use pnpm in `phaser/` (not npm or yarn).

## Scene colocation

Active remake lives in `phaser/`. Keep scene-specific UI and helpers next to the scene that uses them under `phaser/src/scenes/`. Shared systems live in `phaser/src/systems/`, shared data in `phaser/src/data/`. Move code to the closest shared parent only when multiple scenes use it. Treat `unity/` as reference only — do not import Unity managers, CloudOnce, ads, or analytics into `phaser/src/`.
