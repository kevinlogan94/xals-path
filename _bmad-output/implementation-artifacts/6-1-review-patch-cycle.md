---
story_key: 6-1-review-patch-cycle
status: done
baseline_commit: 7ecc53b
---

# Story 6.1 — BMAD review patch cycle

## Goal

Fix unambiguous patch findings from `bmad-code-review-triage.md` so KEEP behaviors hold and critical edge cases cannot soft-lock or exploit the remake.

## Acceptance Criteria

1. **Given** a spawned creature, **When** the player taps it, **Then** influence bonus applies once and the creature despawns; the same tap does not also spend mana via cast.
2. **Given** dialogue hits `"It is done."` on first clear, **When** that line is shown/advanced, **Then** BAM background (and region BGM) update immediately to the new region.
3. **Given** portal is not unlocked, **When** the player opens More, **Then** free Travel buttons are unavailable (auto story region advance still works).
4. **Given** a brand-new save on first load, **When** login tracking runs, **Then** the first calendar day counts toward the login achievement.
5. **Given** story achievement grants influence, **When** XP crosses a level threshold, **Then** level-up runs the same path as other influence gains.
6. **Given** offline earnings applied on load, **When** the session ends immediately, **Then** reloading does not double-grant that offline window.
7. **Given** the game resizes / PlayScene restarts, **When** create runs again, **Then** visibility/pagehide listeners are not stacked and orphaned spawn sprites are cleared.
8. **Given** corrupted achievement goals ≤ 0, **When** achievement checks run, **Then** the game does not infinite-loop (goals clamped).
9. **Given** localStorage write fails, **When** persist runs, **Then** gameplay continues (error swallowed/logged).
10. **Given** player starts a chapter from Story, **When** dialogue begins, **Then** Play tab is active, quote box is managed, and portal toast only appears on first unlock.
11. **Given** Tomes list exceeds viewport on touch, **When** the player drags, **Then** the list scrolls.
12. **Given** all chapters viewed first time, **When** chapter ends, **Then** a clear end/portal message appears and Travel is available under More.

## Tasks

- [x] Patch SpawnSystem + PlayScene creature tap / cast exclusion
- [x] Mid-dialogue region visual + BGM update
- [x] Gate Travel on `portalUnlocked` only
- [x] Fix login first-day + offline persist-after-apply
- [x] Story rewards via EconomySystem.addInfluence; clamp achievement goals
- [x] Save try/catch; sanitize non-finite numbers on load
- [x] Resize/restart: spawn clear + one-shot or removable persist listeners
- [x] Story tab UX: setTab play, hideQuote on tab change, first-unlock toast
- [x] Shop pointer-drag scroll
- [x] Minimal end/portal toast/panel copy
- [x] typecheck + build
- [x] Update sprint status / story checkboxes

## Out of scope

Tutorial pointer tour, walk/idle anims, UTC login, full Unity splash/credits video.

## Dev Agent Record

**Completed:** 2026-07-15

### Notes
- Creature taps call `SpawnSystem.despawn`; cast ignores portrait + creature hits via `ignoreCastUntil` / `spawn.hits`.
- `StorySystem.advance` returns `{ finished, portalJustUnlocked, regionChanged }`; PlayScene refreshes BAM + region BGM on region change; end toast only on first portal unlock.
- Travel under More gated solely on `portalUnlocked`.
- New saves use `lastLoginDay: ''` so day-1 login counts; `GameContext` persists immediately after offline + login.
- `grantStoryReward()` on GameContext uses `economy.addInfluence` (level-up path); story achievement while-loops clamp goals with `Math.max(1, goal)`.
- Save `setItem` wrapped in try/catch; `mergeDefaults` coerces critical numbers with `Number.isFinite` fallbacks.
- PlayScene shutdown removes visibility/pagehide/resize listeners and clears spawns; create clears spawn before attach.
- Chapter start uses `setTab('play')`; `hideQuote` on leaving play; returning to Play while reading re-`renderQuote()`; shop rows + bg support pointer-drag scroll (buy only if drag &lt; 10px).
- First all-chapters clear toast: "The path closes… The portal opens."
- `npm run typecheck` passed.
- Re-review fix: dialogue line-skip after tab switch; touch scroll on tome rows.
