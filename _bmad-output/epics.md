---
stepsCompleted: [1]
inputDocuments:
  - "_bmad-output/gdd.md"
  - "_bmad-output/architecture.md"
  - "_bmad-output/project-context.md"
  - "_bmad-output/development-guide.md"
  - "_bmad-output/asset-inventory.md"
workflow: "gds-create-epics-and-stories"
workflow_step: 2
note: "Previous narrative epic overview preserved in _bmad-output/epics-narrative-overview.md"
---

# Xal's Path - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Xal's Path, decomposing the requirements from the GDD, UX Design if it exists, and Architecture requirements into implementable stories.

### How to read this inventory

The **FR, NFR, and UX-DR lists describe the game as a whole**—the baseline product implied by the GDD (what exists and what “good” looks like). They are **not** limited to “only net-new work in v1.2.x.” **v1.2.x** is a **subset of change** on top of that baseline (see scope below): mostly **art, organization, publisher/store surfaces, iOS path, and QA**, with **gameplay parity** unless you explicitly add a story.

### Scope for v1.2.x (author intent)

**v1.2.x is an art-and-ship milestone**, not a gameplay redesign. The **core incremental loop, economy, chapter gating, and narrative content match prior shipped behavior**; the main changes are **visual remaster**, **`Resources` organization**, **publisher/store cleanup**, **iOS release work**, and **QA** to ensure nothing regressed.

The **functional requirements (FRs)** below mostly **describe what the game already does** so we can **preserve and verify** that behavior after art and tooling changes. They are **not** a mandate to invent new systems for v1.2.x unless the GDD explicitly calls for a presentation-only change (for example Xal Outlook idle layers or stripping dead social links).

## Requirements Inventory

### Functional Requirements

```
FR1: Provide touch-first core gameplay: tap/interact on the main increment control, shop, chapters, settings, and creature/region taps per mobile UI patterns.
FR2: Generate Influence from discrete taps, including creature-region bonuses and situational multipliers as implemented.
FR3: Enforce mana spend and refill rules so active casting is rate-limited while preserving idle pacing.
FR4: Support shop purchases of helpers tied to creatures; helper ownership gates spawns and passive increment flows.
FR5: Advance player level via Influence; unlock chapter story content when player level meets each chapter's LevelRequirement.
FR6: Swap CanvasBackground regions (Meadow, River, Altar) and filter creature eligibility and spawn pools per region implementation.
FR7: Deliver the seven-chapter scripted narrative (Quotes) through the chapter flow without progression softlocks under intended play.
FR8: Apply time-away/offline-style Influence accrual within documented caps when the player returns without killing the app.
FR9: Support buff sessions that track click counts and apply short-term multipliers per BuffManager/SavedData behavior.
FR10: Provide teleport/portal UI to move between unlocked backgrounds along the defined region progression.
FR11: Persist longitudinal game state (Influence, level, helpers, achievements, tutorials, chapters, mana/buffs, etc.) via SaveGame/SavedData, including migration when schema changes.
FR12: Remove Intrigue Games-oriented branding and strip achievement/settings UI that points to deprecated social or media endpoints; keep credits, legal, and honest first-party links only.
FR13: Update in-game and store-facing copy for individual developer identity (no misleading publisher or dead social trails).
FR14: Ship the v1.2.x art remaster: unify pixel line weight, palette, and presentation across backgrounds, creatures, Xal portraits, and UI per GDD Art pillars.
FR15: Organize Assets/Resources with consistent naming and folder conventions aligned to asset inventory documentation.
FR16: Implement Xal Outlook layered idle (book + independent eye animation) when browsing; on story interaction, stop idle layers and show authored expression stills driven by Chapter Expression data.
FR17: Maintain readable HUD and dialogue on small phone screens (TMP legibility, contrast, touch targets) through remaster changes.
FR18: Register shipped scenes (Intro to MainScene and any additions) in Editor Build Settings.
FR19: Keep rewarded-ad level-up multiplier paths auditable and compliant with store policy and individual publisher accounts where implemented.
FR20: Preserve the existing narrative arc and chapter content (presentation and bug fixes only; no rewrite as part of v1.2 scope).
FR21: Support optional analytics/telemetry (e.g. Unity Gaming Services) sparingly and in line with privacy and individual-account setup where used.
FR22: Keep achievements and long-tail meta goals functional without reliance on removed social-linked surfaces (per v1.2 cleanup goals).
```

### NonFunctional Requirements

```
NFR1: Mobile-only product scope: iOS first for validation and release; Android second wave; no PC, console, or web expansion in this roadmap.
NFR2: Portrait-first layout; verify safe areas (notch) and thumb occlusion after UI/art changes.
NFR3: Maintain responsive UI: 30 fps acceptable when consistent; 60 fps desirable when device thermals allow; no sustained frame stalls during tap storms or common shop flows on minimum-target iOS hardware.
NFR4: Cold start and save/load round-trip remain acceptable on mid-tier devices; persistence stays backward-compatible when SavedData evolves.
NFR5: Pin Unity editor to 2023.2.22f1 unless the project explicitly upgrades.
NFR6: No new crash-rate regression versus baseline on iOS during remaster (monitor TestFlight/Xcode).
NFR7: Third-party services (Unity Ads, UGS Analytics/Core, mobile notifications, CloudOnce, Google Play Games) shall meet platform privacy, consent, and store listing requirements.
NFR8: Core gameplay loop remains playable without network; ads and analytics may require connectivity when invoked.
NFR9: Audio: regression-test loudness, loops, and headphones vs speaker on iOS after changes; full re-score not required unless chosen.
NFR10: v1.2 does not commit to broad localization, prestige redesign, new currencies, multiplayer, or marketing campaigns beyond honest store presence (per Out of Scope).
NFR11: Gameplay parity: core mechanics, balance curves, and narrative beats remain the same as prior shipped versions for v1.2.x; changes are limited to art/presentation, asset paths, publisher-facing cleanup, platform release work, and bugfixes where needed—no intentional redesign of the idle loop or story structure.
```

### Additional Requirements

```
- Persistence: Any change to progression or meta must align SavedData and any migration logic in the SaveGame/serialization path.
- Scenes: New shipped scenes must be added to EditorBuildSettings to participate in build flow.
- Architecture: Client-only Unity game; no HTTP API surface or server-authoritative gameplay documented in-repo.
- Third-party: CloudOnce and Google Play Games (Android), Unity Ads, UGS, and related plugins impose platform project settings, IDs, init order, and privacy constraints—verify when touching distribution or services.
- Testing: Unity Test Framework is available; first-party automated coverage may remain minimal—manual QA on device matrix remains primary for remaster sign-off unless expanded voluntarily.
- CI/Ops: No in-repo GitHub Actions workflow was confirmed in the architecture scan; local or external release builds may be manual—document build steps as needed.
- Subsystem layout: Prefer extending existing Manager/Scene/Shop/Achievements/Increment patterns rather than introducing parallel architectures for the same concerns.
- Object pooling: Preserve pooling patterns on hot paths (e.g. Manager) when changing VFX/UI instantiation behavior.
```

### UX Design Requirements

No standalone UX specification exists under `_bmad-output`; the following UX-oriented requirements are extracted from the GDD (Controls, Accessibility, Art, Xal Outlook).

```
UX-DR1: Large touch targets and minimal simultaneous inputs for one-hand play; no precision-gesture dependency for core progression.
UX-DR2: Provide snappy audio and visual feedback on successful taps (e.g. cast VFX at touch position, floating Influence text).
UX-DR3: Display large-magnitude numbers using abbreviated formatting patterns so growth stays legible on phones.
UX-DR4: Improve or preserve color/contrast and text size through TMP and UI sprite remaster (readability on small screens).
UX-DR5: Xal Outlook: idle presentation uses layered book and eye animations; on story interaction, idle motion stops and expression stills take over for dialogue readability.
UX-DR6: Teleport/portal and region iconography remain visually consistent and readable for moving between unlocked biomes.
```

### FR Coverage Map

```
FR1: Epic 4 — Touch-first core gameplay (increment, shop, chapters, settings, regions) verified after remaster
FR2: Epic 4 — Influence generation and multipliers behave as before
FR3: Epic 4 — Mana pacing unchanged and correct
FR4: Epic 4 — Shop, helpers, spawns, passive flows intact
FR5: Epic 4 — Level and chapter gating intact
FR6: Epic 4 — Region backgrounds and creature eligibility intact
FR7: Epic 4 — Full seven-chapter narrative completable without softlocks
FR8: Epic 4 — Time-away Influence accrual within caps
FR9: Epic 4 — Buff sessions and multipliers intact
FR10: Epic 4 — Teleport/portal between unlocked regions works
FR11: Epic 4 — Save/load and migration behavior acceptable (regress if schema touched)
FR12: Epic 2 — Intrigue-era branding and dead social surfaces removed
FR13: Epic 2 — In-game and store copy reflect individual developer identity
FR14: Epic 1 — Pixel remaster unifies art pillars across regions, creatures, Xal, UI
FR15: Epic 1 — Resources folders and naming match agreed conventions
FR16: Epic 1 — Xal Outlook layered idle vs expression stills per chapter flow
FR17: Epic 1 — HUD and dialogue legible on small phones post-remaster
FR18: Epic 3 — Shipped scenes registered; iOS build pipeline healthy
FR19: Epic 3 — Rewarded ads / monetization paths auditable and policy-aligned
FR20: Epic 4 — Narrative arc preserved (no unintended rewrite); presentation-only changes OK
FR21: Epic 3 — Analytics/UGS used sparingly and in line with privacy/account setup
FR22: Epic 2 — Achievements/meta work without removed social dependencies

UX-DR1: Epic 4 — Large touch targets and simple inputs (regression)
UX-DR2: Epic 4 — Tap feedback (VFX/audio/floating text) intact
UX-DR3: Epic 4 — Abbreviated number formatting legible
UX-DR4: Epic 1 — Contrast and TMP readability through art/UI pass
UX-DR5: Epic 1 — Xal idle vs story portrait rule (overlaps FR16)
UX-DR6: Epic 1 — Teleport/portal and region iconography visually consistent

NFR touchpoints (by epic): NFR2–NFR4, NFR6–NFR9 → primarily Epic 3–4; NFR7 → Epic 3 & 5 (stores/SDKs); NFR11 → Epics 1–4 (parity); Android second wave → Epic 5.
```

## Epic List

### Epic 1: Remastered art, Xal presentation, and organized Resources

**Goal:** Players experience one cohesive fantasy pixel style—readable on phones—with Xal Outlook behaving as designed (layered idle vs story stills); you can find, swap, and ship art under `Assets/Resources` using one clear convention.

**FRs covered:** FR14, FR15, FR16, FR17, UX-DR4, UX-DR5, UX-DR6

**Depends on:** None (can start immediately). Informs Epic 2 where achievement/UI art overlaps.

---

### Epic 2: Honest developer identity and clean storefront surfaces

**Goal:** Players and store listings see **you** as the publisher—no Intrigue Games trails, no dead social or achievement links—while achievements and meta still work offline of removed surfaces.

**FRs covered:** FR12, FR13, FR22

**Depends on:** Overlaps Epic 1 where legacy glyphs or panels share art (can run in parallel with coordination).

---

### Epic 3: iOS build, distribution, and compliance

**Goal:** Players can install a review-ready build from your individual account; scenes are wired for shipping; ads, analytics, and notifications meet current policy and project settings.

**FRs covered:** FR18, FR19, FR21

**Depends on:** Epics 1–2 for content and branding; engineering spikes (profiles, archive) can start earlier.

---

### Epic 4: End-to-end confidence (loop, story, saves, audio)

**Goal:** After the remaster, players can still complete the idle loop, chapters, shop, buffs, and saves without regressions—the same core game as before v1.2.x, validated on target iOS hardware.

**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR20, UX-DR1, UX-DR2, UX-DR3

**Depends on:** A stable candidate build from Epic 3 is the usual gate for full-matrix QA; early smoke tests can track Epic 1.

---

### Epic 5: Android follow-on (second wave)

**Goal:** Android players get a parity release with GPGS/build/device issues caught early; store and SDK requirements re-validated for Google Play.

**FRs covered:** Re-validation of FR1–FR11 and service paths on Android; FR19–FR21 reviewed for Play-specific compliance. (Primary FR mapping above targets iOS first; Epic 5 closes the second-wave platform gap.)

**Depends on:** Epic 4 recommended so fixes are not duplicated across platforms.

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
