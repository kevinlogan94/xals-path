---
title: 'Achievement splash'
type: 'feature'
created: '2026-07-31'
status: 'done'
baseline_revision: 'ea839c91fea8b8c8b0e8c8e8c8e8c8e8c8e8c8e8'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/implementation-artifacts/splash-unity-detail-pack.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** Rewards claim and chapter 2–4 finish only toast; Unity shows Achievement splash with RewardDescription, artwork, Before/After deltas, Back.

**Approach:** `buildAchievementSplash(opts)` shared builder; RewardsPanel `onAchievementClaim` after claim + rerender; PlayScene opens splash for rewards and Xal mana chapter finish.

## Boundaries & Constraints

**Always:** Little code; detail pack copy pattern; claim → compute deltas → rerender → open splash (setTab dismisses splash); Back closes.

**Block If:** Rerender before splash open (creature-splash bug).

**Never:** Social/review achievements; ad paths.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Helper claim | claim succeeds | Before passive/3 /sec, after passive /sec | Missing icon → text only |
| Clicker claim | claim succeeds | Before inc/15 /click, after inc /click | — |
| Video/Story claim | claim succeeds | Before/after influence ±10h passive | formatNumber |
| Login/Meta claim | claim succeeds | Before/after influence ±1h passive | formatNumber |
| Ch 2–4 finish | chapter complete | Xal splash: mana (lvl-1)*100 → lvl*100 | — |
| Ch 5–6 finish | chapter complete | No splash | — |
| Ch 7 finish | chapter complete | EndGame splash (separate spec) | — |
| Back | tap | Close splash | — |

</intent-contract>

## Code Map

- `phaser/src/scenes/play/splash/achievementSplash.ts` — builder
- `phaser/src/scenes/play/rewards/RewardsPanel.ts` — `onAchievementClaim`, delta helper
- `phaser/src/scenes/PlayScene.ts` — rewards + ch 2–4 triggers
- `phaser/src/systems/StorySystem.ts` — `finishedChapterId` on advance
- `phaser/src/scenes/play/splash/SplashView.ts` — shell (`achievement` type)

## Tasks & Acceptance

**Execution:**
- [x] `achievementSplash.ts` — title, description, icon, Before/After, Back
- [x] RewardsPanel — `onAchievementClaim`; post-claim deltas; rerender then callback
- [x] PlayScene — wire rewards splash; ch 2–4 mana achievement on finish
- [x] StorySystem — return `finishedChapterId`

**Acceptance Criteria:**
- Given claimable reward, when claim succeeds, then achievement splash shows hint copy + before/after (no toast)
- Given chapter 2–4 story finish, when dialogue ends, then mana before/after splash opens
- Given chapter 5–6 finish, when dialogue ends, then no achievement splash
- Given rerender after claim, when splash opens, then splash stays visible

## Spec Change Log

## Review Triage Log

| Issue | Fix |
|-------|-----|
| setTab dismisses splash | rerender before open splash |
| passive stale after helper claim | recompute passive after claim |

## Verification

**Commands:**
- `cd phaser && npx tsc --noEmit` — expected: clean

## Auto Run Result

- Summary: Achievement splash for rewards claims and chapters 2–4 mana finish.
- Follow-up review recommended: false
