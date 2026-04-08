# Archived copy — narrative epic overview (2026-04-07)

This file preserves the previous `_bmad-output/epics.md` (v1.2.x remaster narrative overview) before replacing it with the template-driven epic/story workflow document (`gds-create-epics-and-stories`).

---

# Xal's Path — Development Epics (v1.2.x remaster)

**Companion to:** `_bmad-output/gdd.md`  
**Owner:** Kevin Logan  
**Date:** 2026-04-07

---

## Epic overview

| # | Epic | Goal |
|---|------|------|
| 1 | Art & Resources remaster | Cohesive pixel art + clean `Resources` organization |
| 2 | Publisher & storefront cleanup | Individual developer identity; no dead social / Intrigue-era trails |
| 3 | iOS build, test, release | Ship-quality build on target devices; TestFlight → App Store |
| 4 | QA & full playthrough | Regression-free story, saves, audio on iOS matrix |
| 5 | Android follow-on | Second-wave store and device validation |

---

## Epic 1: Art & Resources remaster

### Goal

Players and you can **trust** the visuals: **one** coherent fantasy pixel style across **regions**, **creatures**, **Xal**, and **UI**; **`Assets/Resources`** is **navigable** and **named consistently**.

### Scope

**Includes:**

- Remaining **background** (`Game/Backgrounds`, icons), **creature** strips, **Xal** portraits, **UI** panels/buttons per **Art** section of GDD.  
- **Folder conventions** and **inventory** alignment (`_bmad-output/asset-inventory.md` as needed).  
- **Safe-area** and **legibility** checks on **iPhone** targets.

**Excludes:**

- **New** creatures or **new** regions beyond remaster of **existing** content.  
- **Code** refactors not required for art swap (unless blocking).

### Dependencies

None (can start immediately).

### Deliverable

**Checklist-driven** “art pass complete” for tracked assets + **screenshot** reference set per region.

### Story candidates (high level)

- As a **player**, I can **read all HUD and dialogue** clearly on a **small phone** after the remaster.  
- As a **developer**, I can **find** any gameplay sprite under **`Resources`** without duplicate mystery paths.  
- As a **developer**, I can **swap** a **Meadow**-tier asset and see it **in-editor and on device** same day.

---

## Epic 2: Publisher & storefront cleanup

### Goal

**No** misleading **publisher** or **social** paths; **Intrigue Games** fully **retired** from product and **store** surfaces.

### Scope

**Includes:**

- Remove/replace **achievement** and **settings** UI tied to **deprecated** social endpoints.  
- **Credits**, **legal**, **first-party** links only.  
- **Store metadata** copy for **individual** listing.

**Excludes:**

- **New** marketing site scope (link **kevinmlogan.com** or successor only as you decide).

### Dependencies

Overlaps **Epic 1** where **art** sits on **achievement** icons (e.g. legacy social glyphs).

### Deliverable

**grep-clean** pass for old LLC strings + **manual** click-through of **every** outbound button.

---

## Epic 3: iOS build, test, release

### Goal

**Installable**, **review-ready** **iOS** build with **ads/analytics** behavior aligned to **current** policies and **your** account.

### Scope

**Includes:**

- **Archive**, **TestFlight**, **device matrix** (min + representative).  
- **Performance** spot-check (**tap** loop, **memory**).  
- **App Store** listing under **individual** developer.

**Excludes:**

- **Android** (Epic 5).

### Dependencies

**Epics 1–2** for content and branding; can run **engineering** spikes earlier.

### Deliverable

**App Store** submission (or **TestFlight** gold candidate).

---

## Epic 4: QA & full playthrough

### Goal

**Confidence** the **remaster** did not **break** **progression**, **saves**, or **story**.

### Scope

**Includes:**

- Full **chapter** run (**7**), **level** climb to **cap** as needed, **shop/helpers**, **buffs**.  
- **Save** migration test if **SavedData** changed.  
- **Audio** pass (levels, SFX, music triggers).

**Excludes:**

- **Automated** test suite expansion (optional stretch).

### Dependencies

**Epic 3** build quality.

### Deliverable

**Signed-off** test report (even if solo—a dated checklist).

---

## Epic 5: Android follow-on

### Goal

**Second** store with **parity** on **core loop** and **no** Android-specific **blockers**.

### Scope

**Includes:**

- **GPGS**, **build**, **device** smoke, **Play** listing.  
- **Regression** on **ads** / **IAP** if any.

**Excludes:**

- **Feature** parity with a **hypothetical** future PC build.

### Dependencies

**Epic 4** recommended so fixes aren’t duplicated.

### Deliverable

**Play** release candidate or **internal** track build.

---

## Recommended order

`1` ↔ `2` (overlap) → `3` → `4` → `5`
