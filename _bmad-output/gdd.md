---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - "_bmad-output/index.md"
  - "_bmad-output/project-overview.md"
  - "_bmad-output/architecture.md"
  - "_bmad-output/source-tree-analysis.md"
  - "_bmad-output/development-guide.md"
  - "_bmad-output/asset-inventory.md"
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 6
workflowType: "gdd"
lastStep: 14
gdd_workflow_status: complete
project_name: "Xal's Path"
user_name: "Kevin Logan"
date: "2026-04-07"
game_type: "idle-incremental"
game_name: "Xal's Path"
document_target_release: "1.2.0"
---

# Xal's Path — Game Design Document

**Author:** Kevin Logan  
**Game Type:** Idle / Incremental  
**Target Platform(s):** iOS (first), Android (later); mobile only  
**Document target release:** v1.2.0 (art remaster)

---

## Executive Summary

### Game Name

**Xal's Path** (v1.2.0 — art remaster)

### Core Concept

**Xal's Path** is a story-driven **idle / incremental** experience: moment-to-moment play centers on clicking and progression systems, with narrative and meta wrapped around that loop. The plot is **morally layered**: it is built to explore **relativism**—how “hero” and “villain” shift depending on whose story is being told—and it pays off in a **late-game reframe** that implicates the player’s role (as reflected in store copy: questioning who the real antagonist is, and **“you might find yourself looking in a mirror”**). It was made as a promise to the designer’s younger self—to ship a real video game—and it is intentionally designed to feel like something **five-year-old you** would have wanted to play: approachable, playful, and readable on the surface, with **deeper thematic bite** delivered through the arc.

The **v1.2.0** effort is not a genre reinvention. The game first shipped around **2022**; the current initiative is a **full art remaster**: updating and unifying visuals, continuing to **clean up and organize** content under **`Resources`**, and supporting **solid playtesting** on the remastered build. The project has already been **moved to the latest Unity**; remaining work is heavily weighted toward **finishing the visual pass**, **asset hygiene**, and **QA**.

### Game Type

**Type:** Idle / Incremental (`idle-incremental`)

**Framework:** This GDD uses the **idle-incremental** template. Type-specific sections cover **core click/interaction**, **upgrade trees**, **automation**, **prestige/reset** (if applicable), **number balancing**, and **meta-progression**—so design and balance stay coherent while art and presentation are upgraded.

### Personal & Product North Star

The emotional center of the project is **keeping a childhood promise**: shipping and polishing a game that honors that commitment. For this document, “success” includes a **cohesive remastered look**, **organized pipelines for art**, and **confidence from testing**—not only feature count.

### Target Audience

- **Primary:** Players who enjoy **incremental progression**, light narrative, and a **kid-friendly** tone and clarity (including adults who want that cozy, “young-at-heart” vibe).  
- **Production audience:** Maintainer(s) of a **brownfield Unity** codebase while executing a **visual remaster** and test plan.

### Unique Selling Points (USPs)

- **Heart-led origin:** A game born from a **promise to your five-year-old self**, with design aimed at **delight at age five**.  
- **Story as differentiator:** A **written-through narrative** (seven chapters of scripted beats) that cares about **perspective, power, and moral ambiguity**—not just flavor text between upgrades.  
- **Remaster clarity:** **v1.2.0** as the **art-forward** milestone on an already-upgraded engine.  
- **Complete package:** Story + incremental loop in a **mobile-first** package, now pushed toward **visual consistency** and **ship-ready polish**.

---

## Target Platform(s)

### Primary platform

**iOS** is the **first** shipping and validation target for the **v1.2.x** remaster; **Android** follows in a **second wave**. Both stores are the **only** intended platforms for this plan—**no** PC, console, or web expansion.

### Platform considerations

- **Mobile-only scope:** Design, performance, and UI assume **phone/tablet** (touch, typical session length, thermal/battery).
- **Pixel art:** The game is **fully pixel art**; the remaster must keep **sprites and UI readable** on small screens and visually coherent across `Resources`.
- **Rollout order:** **iOS** gets the first release and the primary playtesting pass; **Android** is explicitly **later**, not day-one parallel.
- **Developer identity:** The game moves from the dissolved **Intrigue Games** LLC to release under **you as an individual developer**. Ship work includes **removing Intrigue Games–oriented branding** and **stripping achievements and buttons** that send players to **social/media endpoints** tied to the old entity (no dead or misleading outbound links).

### Control scheme

**Touch-first:** tap and standard mobile UI patterns (the idle loop is not designed around controller-first or keyboard-mouse assumptions).

---

## Target Audience

### Demographics

The game can be **all-ages friendly** and readable, but it is **positioned as niche**: the combination of **full pixel art**, **idle/incremental** pacing, and **this narrative voice** naturally selects for players who want **this specific flavor**, not the widest possible mass-market funnel.

### Gaming experience

**Casual-friendly** onboarding, with expectations tuned for players who enjoy **slower-burn, stylistic** mobile games—not only hyper-casual “scale to everyone” titles.

### Genre familiarity

Many players will recognize **tap/upgrade** conventions; others will find the game through **story** and **art**. The experience should **not** assume hardcore idle mastery.

### Session length

**Short bursts** (minutes) are typical; longer sessions are optional for players chasing chapters or goals. Fits **iOS-first** validation (install → short sessions → sustained play).

### Player motivations

**Niche appeal**—“for people who get it”: **pixel aesthetic**, **incremental play + story**, and the **personal origin** of the project. **v1.2 does not** commit to **game-design changes** solely to chase a larger audience; the **niche** read reflects **how the game is already set up**, not a feature roadmap to broaden the funnel.

---

## Goals and Context

### Project goals

1. **Ship the v1.2.x art remaster** — Cohesive **pixel art** across the game, with `Resources` **cleaned up and organized** so the build is maintainable and shippable.  
2. **Validate on mobile in the planned order** — **iOS first** (primary test and release), **Android second**; stay **mobile-only** (no scope creep to other platforms).  
3. **Playtest and stabilize** — Confidence in the remastered build through **real testing**, not only asset swaps.  
4. **Align the product with how you ship today** — Move from dissolved **Intrigue Games** LLC to **you as an individual**; **remove Intrigue-oriented branding** and **strip outbound social/achievement paths** that no longer serve players.  
5. **Honor the personal north star** — Keep the project true to the **promise to your younger self** and “**a game five-year-old you would want**,” without using v1.2 to **redesign core gameplay** (that’s explicitly **out of scope** for now).

### Background and rationale

**Xal’s Path** shipped around **2022**. The engine is already on a **current Unity** line; the active initiative is **visual and organizational**: a **full pixel-art remaster**, finishing work under **`Resources`**, and **QA**—not a genre pivot. You’re also doing **housekeeping that touches the player-facing product**: **publisher identity** (individual vs old LLC) and **removing dead or misleading social hooks**. You’re comfortable describing the game as **niche** given how it’s built; **v1.2** doesn’t try to **chase mass-market design changes**—it **polishes and re-presents** what’s there.

---

## Unique Selling Points (USPs)

1. **Heart-led origin** — A game made to keep a **childhood promise**, designed to feel like something **you’d have loved at five**.  
2. **Full pixel-art identity + idle/incremental spine** — A **specific aesthetic** and loop combination that will never be **everyone’s** game—and that’s aligned with **niche** positioning.  
3. **Philosophical story, not just window dressing** — The campaign is authored to surface **relativism**: who is “right” depends on **frame of reference**; the arc **recontextualizes** allegiances and ends with a **player-facing moral sting** (the “mirror” moment—complicity and perspective, not a single mustache-twirling evil).  
4. **Remaster honesty** — **v1.2.x** as a **clear art-and-ship milestone** on **modern Unity**, not a fake “sequel” pitch.  
5. **Clean storefront story** — Shipping as **an individual** with **no** dangling **Intrigue Games** or **broken social** trails.

### Competitive positioning

In a market crowded with **generic idle** and **pixel** titles, **Xal’s Path** differentiates on **voice and sincerity** (why it exists), a **narrative that asks moral questions** rather than only raising numbers, **consistent pixel presentation** after remaster, and **straightforward mobile scope** (iOS → Android, no platform sprawl). It does **not** claim to be the **largest** or most **systems-heavy** incremental game—it aims to be **recognizable, finished-feeling, and memorable** for players who want **clicker pacing with something to chew on** after the credits.

---

## Core Gameplay

### Game pillars

1. **Readable fantasy** — **Pixel art**, large-touch UI, and clear feedback so the game stays approachable (including the “**five-year-old you**” bar) on **small screens**.  
2. **Satisfying incremental loop** — **Tap / interact → earn → spend on growth** with visible progression (numbers, unlocks, chapter beats).  
3. **Story as structured payoff** — Chapters deliver **scripted dialogue** (e.g. `Assets/ScriptableObjects/Chapters/`) that **escalates conflict**, reveals **Barlog** and **Xal**’s motivations, and lands a **late-game thematic reversal**; the loop exists to **pace** that arc, not replace it.  
4. **Relativism as design intent** — The narrative teaches **moral perspective**: power, duty, harm, and **who counts as the villain** are **contested**; the player’s role is **implicated** in ways that land in the **final chapters** (aligned with public pitch: perspective, power, and **good/evil relativity**).  
5. **Trust and finish (remaster era)** — **Cohesive art**, **stable mobile** sessions, **no broken social**, **no misleading publisher trails**.

**Pillar prioritization (when tradeoffs conflict):** **Readable fantasy** → **Satisfying incremental loop** → **Story payoff / relativism arc** → **Trust and finish**.

### Core gameplay loop

Players **engage the main interaction** (tap / core action), **receive feedback** (currency, meters, effects), **spend on progression** (upgrades, helpers, shop/meta as implemented), and **unlock chapter story beats** via progression gates. Long-term engagement alternates **number growth** with **new dialogue and revelations** that **reframe** earlier events—typical **idle/incremental** cadence on **mobile**, with **narrative escalation** toward the finale.

**Loop diagram (text):**

`Interact (tap)` → `Earn resources / influence` → `Spend or upgrade` → `Advance level / chapter gate` → `New story content (quotes)` → `Stronger returns next cycle` → *(repeat)*

**Loop timing:** **Seconds** per micro-session; **minutes+** for “check in, spend, read chapter”; overall arc spans **many sessions** to reach **late chapters** (e.g. high level gates per chapter data).

**Loop variation:** **Different regions/chapters**, **upgrade branches**, and especially **shifting narrative context** (who to trust, what “cleansing” meant) so iterations are not only **bigger numbers** but **different meaning**.

### Narrative structure (non-spoiler summary)

- **Premise (early game):** Stranger crosses a **barrier**; **Xal** grants power to fight **corruption** across regions (**Meadows**, **Galia River**, **Sci Nai**, etc.).  
- **Mid arc:** **Barlog** (prior “Paragon” / cycle of protectors) is framed as antagonist; themes of **duty**, **fear of irrelevance**, and **using others as instruments**.  
- **Late arc:** Revelations in **Chapters 6–7** expose **manipulation**, **complicity**, and **costs** of the cycle; dialogue explicitly ties to **“villains in someone’s story”** and leaves the **player** holding **power and responsibility**.  
- **v1.2 scope:** **Document and preserve** this arc; remaster **clarity of text and presentation**, not **rewrite** beats.

### Win / loss conditions

#### Victory conditions

**Progression-through-story** success: advancing **chapters**, **cleansing** content as designed, and reaching the **intended end of the narrative arc** (including **thematic resolution** and post-beat exploration as implemented). “Winning” is **finishing the story the game wants to tell**, not only maxing a stat.

#### Failure conditions

**Soft** genre norms: **slower progress** if under-invested; **no** core design pillar around **hard fail states** or **permadeath**. Story does not present a **single game-over screen** as the primary tension—**dramatic** tension is **moral and narrative**.

#### Failure recovery

Players **return to the loop** and continue earning/advancing. **No** dependency on **removed social** recovery paths.

---

## Game Mechanics

### Primary mechanics

| Mechanic | Player verbs | Role in the loop | Pillar(s) served |
|----------|----------------|------------------|-------------------|
| **Channel power (tap / click)** | Tap the main increment control; optional taps on **creature regions** for bonus multipliers | Generates **Influence** (primary currency), triggers **floating feedback**, advances **click counts** used by buffs/achievements | Satisfying loop; readable fantasy |
| **Mana** | Spend **mana** each time you “cast” / increment (when rules allow) | **Rate-limits** active play so taps stay meaningful; refills over time per `ManaBar` | Loop pacing; trust/finish |
| **Helpers & creatures** | Buy **helpers** in the **shop**; own creatures that **spawn** into regions | Converts Influence into **automation** and **visual variety**; ties to idle/incremental fantasy | Loop; story (world presence) |
| **Player level** | Earn Influence toward **level-ups** | Unlocks systems, gates **chapter** access (`LevelRequirement` on chapters), paces narrative | Story payoff; loop |
| **Chapters (story)** | Reach level thresholds; **read** scripted **Quotes** in chapter flow | Delivers **relativism** arc; not a separate minigame—**gated** on progression | Relativism; story pillar |
| **Buffs** | Play during **buff windows**; clicks count toward buff tutorials / sessions | Short-term **multiplier** or engagement spike | Satisfying loop |
| **Meta systems** | **Achievements**, logs, optional ads/survey hooks (legacy) | Long-tail goals; **v1.2 removes social/Intrigue-adjacent achievement paths** per ship goals | Trust and finish |

### Mechanic interactions

- **Tap → Influence → spend (shop) → stronger helpers / higher increments → faster Influence** is the backbone.  
- **Mana** caps burst tapping so the player alternates **active casting** with **waiting** or **passive** income—classic idle pacing.  
- **Level** bridges **economy** and **narrative**: chapter `LevelRequirement` ties story beats to incremental progress.  
- **Creature regions** layer **risk/reward** (e.g. bonus multipliers) on top of the main button.  
- **Buffs** temporarily **amplify** the same verbs without changing the core schema.

### Mechanic progression

- **Early:** Learn tap + mana + first purchases; tutorialized pointers (`FingerPointer` patterns in code).  
- **Mid:** More helpers, new regions, chapter dialogue volume increases.  
- **Late:** Highest chapter gates, buff and achievement layers; **narrative payoff** in final chapters (see **Core Gameplay**).

---

## Controls and input

### Control scheme (iOS primary; Android later)

- **Touch** is the only required input: **single-finger tap** on large UI (increment button, shop, navigation).  
- **Creature / region taps** use the same **touch → screen position** pattern (editor builds may use **mouse position** for parity).  
- **No** mandatory multi-touch, **no** stick/camera scheme—**UI-driven** navigation between main play, shop, chapters, settings.

### Input feel

- **Snappy** audio/visual on successful taps (e.g. cast VFX at touch position).  
- **Readable** numbers (formatted strings via `Monitor`) so growth stays legible on phones.  
- **v1.2 art remaster** should preserve or improve **touch target size** and **contrast** for pixel UI.

### Accessibility

- **Large touch targets** and **minimal simultaneous inputs** suit **one-hand** play.  
- **Color/contrast** and **text size** are candidates for remaster pass (TMP + UI sprites).  
- **No** reliance on **precision gestures** for core progression.

---

## Idle / incremental (genre-specific)

*Sections below map to the `idle-incremental` template. Descriptions reflect **shipped behavior**; v1.2 **documents and polishes**, not redesign.*

### Core click / interaction

- **Tap / click** the main increment control to generate **Influence**; **mana** is consumed per action when rules allow, pacing burst play.  
- **Click power** scales via progression (e.g. `ClickerIncrement` in save data) and situational **multipliers** (creature regions can apply **5× / 10×** style bonuses on rolls).  
- **Auto-click** is not framed as a separate “autoclicker item” in this doc—the **helper/creature** layer provides **passive** pressure instead of literal autoclick.  
- **Feedback:** floating **+Influence** text at input position, **cast** VFX on mobile touch position, audio on spell cast.

**Primary mechanic checklist:** ✓ discrete taps → currency ✓ rising click value ✓ passive pressure via helpers ✓ buff sessions that track click counts ✓ juice (VFX/audio/floating text).

### Upgrade trees

- **Shop / helpers:** Spend Influence on **helpers** tied to **creatures**; ownership gates **what can spawn** in **region backgrounds** (`CanvasBackground`: Meadow, River, Altar, etc.).  
- **Clicker increment** and **player level** act as the main **vertical** growth rails; **creature** unlocks add **horizontal** variety.  
- **Costs & scaling** follow long-number curves typical of the genre (`Monitor.FormatNumberToString` implies large magnitudes).  
- **Unlock conditions:** **level**, **region**, **helper counts**, and **chapter** gates (`LevelRequirement` on `Chapter` assets).  
- **No branching “skill tree” UI** is required by this GDD—the **web** of helpers + regions + level is the upgrade graph.

### Automation systems

- **Helpers** with `AmountOwned > 0` enable **spawn-based passive play**: eligible creatures contribute to **passive increment** flows (`IncrementPanel` / `Monitor` integration).  
- **Background switching** (Meadows, river, mountains/altar per implementation) filters **which** creatures can appear—**soft automation tiers** by biome.  
- **Return-to-app influence:** `IncrementInfluenceForTimeAwayFromGameWithoutKillingApp` grants **offline-style** accrual for time away (capped, e.g. **10 hours** max window in code comments), rewarding **idle** returns without full background simulation claims.  
- **Balance:** **Mana** and **buff cadence** keep **active** play relevant beside **passive** income.

### Prestige and reset mechanics

- **No prestige / meta-reset layer** is documented in shipped systems—progression is **continuous** on a single save. Long-term engagement is **level, chapters, achievements, collection**—not **prestige currency**.

### Number balancing

- **Long integer** Influence and totals (`SavedData`: `Influence`, `TotalInfluenceEarned`)—expect **large exponents** and **formatted display** (abbreviated notation via `Monitor`).  
- **Soft gates:** **mana**, **level XP** bar, **chapter level requirements**, **creature eligibility** by region.  
- **Time gates:** real-time **away** bonus (capped), **buff** windows, **login/achievement** timers where applicable.  
- **v1.2:** **rebalance is out of scope** unless playtesting exposes breakage; document **as-is** curves first.

### Meta-progression

- **Achievements** with multiple goal types (clicks, helpers, video, story counts in `SavedData`)—**v1.2 strips social-linked goals/UI** per publisher cleanup.  
- **Chapters / story** counts as **narrative meta**.  
- **Collectibles:** creature **rescue** fantasy tied to regions and shop.  
- **No alternate modes** or **seasons** called out in core save model—**single campaign** experience.

---


## Progression and Balance

### Player progression

Progression is **primarily numeric power** layered with **narrative and content gates**—aligned with idle/incremental expectations and the shipped **`Monitor` / `LevelUp` / `SavedData`** model.

#### Progression types

| Type | How it shows up in *Xal’s Path* |
|------|----------------------------------|
| **Power** | **Influence** (currency), **`ClickerIncrement`**, **`PlayerLevel`** (caps at **50** per `LevelUp`), **helpers** and **creature spawns** that scale income. |
| **Narrative** | **Chapters** (`Chapter` assets) unlock by **`LevelRequirement`**; **Quotes** advance the relativism arc. |
| **Content** | **Background / region** selection (`CanvasBackground`) gates **which creatures** can spawn—unlocks feel like **new biomes** rather than discrete “world map” levels. |
| **Collection** | Owning **helpers/creatures** and related **achievement** counters (`SavedData` goals). |
| **Meta (light)** | **Login** streaks, **achievement** tiers, optional **rewarded video** hooks for level-up bonuses (`LevelUpPlayer` / `AdvertisementManager`)—**not** a second prestige track. |

#### Progression pacing

- **Level bar:** Players fill a **slider** with Influence toward the next **PlayerLevel**; on level-up, **`Slider.maxValue` scales** (×**3.25** per level-up while staying within float limits)—so each tier asks **more total Influence** than the last (**exponential** demand).  
- **Soft cap:** **Max level 50** bounds the vertical climb.  
- **Story pacing:** Chapter **level floors** (e.g. early chapters at **1, 5, 10**… up to **30** for late content in chapter data) space **narrative beats** across the midgame and endgame.  
- **v1.2:** **Retune** of these curves is **out of scope** unless playtesting shows breakage; document **as-is** first.

### Difficulty curve

- **Pattern:** **Exponential** economic demand (standard for incremental games)—early levels **forgiving**; late levels and **high chapter gates** require **longer grinds** or **optimization** of helpers/regions.  
- **“Challenge”** is mostly **resource/time** pacing, not twitch skill: **mana** limits burst play; **correct helper/region** choices affect efficiency.  
- **Spikes:** Narrative **reveals** can land at fixed levels; they are **emotional** spikes more than mechanical bosses.  
- **Player-controlled difficulty:** **No** dedicated difficulty setting documented—accessibility is **UI clarity**, **large taps**, optional **rewarded ads** to **accelerate** level rewards (player opt-in).  
- **Stuck players:** **Grind** Influence, improve **helpers**, return after **offline-style** accrual, or use **optional ads** where implemented—no separate “easy mode” flag in core save data.

### Economy and resources

#### Primary resource: Influence

- **Earn:** Taps (main and **creature regions**), **passive/helper** flows, **return-to-app** accrual (capped), **level-up rewards**, optional **ad-multiplied** level rewards.  
- **Spend:** **Shop** purchases (helpers), implicit **progression tax** in the **level bar** (Influence invested into the next level).  
- **Display:** Large numbers via **`Monitor.FormatNumberToString`**—economy is built for **magnitude growth**, not tight scarcity simulation.

#### Secondary: Mana

- **Spend:** Each **increment/cast** consumes **mana** when rules allow (`ManaBar` / tap pipeline)—**rate-limits** active play and creates **rhythm** between **spam** and **wait**.  
- **Refill:** Regenerates over time (details live in `ManaBar` implementation; v1.2 may **polish UX** without changing core intent).

#### Optional monetization hooks (legacy / verify in remaster)

- **Rewarded ads** can multiply **level-up reward** (e.g. **3×** vs skip-ad baseline in `LevelUpPlayer`). **v1.2** should **audit** ad paths alongside **store compliance** and **individual** publisher account.  
- **Not** documented here as a **premium currency** economy—**single** soft currency (**Influence**) drives the loop.

#### Economy flow (summary)

`Earn Influence (+ passive/offline)` → `Push level bar & buy helpers` → `Higher rates & new spawns/regions` → `Unlock chapters` → `Repeat until level cap / story complete`.

---

## Level Design Framework

### Structure type

**Single persistent play scene + narrative overlay** — not a linear chain of discrete platformer stages. Core play runs in **`MainScene`** (after intro flow): one **main canvas** with **swappable full-screen backgrounds** (`CanvasBackground`: **Meadow**, **River**, **Altar**) that define **which creatures** can spawn (`Monitor.CreatureCanSpawn`). Progression is **economic + story-gated**, not **geometry-gated** (no jumping between separate level files for each act).

The **README** names additional **world fantasy** (e.g. **Sci Nai Mountains**, **Xal’s Tower**, **Sanctuary**) for player-facing flavor; **implementation** centers on the **three** background modes above plus **UI/scene** flow for story and shop.

### Level types (content buckets)

| Bucket | What it is | Notes |
|--------|------------|--------|
| **Regions / biomes** | **Meadow → River → Altar** (code order of travel in `SceneManager` progression) | Each region swaps **art** and **creature eligibility**; this is the closest thing to “levels.” |
| **Main incremental arena** | Central tap / increment / creature region playfield | Same layout; **background** and **spawn pools** change the feel. |
| **Narrative chapters** | Seven **Chapter** ScriptableObjects with **Quotes** | **Story “levels”** are **gated by `PlayerLevel`** (`LevelRequirement`), not separate maps. |
| **Sanctuary / tower fantasy** | Framed in **lore** (README + dialogue) | Experienced through **narrative** and **UI**, not separate open-world spaces in this GDD’s technical sense. |

#### Tutorial integration

- **Early levels** combine **finger-pointer** tutorials (`FingerPointer` patterns), **level-up tutorial** panels, and **buff** tutorials (`SavedData` / `BuffManager` flags).  
- **Teaching** is **UI-led** on top of the same main scene—not a dedicated tutorial island level file.

#### Special or climax content

- **Climax** is **narrative** (late **Chapters 6–7**), not a separate **boss arena** level.  
- **No** secret “bonus stage” called out in core structure—**achievement** and **story completion** provide closure.

### Level progression

**Model:** **Gated progress** + **linear region unlock** + **story unlock**.

- **Player level** gates **chapter dialogue** (`LevelRequirement` per chapter).  
- **Background / region** advances along a **defined path** (e.g. **Meadow → River → Altar** in `SceneManager` flow); **portal/teleport** UI (`TeleportButton`) lets players **move** between **unlocked** backgrounds.  
- **Influence economy** and **helpers** determine how fast players **earn** the next **level** and thus the next **story beat**.  
- **Replay:** Players can **revisit** regions via **teleport** once unlocked; **incremental** grind is **repeatable** by design. **Story** can be **re-read** through chapter flow as implemented (no separate “New Game+” layer in save model).

#### Unlock system (summary)

`Earn Influence` → `Level up` → `Meet chapter level floor` → `New Quotes / story chunk` + `Shop/helpers` → `Unlock or use portals` → `New region background` → `New creature pools`.

### Level design principles (v1.2 remaster lens)

- **Clarity over complexity:** One **readable** playfield; “level feel” comes from **art + spawns + text**, not maze navigation.  
- **Teach the loop first, philosophy second:** Incremental clarity **early**; **relativism** arc **lands** when players are **invested**.  
- **Pixel readability:** Backgrounds (`Resources/.../Backgrounds`) and **creatures** must stay **legible** at **phone** size—core **v1.2** art pass.  
- **Don’t confuse “region” with “chapter”** in docs: **regions** = **art/spawns**; **chapters** = **scripted story beats**.

---

## Art and Audio Direction

### Art style

**Medium:** **Pixel art** end-to-end—sprites, UI, backgrounds, creatures—optimized for **mobile** readability. Assets are concentrated under **`Assets/Resources`** (e.g. `Game/`, `Backgrounds/`, `Pixel/`) with runtime loads such as `Resources.Load("Game/Backgrounds/meadow")` for full-screen **region** backdrops.

#### Creative intent: fantasy world & druid identity

The look serves a **fantasy-driven** world: **Xal** is framed as a **druid-like guardian**—tower, **wilds**, **blight/corruption**, and **creature rescue**—not a sci-fi or urban setting. The art’s job is to sell **mythic nature**: **pastoral meadows**, **river/air** spirits, and **sacred / ominous** late regions (**Altar**), consistent with **README** world copy (e.g. **Meadows**, **Galia River**, **Sci Nai Mountains**, **Sanctuary**) even when only **three** swap-in backgrounds drive **code** today (**Meadow / River / Altar**).

#### Central art pillars (use these to judge new or remastered assets)

1. **Readable myth** — Silhouettes and **large shapes** read on a **phone**; creatures should be identifiable **at a glance** (e.g. **Griffin**, **Phoenix**, **Basilisk**, **Raiju**, **Void Spawn**, **Wraith**, **Wisp** per shipped filenames and README roster).  
2. **Earnest indie craft** — Style grows from **you learning to draw for this project**; v1.2 **unifies** rather than **replacing** that voice with a generic “pixel pack” look.  
3. **Emotion-forward characters** — **Xal** uses a **multi-expression** portrait set (`xal_happy`, `xal_mad`, `xal_sad`, `xal_shocked`, book/idle animations, etc.); story beats rely on **face + pose**, not cinematic cutscenes. **Barlog** appears as a dedicated portrait (`barlog.png`) for antagonist presence.  
4. **Tone** — **Wonder + unease**: a colorful **bestiary** and inviting UI, while narrative and late regions support **moral weight** (contrast can shift toward **starker** palettes on **Altar**-style scenes without abandoning clarity).

#### World & bestiary (visual identity)

- **Creature fantasy** blends **classic myth** and **original** threats: winged beasts, serpents, storm spirits, **undead/shadow** types, and **“void”** entities—supporting the **corruption / cleansing** fantasy.  
- **Motion:** Many creatures ship as **animation strips** (`*-animation.png`)—remaster should keep **consistent frame counts, pivots, and outline weight** per family.  
- **UI fantasy:** Panels and buttons (`Game/UI/Buttons`, `Game/UI/Panels`) lean **clean arcade-mobile** (bold **color-coded** actions) so **HUD** never fights **story** art.

#### Regions (implemented backgrounds)

| Region (`CanvasBackground`) | Asset roots (examples) | Art role |
|----------------------------|-------------------------|----------|
| **Meadow** | `Game/Backgrounds/meadow.png`, `Backgrounds/meadowIcon.png` | **Opening** idyll—soft, pastoral, “safe” fantasy. |
| **River** | `Game/Backgrounds/river.png`, `Backgrounds/riverIcon.png` | **Aquatic / sky** spirits—cooler, flowing, mid-game breadth. |
| **Altar** | `Game/Backgrounds/altar.png`, `Backgrounds/altarIcon.png` | **Sacred / heavy**—late-game weight and moral pressure. |

Icons support **teleport/portal** UI (`Pixel/Portal2.png`, achievement **portal** art)—visual language for **moving between biomes**.

#### Xal Outlook scene: layered idle vs. story stills (v1.2 intent)

In the **Outlook / Xal scene**, the **idle** presentation should be **revamped** so Xal feels alive while the player is **not** in story text:

1. **Two visual layers (panels)** while idle:  
   - **Book animation** — retains the **reading / book motion** fantasy (existing book animation direction, potentially refreshed art).  
   - **Eye animation** — a **separate** layer so **eyes** can move independently (blink, drift, subtle life) without fighting the book read cycle.

2. **On story interaction** (player engages chapter dialog, banter, or tutorial copy):  
   - **Idle animations stop** (book + eyes layers **end** or **hide**).  
   - The UI **switches** to the **predefined emotion stills** already authored for Xal (`xal_generic`, `xal_happy`, `xal_mad`, `xal_sad`, etc., driven by chapter **`Expression`** data)—so narrative beats stay **readable** and **consistent** with the rest of production.

This is a **design + art + UI wiring** goal for the remaster: **implementation** may evolve (`SceneManager` / `SceneBackgroundController` / animators), but the **player-facing rule** is: **layered idle** when browsing, **static expression portraits** when the story is speaking.

#### v1.2 remaster (art production checklist)

- **Xal Outlook idle:** implement **book + eye** layered idle and **cut to emotion stills** on story interaction (see **Xal Outlook scene** above).  
- **Unify** line weight, **palette ramps**, and **dithering rules** across **creatures**, **Xal**, and **backgrounds**.  
- **Finish** half-updated art and **organize** `Resources` so filenames and folders match **one** convention (documented in **asset inventory** / this GDD).  
- **Remove or replace** deprecated **publisher/social** imagery (e.g. legacy achievement glyphs) so **only** current, honest store/social links remain—aligned with **Intrigue Games** cleanup.  
- **Regression:** every region + **representative creatures** on **target iOS devices** (safe areas, brightness, thumb occlusion on UI).

**References:** Not tied to a single external IP—**earnest indie pixel** + **personal mythic fantasy**; comparable *feel* to story-forward pixel indies, but **your** roster and **druid** framing are the anchor.

**Origin story (authorship):** The visuals are inseparable from how the project started: you **taught yourself to draw in order to ship this game**, with **no prior formal art background**. That learning arc is part of the product’s identity. The **v1.2.x remaster** is about **finishing and unifying** that pipeline—not erasing it.

### Audio and music

**Roles:** **All music** for *Xal’s Path* was written/performed in collaboration with **your brother**, **principal timpanist** at the **Auckland Philharmonic** (New Zealand). You **collaborated on the vision for the score**—pairing **live orchestral sensibility** (timpani-forward discipline, ensemble training) with the **game’s emotional beats**: wonder, tension, revelation, and the **late-game moral turn**.

**Implementation notes:** Audio assets live under project audio pipelines (`Assets/Sounds`, etc.); **v1.2** focuses on **art** first—**audio** should be **regression-tested** on iOS (headphones/speaker, loudness, seamless loops) but **no mandatory re-score** is implied unless you choose it.

**Trailer / OST:** Public-facing links (e.g. **YouTube** OST/trailer in `README`) remain valid references for **tone**; keep listings aligned with **individual** publisher identity during remaster.

---

## Technical Specifications

*GDD-level requirements; detailed architecture lives in `_bmad-output/architecture.md` and `_bmad-output/project-context.md`.*

### Performance requirements

**Profile:** **2D pixel UI + clicker** loop on **mobile**—CPU/GPU load is modest compared to 3D action titles; risk is **frame hitch** from **allocations** on hot paths, **instantiation** storms, and **thermal throttling** on long sessions.

#### Frame rate target

- **Target:** **Stable, fluid UI**—**30 fps** is acceptable for this genre on phones when **consistent**; **60 fps** is desirable where **device thermals** allow. **v1.2** should **profile** on **minimum target iOS hardware** (and a representative Android device later) after art changes.

#### Resolution support

- **Primary:** **Phone portrait** (see `ProjectSettings` portrait autorotation flags)—UI is laid out for **narrow** aspect ratios; `Monitor` includes **resolution-based UI nudges** for smaller/tall screens.

#### Load times

- **Cold start:** Keep **time-to-title** and **time-to-main-scene** reasonable on mid-tier devices; heavy work should avoid blocking first interactive frame where possible.  
- **Save/load:** `SaveGame` + **`JsonUtility`** to **`Application.persistentDataPath`**—loads must stay **fast** and **backward-compatible** when `SavedData` evolves (**migration** if schema changes).

#### Priorities for v1.2

1. **No regressions** in tap/increment responsiveness after art swaps.  
2. **Object pooling** for pooled UI/VFX (existing patterns in `Manager`).  
3. **Ads/analytics** subsystems: no extra stalls on main thread during common flows.

### Platform-specific details

| Topic | Detail |
|-------|--------|
| **Engine** | **Unity 2023.2.22f1** (pin unless intentionally upgrading). |
| **Languages** | **C#** — default **`Assembly-CSharp`** (no project-wide `.asmdef` today). |
| **Ship order** | **iOS first**, **Android second** (per product plan). |
| **Stores / SDKs** | **Unity Ads**, **Unity Gaming Services** (analytics/core), **mobile notifications**, **CloudOnce**, **Google Play Games** (Android extensions)—**IDs and init order** are sensitive; **v1.2** revisits listings under **individual** developer account. |
| **Saves** | **Client-only** JSON via **`SaveGame`** / **`SavedData`**—not an online game backend. |
| **Offline** | Core loop playable **without** network; **ads/analytics** may require connectivity when invoked. |
| **Orientation** | **Portrait-first** configuration; verify **safe areas** (notch) after UI art changes. |
| **Build scenes** | **`Intro.unity` → `MainScene.unity`** registered in **Editor Build Settings**—new shipped scenes must be added explicitly. |

### Asset requirements

| Category | Requirements |
|----------|----------------|
| **Sprites / textures** | **Pixel** sources for **creatures**, **Xal**, **UI**, **backgrounds** under **`Assets/Resources`**; **v1.2** pushes **consistent resolution** and **naming** across `Game/`, `Backgrounds/`, `Pixel/`. |
| **Animation** | Many creatures use **sprite strips** (`*-animation.png`); **Animator** / **Animation** clips under `Assets/Animation`—remaster should preserve **timing** when swapping art. |
| **Audio** | **Music + SFX** under **`Assets/Sounds`** (and related)—**re-encode** only if needed; **loudness** check on **iOS** output. |
| **UI** | **uGUI** + **TextMesh Pro**; scale and **safe-area** padding for **phones**. |
| **Video** | Clips under **`Assets/Videos`** if used in flow—**codec** and **size** awareness on mobile. |
| **Third-party** | **TMP**, **vendor** plugins in **`Assets/Extensions`**, **`Assets/Plugins`**—treat as **stable**; avoid unnecessary upgrades during remaster unless required for **store** compliance. |

**External content:** **Original** art and **collaborative** score—no licensed **IP** art pack as the core identity; **Asset Store** usage is **supporting** (e.g. engine packages), not the creative spine.

---

## Development Epics

### Epic overview

| # | Epic | Scope (summary) | Depends on | Notes |
|---|------|-----------------|------------|--------|
| **1** | **Art & `Resources` remaster** | Finish pixel pass; unify line/palette; organize folders; per-region + creature regression | — | Drives visible **v1.2** value |
| **2** | **Publisher & storefront cleanup** | Remove **Intrigue Games** branding; strip bad social/achievement outbound UI; update credits/legal copy | **1** partial (shared UI surfaces) | Needed before **honest** ship |
| **3** | **iOS build, test, release** | Profiles, **TestFlight**, store listing under **individual** account, ads/analytics consent review | **1**, **2** | **Primary** ship target |
| **4** | **QA & full playthrough** | Story/chapter regression, **save** round-trip, audio levels, device matrix on **iOS** | **3** | Confirms **no** remaster regressions |
| **5** | **Android follow-on** | GPGS/build config, device tests, Play listing | **4** (recommended) | **Second wave** |

### Recommended sequence

1. **Art / Resources** in parallel with **publisher cleanup** where UI overlaps (achievements panel, credits).  
2. **iOS** engineering build early—**smoke test** on device after first **meaningful** art batch.  
3. **QA pass** before wide **TestFlight**.  
4. **Android** after **iOS** milestone is stable.

### Vertical slice (milestone)

**Playable remaster slice:** **One region** (e.g. **Meadow**) fully updated—**background + representative creatures + UI chrome**—running on a **target iPhone** build with **no** critical regressions in **tap loop** and **save/load**.

*Detailed story lists live in `_bmad-output/epics.md`.*

---

## Success Metrics

### Technical metrics

| Metric | Target / method |
|--------|-------------------|
| **Stability** | **No** new crash spikes vs baseline on **iOS** (monitor Xcode/TestFlight crash logs). |
| **Responsiveness** | **No sustained frame stalls** during **tap storms** and **shop** open/close on **min-spec** target device. |
| **Load & save** | **Cold start** and **`SaveGame` round-trip** remain **acceptable** (subjective threshold + stopwatch on device). |
| **Build health** | **iOS** archive + **Android** build succeed with **current** Unity/packages after changes. |

### Gameplay & product metrics

| Metric | Target / method |
|--------|-------------------|
| **Story completion** | Internal playtests: **full chapter arc** completable without **softlocks** (progression + narrative). |
| **Remaster completeness** | **Checklist** coverage: **%** of tracked art assets **remastered** or **explicitly waived**. |
| **Store readiness** | **Zero** dead **social** links; **publisher** identity **consistent** on store page and **in-game** credits. |
| **Qualitative** | **“Feels like one game”**—palette/line **cohesion** across **Meadow / River / Altar**. |

*(Optional: **Unity Analytics** events already exist for clicks/levels—use **sparingly** for privacy and **individual** account setup.)*

---

## Out of Scope

- **New core mechanics** or **systems redesign** (e.g. prestige, new currencies, PvP)—**v1.2** is **remaster + cleanup + ship**, not a **sequel** design pass.  
- **New narrative chapters** or **ending rewrites**—story is **preserved**; only **presentation** and **bug fixes** as needed.  
- **Platforms beyond mobile** (PC, console, web) for this roadmap.  
- **Full re-score / re-record** of music—**not required** unless you choose it.  
- **Broad localization** push—unless explicitly added later.  
- **Multiplayer**, **cloud-synced competitive** features, **UGC**.  
- **Marketing campaign** beyond **honest** store presence (no scope commitment here to large ad spend).

---

## Assumptions and Dependencies

### Assumptions

- **Unity 2023.2.x** line remains **viable** for **App Store / Play** tooling for the remaster window.  
- **Solo (or small)** capacity—epics assume **you** as decision-maker for art approval and store accounts.  
- **Player saves**: existing users (if any sideload/TestFlight) may need **clear communication** if **save format** changes—**migration** tested before release.  
- **Niche** positioning holds—metrics emphasize **finish and trust**, not **DAU** guarantees.

### Dependencies

- **Apple Developer** program + **certificates** for **iOS** distribution.  
- **Google Play** developer account for **Android** phase.  
- **Third-party:** **Unity Ads**, **UGS**, **CloudOnce**, **GPGS**—subject to **ToS** and **SDK** updates; **individual** publisher records must match **store** listings.  
- **Art pipeline:** source files (if any outside repo) accessible for **export** at consistent **pixel** settings.  
- **Audio:** brother’s score remains **licensed/usable** for commercial **redistribution** under your **publishing** entity—verify **rights** for remaster build.

### Handoff / next steps

1. Maintain **`_bmad-output/project-context.md`** when **Unity** or **save schema** changes.  
2. Drive **`epics.md`** into **tasks** (issues or personal checklist) starting with **Epic 1** slice.  
3. Optional: **`gds-create-narrative`** if you ever want a **standalone narrative bible**—the **GDD** already captures **themes** and **chapter structure** at a high level.  
4. Optional: **`gds-game-architecture`** if you need a **deeper** technical spec than this GDD **Technical Specifications** section.

---
