---
title: 'Splash integration pass'
type: 'integration'
created: '2026-07-31'
status: 'done'
baseline_revision: 'cd8ddf83ea725957a9f232ef02a66652d92e8ceb'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-shell.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-influence-over-time.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-splash-buff.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Individual splash builders exist but PlayScene still has stale toast fallbacks, creature taps bypass the splash gate, and startup ordering (offline vs buff) is undocumented.

**Approach:** Integration-only pass — verify shell guarantees, gate remaining gameplay input, remove replaced toasts, document queue + persist paths. No ads/survey.

## Boundaries & Constraints

**Always:** Little code; single splash instance; gameplay input blocked while open; IOT before buff at startup when both pending.

**Block If:** Adding ad/2x Collect or survey flows.

**Never:** New splash types; refactors outside PlayScene / Tomes / Rewards.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Second open | `splash.open(B)` while A open | `destroy()` in `open()` replaces A with B | — |
| Cast during splash | pointerdown on outlook | Early return `splash.isOpen()` | — |
| Creature tap during splash | SpawnSystem tap | `onCreatureTap` returns immediately | — |
| Startup IOT + buff | `offlineGained > 0` && `buffOfferPending` | IOT in `create()`; buff in `update()` only when `!isOpen()` | Buff opens after IOT Collect/close |
| IOT Collect | Collect tap | Grant, clear pending, `persist()`, close | — |
| Buff Collect | Collect tap | `acceptBuffOffer`, `persist()`, close | — |
| Achievement claim | Rewards card | Claim in panel; achievement splash; no toast | — |
| Creature unlock | First tome buy | Creature splash; no unbound toast | — |
| Nav during splash | Bottom nav tap | `setTab` dismisses splash (buff pending reopens) | Intentional per buff spec |

</intent-contract>

## Code Map

- `phaser/src/scenes/play/splash/SplashView.ts` — `open()` calls `destroy()` first → single instance
- `phaser/src/scenes/PlayScene.ts` — cast gate, IOT startup, buff `update()` queue, `onCreatureTap` gate
- `phaser/src/scenes/play/tomes/TomesPanel.ts` — remove unbound toast fallback
- `phaser/src/scenes/play/rewards/RewardsPanel.ts` — remove reward-received toast fallback

## Tasks & Acceptance

**Execution:**
- [x] Document/verify `open()` replaces prior splash (`destroy()` at top of `open`)
- [x] Gate `onCreatureTap` when `splash.isOpen()`
- [x] Verify startup queue: IOT in `create()` after `setTab`; buff `update()` when `buffOfferPending && !isOpen()`
- [x] Remove obsolete toast fallbacks (creature unbound, reward received)
- [x] Verify Collect persist: IOT + buff call `ctx.persist()` on Collect
- [x] `tsc --noEmit` clean

**Acceptance Criteria:**
- Given splash open, when player taps creature or casts on outlook, then no gameplay action runs
- Given offline + buff pending at load, when session starts, then IOT shows first and buff after IOT closes if still pending
- Given achievement claim or first tome unlock, when action completes, then splash shows with no replacement toast

## Intentional toast uses (post-integration)

| Message | Where | Why kept |
|---------|-------|----------|
| `Level N` | PlayScene `update` | Level-up feedback (no splash) |
| `Not enough mana` | cast + creature tap | Resource denial |
| `Requires level N` | chapter button | Story gate |
| `Not enough influence` | TomesPanel buy fail | Shop denial |
| `Projection watched` | RewardsPanel video row | Ad stub feedback (no splash) |

## Spec Change Log

## Review Triage Log

| Issue | Fix |
|-------|-----|
| Creature taps during splash | `onCreatureTap` early return |
| Stale toast fallbacks in panels | Remove else branches; callbacks required from PlayScene |
| Buff vs IOT race at startup | Already sequenced via `!isOpen()` in update loop |

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` — expected: clean

## Auto Run Result

- Summary: Splash integration — input gates, toast cleanup, startup queue verified.
- Follow-up review recommended: false
