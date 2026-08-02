# FreeTheAi — Evidence-Based UX / Accessibility Audit

**Scope:** `site/` — SvelteKit 2 + Svelte 5 static site, 18 routes, FSD architecture.
**Method:** static analysis of 8,889 CSS lines across 36 style-bearing files; Lighthouse 13.4.1 / axe-core 4.12 across 8 routes; live DOM instrumentation via CDP at a true 390×844×3 mobile viewport; WCAG contrast computed independently from OKLCH source values; comparative renders with and without JavaScript.

A note on scope correction: the audit brief referenced chat interfaces, conversation lists, character cards, and message rendering. **None of these exist in this codebase.** This is a marketing/documentation site for an API gateway. The findings below address what is actually present: a model catalogue with search and filtering, a provider status board, a docs page, pricing tables, setup guides, and policy pages. Applying the brief's component list literally would have produced fabricated findings.

---

## 0. What I got wrong (recorded first, deliberately)

Four hypotheses I formed during this audit were **disproven by subsequent testing**. They are listed before the findings because an audit that hides its own error rate is not measuring anything.

| Initial claim | Test that killed it | Verdict |
|---|---|---|
| "Horizontal overflow clips content on mobile" | True 390px CDP viewport: `docScrollWidth === clientWidth === 390`, **0** overflowing elements | **Retracted.** Headless Chrome clamps `--window-size` to a 485px minimum; my screenshots were 390px crops of a 485px layout. The responsive implementation is clean. |
| "Closed nav dropdown leaks 181 words into the a11y tree" | `getComputedStyle().visibility === 'hidden'`; first link `.focus()` did not become `activeElement` | **Retracted.** Correctly removed from the a11y tree and the tab order. |
| "6 files animate without a reduced-motion guard" | Parsed every `animation:` consumer — all keyframe animations guarded; the 6 files carry only colour/opacity transitions plus three ≤200ms micro-transforms | **Retracted as a user-impacting defect.** Survives only as an architectural concern (§2.6). |
| "The page background is white for everyone" | Renders with GPU disabled still produced `rgb(18,18,18)` via SwiftShader | **Narrowed.** True only when WebGL2 is genuinely unavailable — which is still a real and reachable state (§1.1). |

The methodological lesson generalises: **a measurement harness is a hypothesis about the environment, and it needs its own validation.** Three of these four errors came from trusting a harness (headless flags, a regex heuristic) rather than the rendered artifact.

---

## 1. Critical findings

### 1.1 — The page background has no CSS fallback; the dark theme is entirely GPU-dependent

**Severity: Critical · Confidence: High (directly reproduced) · Effort: 2 lines**

Chain of verified facts:

1. `body { background: transparent; }` — `site/src/lib/app/styles/global.css:~150`
2. Grep of all **159,698 bytes** of shipped CSS: `html{...background}` → **no match**.
3. Grep for `color-scheme` in shipped CSS → **no match**. No `<meta name="color-scheme">` in built `<head>`.
4. `--bg: oklch(0.168 0 0)` is defined in `:root` but only ever consumed by component surfaces (`.nav`, `.model-card:hover`, `.docs-errors-shape pre`, …) — **never by the page canvas**.
5. The only full-viewport background is `<div style="position:fixed;inset:0;z-index:-1">` wrapping `DitherShader.svelte`, whose entire failure handling is:
   ```js
   const gl = canvas.getContext("webgl2", { alpha: false, ... });
   if (!gl) return;                       // DitherShader.svelte:103-104
   ```
   WebGL2-only (`#version 300 es` shaders), silent bail, no fallback, no `<style>` block.

**Reproduction:** served `dist/` with every `<script>` stripped from `home/index.html`. Result: white page canvas, `--text` (near-white) body copy over it, "Browse Models" and "Pricing" links effectively invisible, footer gone.

**Measured damage in the failure state:**

| Token | vs `--bg` (intended) | vs white (failure) |
|---|---|---|
| `--text` | 15.64 AAA | **1.23 FAIL** |
| `--accent-text` | 10.95 AAA | **1.75 FAIL** |
| `--code-text` | 8.25 AAA | **2.32 FAIL** |
| `--donate` | 7.95 AAA | **2.41 FAIL** |

**Reachable triggers** — this is not only the no-JS case: WebGL2 context-creation failure, GPU driver blocklisting, `webgl.disabled` in hardened Firefox profiles, WebGL-blocking privacy extensions, context loss under memory pressure, and any failure of the JS bundle to load or execute.

**Root cause.** Not the shader. The theme bootstrap that *should* have set the canvas colour contains a DOM API error:

```js
// site/src/lib/shared/lib/theme/singleton.ts:168
var d = document.documentElement;
d.setAttribute("data-theme", scheme);
d.colorScheme = "dark";          // <-- no such property on HTMLElement
```

`colorScheme` is exposed on `CSSStyleDeclaration`, not `HTMLElement`. `d.colorScheme = "dark"` creates an inert expando property with **zero rendering effect**. The correct forms are `d.style.colorScheme = "dark"` or a plain CSS declaration. The intent was right; the API was wrong; nothing surfaced the mistake because the whole block is wrapped in `try { … } catch(e) {}` — a bare empty catch, which the project's own standards prohibit.

**Fix** (CSS, not JS — removes the dependency entirely):
```css
html {
    color-scheme: dark;
    background: var(--bg);
}
```
Delete `d.colorScheme = "dark"` from the bootstrap. `color-scheme: dark` additionally fixes native form controls, the UA scrollbar, and `<dialog>` backdrops for free.

**UX principle.** *Postel's Law* — be liberal in what you accept. A design that renders correctly only when a WebGL2 context is granted is maximally intolerant of its own environment. **Jakob's Law** compounds it: users arriving from other dark developer-tool sites carry an expectation of a stable dark surface; a white flash-to-unreadable violates the mental model at the worst moment — first paint.

---

### 1.2 — `--dim` fails WCAG 1.4.3 AA at 36 sites, and Lighthouse cannot see 35 of them

**Severity: Critical · Confidence: High (independently confirmed by axe) · Effort: 1 token value**

`--dim: oklch(0.485 0 0)` = `rgb(95,95,95)` = `#5f5f5f`.

| Backdrop | Ratio | AA small text (4.5:1) |
|---|---|---|
| `--bg` `oklch(0.168)` | 3.00 | **FAIL** |
| `--surface` `oklch(0.213)` | 2.75 | **FAIL** |

I enumerated every rule pairing `color: var(--dim)` with a font-size. **36 are small text (9.9px – 15.4px). Zero qualify as WCAG large text.** A representative sample:

```
 9.9px  .model-chip-label          10.6px  .nav-dropdown-group-label
 9.9px  .detail-section-title      10.6px  .catalog-filter-label
10.4px  .docs-endpoint-head        10.9px  .docs-sidebar-label
11.2px  .card-label                11.5px  .policy-badge
11.2px  .docs-code-lang            12.0px  .footer-bottom
```

`.footer-bottom` and `.card-label` appear on **every page**.

**Independent confirmation.** axe-core reported, verbatim:
> "insufficient color contrast of **2.75** (foreground `#5f5f5f`, background `#191919`, font size 8.8pt (11.73px))"

That is an exact match to my computed value, derived by a different tool from a different starting point. The measurement is sound.

#### Why Lighthouse still scored these pages 100/100

| Page | Lighthouse a11y | `color-contrast` items |
|---|---|---|
| home | **100** | 0 |
| docs | **100** | 0 |
| setup / support / team | **100** | 0 |
| models / status | 95 | 2 |
| pricing | 91 | 4 |

axe flagged `--dim` **only** on `.catalog-filter-label`. The discriminating variable is the ancestor's background:

| Container | Background token | Value | axe |
|---|---|---|---|
| `.catalog-filter-trigger` | `--surface` | `oklch(0.213 0 0)` — **solid** | **computed → flagged** |
| `.shell` (`.panel`, `.code-card`, `.docs-section`, `.status-card`) | `--sk-shell-bg` | `linear-gradient(180deg, …)` | **cannot compute → skipped** |
| `.inset` | `--sk-inset-bg` | `linear-gradient(180deg, …)` | **cannot compute → skipped** |

axe-core does not resolve contrast against gradient backgrounds; it classifies those nodes as *incomplete*. Lighthouse's score is derived from *violations* only — incomplete nodes are silently dropped. **Same token, same 2.75:1, same ~11px size: flagged once, invisible thirty-five times, purely because of the parent's fill type.**

This is the central methodological finding of this audit. `home = 100/100` is not evidence of an accessible page; it is evidence that the automated checker could not reach the page's dominant text-on-surface pattern. Optimising for the Lighthouse number here would have produced *zero* real improvement.

**Fix.** Raise the token: `--dim: oklch(0.585 0 0)` → ≈4.6:1 on `--surface`, ≈5.0:1 on `--bg`. This clears all 36 sites with a one-value change and preserves the intended tertiary hierarchy, because `--muted` (5.26:1) sits above it and `--text` (15.64:1) above that. Verify by rendering the ladder, not by re-running Lighthouse — Lighthouse will report no change.

**UX principle.** *Von Restorff* and the *Law of Similarity* justify a three-tier text hierarchy; neither requires the lowest tier to be illegible. The hierarchy survives at 0.585 because tier separation is *relative*, and relative separation is preserved under a uniform lift.

---

### 1.3 — A visually-hidden SEO block dominates the accessibility tree on `/models`

**Severity: High · Confidence: High (measured live) · Effort: Low**

`.models-static-catalog` is `position:absolute; width:1px; height:1px; clip:rect(0,0,0,0)` — the sr-only pattern, which means *hidden visually, **exposed** to assistive technology*. Its stated purpose (source comment) is "every public alias for crawlers and read-only viewers."

Measured on the live page at 390px:

| Metric | Value |
|---|---|
| Visible words | 502 |
| Words in the sr-only snapshot | 270 |
| **Screen-reader overhead** | **+54%** |
| Headings a screen-reader user encounters | **17** |
| …of which come from the invisible block | **14 (82%)** |

The visible heading sequence is `H1 → H3 → H3`. The full sequence a screen reader traverses is:

```
H1  FreeTheAi public model aliases      ← visible
H3  Models by provider                  ← visible   (H2 skipped — 1.3.1)
H3  By capability                       ← visible
H2  FreeTheAi public model aliases      ← INVISIBLE, duplicates the H1 verbatim
H3  bbl/* 6 models        ┐
H3  eve/* 3 models        │
…   (13 more)             ├ INVISIBLE
H3  xai/* 2 models        ┘
```

Heading navigation — the primary way screen-reader users skim a page — is **82% noise**, and the second heading encountered is a verbatim duplicate of the first.

**Root cause: wrong mechanism for the stated goal.** The goal is "crawlers and no-JS viewers." `sr-only` serves *assistive technology*, which is a different audience. `<noscript>` serves no-JS. Crawlers already execute JS, and the visible catalogue is prerendered regardless.

**Fix.** Move the block inside the existing `<noscript>` (the file already uses one, closed one line earlier), **or** mark it `aria-hidden="true"` if it must stay in the DOM for crawlers. The former is correct: crawlers parse `<noscript>` content, so SEO value is retained at zero a11y cost.

Separately, fix the visible `H1 → H3` skip (Lighthouse `heading-order`, also flagged on `/status`).

**UX principle.** *Cognitive Load* and *Miller's Law*. A sighted user chunks this page visually in one glance. A screen-reader user must hold 17 headings in working memory to find the 3 that matter — a 5.7× penalty imposed by a mechanism intended to help.

---

### 1.4 — `role="button"` on composite cards flattens content and nests a button inside a button

**Severity: High · Confidence: High · Effort: Medium**

`ModelCard.svelte:40-46` and `StatusCard.svelte:37-42`:

```svelte
<article role="button" tabindex="0" aria-haspopup="dialog"
         aria-label={`Open details for ${model.id}`}
         onclick={onSelect} onkeydown={onKeydown}>
  …
  <button class="model-copy" aria-label={`Copy ${model.id}`}>…</button>
</article>
```

Measured live on `/models`: **30 cards, 60 tab stops, 1 nested `<button>` per card.**

Three distinct defects:

1. **Invalid ARIA.** Per the ARIA spec, `button` takes *presentational children* — descendant interactive elements are not guaranteed to be exposed. `<button>` inside `role="button"` is a structural violation, and the copy button's accessible name may be dropped by some AT.
2. **Content flattening.** A `role="button"` is announced as a single named object. The card's metadata chips — `1.0M ctx`, `131k out`, gated/verified status — are **visible to sighted users and unreachable by screen-reader users**, because `aria-label` overrides all descendant text. Verified: `aria-label = "Open details for mim/mimo-v2-pro"`; visible text = `"mim/* mim/mimo-v2-pro 1.0M ctx 131k out content_copy"`.
3. **Tab-order inflation.** 60 stops to traverse 30 cards.

**On Lighthouse's `label-content-name-mismatch` verdict — I partially dispute it.** axe flags this as WCAG 2.5.3 *Label in Name*. Read strictly, 2.5.3 requires the accessible name to contain the **visible label** — the text that identifies the control — not every string inside it. The model id *is* present in the accessible name. As a literal 2.5.3 citation, the flag is weak, and a team could reasonably dismiss it.

**But dismissing it would miss the real problem.** The genuine failure is **WCAG 1.3.1 Info and Relationships** and **4.1.2 Name, Role, Value**: information conveyed visually (the capability chips) is not programmatically determinable, because the `role="button"` wrapper erased it. That is a more serious finding than the one the tool reported, and the tool could not express it.

**Fix — the standard card pattern:**
```svelte
<article class="model-card">                      <!-- no role, no tabindex -->
  <h3><button class="model-card__open" aria-haspopup="dialog">{model.id}</button></h3>
  <dl class="model-meta">…chips as real dt/dd…</dl>   <!-- now readable -->
  <button class="model-copy" aria-label={`Copy ${model.id}`}>…</button>
</article>
```
Keeps 2 tab stops per card but makes both meaningful, exposes the metadata, and removes the ARIA violation. Optionally restore whole-card click affordance with the "pseudo-element overlay" pattern (`.model-card__open::after { position:absolute; inset:0 }`) so the click target stays large while the a11y tree stays correct — this preserves *Fitts's Law* benefits without the ARIA cost.

---

### 1.5 — `/` is a JavaScript-dependent redirect interstitial

**Severity: High · Confidence: High · Effort: Low**

`routes/+page.svelte` renders `RedirectPage`, which is a spinner card reading *"Loading the full site at /home"*, with:

```js
onMount(() => window.location.replace("/home" + location.search + location.hash));
```
plus `<noscript><meta http-equiv="refresh" content="0;url=/home" /></noscript>`.

The canonical domain root — the URL in every share, every backlink, every "freetheai.xyz" typed by hand — renders **no product content** and requires hydration before it moves. `onMount` fires after the framework boots, so the spinner is visible for the whole hydration window.

Consequences:
- **SEO:** `buildSeo({ path: "/" })` sets a self-canonical on a content-free page, splitting authority between `/` and `/home`. Two URLs compete for the same intent.
- **Perceived performance:** an interstitial is added to the shortest, most common path.
- **A11y:** screen-reader users land on a spinner and an unannounced navigation.
- **Doherty Threshold:** the 400ms budget for "system feels instantaneous" is spent on a redirect that produces no information.

**No evidence was found in the codebase justifying why `/` and `/home` are separate routes.** Both exist as distinct prerendered pages.

**Fix (preferred):** render `HomePage` at `/` and 301 `/home → /`, or vice versa — one canonical home. If the split must persist for URL-structure reasons, move the redirect into a `<meta http-equiv="refresh" content="0;url=/home">` in the document `<head>` (not inside `<noscript>`) so it fires before hydration, and set `<link rel="canonical" href="/home">`.

---

### 1.6 — Production API endpoint returns 404; the "online now" feature is dead

**Severity: High · Confidence: High · Effort: Unknown (server-side)**

Lighthouse `errors-in-console` (the sole reason every page scores 96 rather than 100 on best-practices):

```
Failed to load resource: the server responded with a status of 404
https://api.freetheai.xyz/v1/presence
```

Source: `features/presence/ui/OnlineCounter.svelte:32`. The header pill therefore shows `...` permanently — visible in every screenshot taken during this audit.

Notably, this feature was the subject of the **seven most recent commits** (`8f65e34` → `bb28a9c`), iterating on its placement, styling, sound, and a11y labelling. Considerable design effort was invested in a component whose data source does not exist.

Either ship `/v1/presence` or remove the widget. A permanently-loading indicator is worse than no indicator: it signals a broken system on every page.

---

### 1.7 — High-contrast support is declared but entirely unimplemented

**Severity: Medium-High · Confidence: High · Effort: Medium**

The theme bootstrap reads `matchMedia("(prefers-contrast: more)")` and writes `data-contrast="high"` onto `<html>`.

Grep of all shipped CSS:

```
[data-theme]    selector occurrences : 0
[data-contrast] selector occurrences : 0
```

**Zero consumers.** Users who have explicitly requested more contrast at the OS level get **nothing** — while the code reports success. This is worse than absence: it is a silent no-op that would satisfy a code review.

Either implement the overrides:
```css
:root[data-contrast="high"] {
    --dim: oklch(0.72 0 0);
    --muted: oklch(0.80 0 0);
    --border: oklch(1 0 0 / 0.24);
    --border-strong: oklch(1 0 0 / 0.40);
}
```
or delete the detection. The current state is dead code masquerading as a feature — and it is the *same* class of defect as `d.colorScheme = "dark"` in §1.1: an unverified assumption that writing an attribute produces an effect.

---

### 1.8 — `role="row"` without `role="cell"` on `/pricing`

**Severity: Medium · Confidence: High (axe) · Effort: Low**

`PaidModelTable.svelte` builds a div-based grid with `role="row"` but:
- the header row has **no** `columnheader`/`cell` children (`aria-required-children` violation), and
- data rows contain `<button>` directly, which `row` does not permit.

44 nodes flagged. An incomplete ARIA grid is announced worse than a plain `<div>` list, because AT promises table semantics it cannot deliver.

**Fix.** Use a real `<table>` with `<th scope="col">`. The layout is achievable with `display: grid` on the `<table>`/`<tr>` while retaining native semantics, keyboard behaviour, and zero ARIA. This is the *Occam's Razor* solution: the platform already implements what the ARIA is imitating.

---

### 1.9 — Touch targets below 24×24 CSS px

**Severity: Medium · Confidence: High (measured at 390px) · Effort: Low**

**21 of 94** interactive elements measure under 24px in either dimension at a true mobile viewport:

| Element | Size | Note |
|---|---|---|
| `.dk-legend-item` (chart legend) | 40×**14** | Real 2.5.8 failure — no exception applies |
| Footer nav links | ~60–140 × **15** | 2.5.8's inline-text exception is arguable but weak; these are a nav list, not prose |
| `.support-email-group .copy-btn` | 22×22 | Real failure |

I am **not** flagging `.dot-row span` (6px), `.online-dot` (6px), `.model-chip` (22px), or `.nav-dropdown-trigger::after` (14px) — those are decorative or hover-bridge elements, not targets. Reporting them would inflate the count without user impact.

**Fix.** `min-height: 24px` plus vertical padding on footer links and chart legend buttons. Fitts's Law argues for 44px on primary actions; 24px is the WCAG 2.2 AA floor and the right first step.

---

## 2. Design-system findings

The dark palette itself is **well-constructed** — `--text` at 15.64:1, `--muted` at 5.26:1, `--accent` at 5.68:1 are considered choices, and OKLCH is the right colour space for perceptually even ramps. The problems below are structural, not aesthetic.

### 2.1 — No type scale: 37 distinct rem steps

| Metric | Count |
|---|---|
| `font-size` declarations | 335 |
| Distinct values | 79 |
| Distinct plain-`rem` steps | **37** |
| `clamp()` responsive sizes | 35 |
| Type-scale tokens defined | **0** |

The 37 steps: `0.62, 0.65, 0.66, 0.68, 0.70, 0.72, 0.74, 0.75, 0.76, 0.78, 0.80, 0.82, 0.84, 0.85, 0.86, 0.875, 0.88, 0.90, 0.92, 0.95, 0.96, 0.98, 1.00, 1.02, 1.04, 1.05, 1.10, …`

Nine steps sit between 0.62rem and 0.80rem — differences of **0.32px** at a 16px root. These are not perceivable as hierarchy; they are noise. A designed scale is 6–9 steps.

Line-heights show the same drift: **21 distinct values** including `1.02, 1.04, 1.06, 1.08` — again sub-perceptual.

**Why this matters beyond tidiness.** §1.2 exists *because* there is no type scale. When any font-size is reachable, the pairing of a size with a colour is never checked against a contrast rule, and 36 sites drifted below AA one component at a time.

**Fix (Builder-Lite, additive, no rewrite):**
```css
:root {
    --text-2xs: 0.6875rem;  /* 11px — mono labels, eyebrows   */
    --text-xs:  0.75rem;    /* 12px — chips, captions          */
    --text-sm:  0.875rem;   /* 14px — secondary body, nav      */
    --text-base:1rem;       /* 16px — body                     */
    --text-lg:  1.125rem;   /* 18px — lead                     */
    --text-xl:  1.375rem;   /* 22px — h3                       */
    --text-2xl: clamp(1.5rem, 3vw, 2.2rem);   /* h2 */
    --text-3xl: clamp(2.2rem, 5vw, 3.5rem);   /* h1 */
}
```
Migrate opportunistically; a codemod mapping each of the 37 values to its nearest step is mechanical and reviewable in one pass.

### 2.2 — No spacing scale

| Metric | Value |
|---|---|
| px spacing declarations | 797 |
| Distinct values | 42 |
| On a 4px grid | **51%** |
| Odd-pixel values | `5px×15, 7px×7, 9px×7, 3px×5, 17px×3, 15px×1` |
| Spacing tokens defined | **0** |

Odd values guarantee half-pixel rendering at fractional DPR. The *Law of Proximity* does real perceptual work in this UI (cards, chip rows, docs sections); 42 arbitrary gaps make grouping inconsistent between components that should read as siblings.

### 2.3 — No z-index scale

Distinct layers: `-1, 0, 1, 2, 3, 10, 30, 40, 50, 100, 101, 102, 200, 201, 9999, 10000`. Zero tokens. `9999`/`10000` is the classic escalation signature. Four tokens (`--z-base/dropdown/overlay/toast`) would end it permanently.

### 2.4 — Motion tokens exist but are not the single source of truth

Good: 8 motion tokens defined, **238** `var(--ease-*)` usages, only 4 bare-keyword easings. The easing system is genuinely well-adopted.

Weak: **18 distinct durations** (`40, 80, 100, 120, 140, 150, 160, 180, 200, 220, 250, 280, 300, 350, 500, 620, 1800ms`) against 8 tokens, and 5 raw `cubic-bezier()` literals — one of which (`cubic-bezier(0.22, 0.61, 0.36, 1)` in `charts.css`) exists nowhere in `:root`. `charts.css` also uses `0.15s ease` and `160ms ease`, bypassing the system entirely.

Also: `var(--ease-out-smooth, ease)` fallbacks appear in `CtaButton`, `DitherButton`, and `OnlineCounter`. `global.css` is app-wide, so the token is always defined — these fallbacks are unreachable code implying a doubt that does not exist.

### 2.5 — 39 raw re-declarations of `--accent`

Token adherence is **89.7%** (1,490 `var()` uses vs 171 raw literals) — respectable. But the residue is concentrated:

```
19×  oklch(0.659 0.192 40.1 / 0.42)
 7×  oklch(0.659 0.192 40.1 / 0.12)
 5×  oklch(0.659 0.192 40.1)
 4×  oklch(0.659 0.192 40.1 / 0.08)
 4×  oklch(0.659 0.192 40.1 / 0.18)
```

All are `--accent` at alpha variants. Changing the brand colour today requires editing 39 sites. Add `--accent-08/12/18/42` (or use `oklch(from var(--accent) l c h / 0.42)`, supported in all current evergreen browsers) and the brand becomes a one-line change.

### 2.6 — Reduced motion is a manual allowlist

Four `@media (prefers-reduced-motion: reduce)` blocks enumerate **72 class names**. Every animated component must be *remembered* and added by hand. All three infinite animations are currently covered — the system works **today** — but it is a Poka-Yoke inversion: the default is unsafe and safety requires vigilance.

**Fix — make the safe path the default**, then keep the specific blocks for genuine exceptions:
```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```
This converts 72 hand-maintained selectors into 6 lines that cannot be forgotten, and it is a **net LOC reduction**.

### 2.7 — Card boundaries rely on a 1.18:1 border

| Pair | Ratio |
|---|---|
| `--surface` vs `--bg` | **1.09** |
| `--border` (white 6%) vs `--surface` | **1.18** |
| `--sk-border` (white 8%) vs `--surface` | 1.24 |
| `--border-strong` (white 12%) vs `--surface` | 1.43 |
| focus ring `--accent` vs `--surface` | 5.21 ✓ |

Cards are separated from the page by **1.09:1** of luminance — imperceptible. The border is doing all the work at **1.18:1**.

I want to be precise about the standard here, because it is frequently over-applied. **WCAG 1.4.11 does not require decorative borders to reach 3:1.** It applies to boundaries *required to identify a component*. So:

- Static `.panel` / `.code-card`: **not a violation.** They are content containers, not controls. Low-contrast borders are a legitimate aesthetic choice.
- `.model-card` / `.status-card` (`role="button"`, `tabindex="0"`) and `.catalog-filter-trigger`: **these are controls.** Their boundary is the only cue that they are interactive, at 1.18:1. This is a **genuine 1.4.11 failure.**

**Fix.** Raise the border only on interactive surfaces — `--border-interactive: oklch(1 0 0 / 0.30)` (≈3.1:1) — leaving decorative panels untouched. This is also better design: it creates a visual distinction between "container" and "control" that currently does not exist, which is exactly what the *Law of Similarity* would predict users need.

### 2.8 — A 4,241-line `global.css` inside an FSD codebase

The architecture is Feature-Sliced Design; component styles belong to their slices. Yet `global.css` carries page-specific rules — `.catalog-filter-trigger`, `.docs-code-bar`, `.model-chip`, `.policy-hero` — that belong to `features/model-catalog-search`, `pages/docs`, and `pages/privacy`.

Consequences: no dead-code elimination (the rules are global, so Svelte cannot prune them), every page pays for every other page's CSS, and the file is the merge-conflict epicentre.

Also dead: the `::view-transition-*` rules at the top of `global.css` carry the comment *"loader element handles masking"* — grep finds **no** `onNavigate`, `startViewTransition`, or loader element anywhere in `src/`. Stale rules with a comment describing a system that no longer exists.

**Fix.** Keep `:root` tokens, resets, and genuinely shared primitives (`.shell`, `.inset`, `.sr-only`, `.skip-link`) in `global.css`. Move the rest into the owning slice's `<style>`. Delete the view-transition block. Target: under 800 lines.

---

## 3. What is genuinely good

Recording this is not politeness — an audit that only lists defects gives no signal about which patterns to preserve during remediation.

- **OKLCH throughout, with a well-tuned dark ramp.** 15.64 / 5.26 / 5.68 for text/muted/accent are deliberate values, and OKLCH is the correct space for perceptually uniform adjustment. Raising `--dim` will behave predictably *because* of this choice.
- **Focus is handled properly.** A global `:focus-visible` rule covering `a, button, [role=button], input, select, textarea` with a 2px `--accent` outline at 5.21:1 and `outline-offset: 2px`. Verified live on both cards and links. Many production sites fail this outright.
- **Skip link, correctly implemented** — `translateY(-300%)` off-screen, reveals on `:focus`, targets a real `#main-content`.
- **Easing discipline is excellent** — 238 token references against 4 bare keywords.
- **The `overflow-x: clip` comment** explains precisely why `clip` was chosen over `hidden` (avoiding a wheel-event scroll trap). That is exactly the kind of reasoning that should be recorded in code.
- **Responsive layout is clean** — zero overflow at a true 390px viewport, verified after my own false positive.
- **`prefers-contrast` and `prefers-reduced-motion` detection exists.** The wiring is incomplete (§1.7, §2.6), but the intent was there and the fix is small.
- **Closed dropdown panels are correctly removed from the a11y tree** via `visibility: hidden` — confirmed by focus test, not assumed.

---

## 4. Priority

Ordered by (user impact × population reached) ÷ effort.

| # | Finding | Sev | Effort | Fix |
|---|---|---|---|---|
| 1 | §1.1 No CSS page background | Critical | **2 lines** | `html { color-scheme: dark; background: var(--bg) }` |
| 2 | §1.2 `--dim` fails AA ×36 | Critical | **1 value** | `--dim: oklch(0.585 0 0)` |
| 3 | §1.6 `/v1/presence` 404 | High | Server | Ship endpoint or remove widget |
| 4 | §1.5 `/` redirect interstitial | High | Low | Render HomePage at `/` |
| 5 | §1.3 sr-only block floods a11y tree | High | Low | Move into `<noscript>` |
| 6 | §1.7 `data-contrast` no-op | Med-High | Low | Implement overrides or delete |
| 7 | §2.6 Reduced-motion allowlist | Medium | **Negative LOC** | Universal reset, delete 72 selectors |
| 8 | §1.9 Touch targets < 24px | Medium | Low | `min-height: 24px` on footer/legend |
| 9 | §1.8 `role="row"` ARIA | Medium | Low | Real `<table>` |
| 10 | §2.7 Interactive borders 1.18:1 | Medium | Low | `--border-interactive` |
| 11 | §1.4 Composite `role="button"` cards | High | Medium | Restructure card semantics |
| 12 | §2.1 / §2.2 / §2.3 Scale tokens | Medium | Medium | Add tokens, migrate incrementally |
| 13 | §2.8 Split `global.css` | Low | High | Move rules into FSD slices |

**Items 1 and 2 are three lines of CSS and resolve both Critical findings.**

---

## 5. Methodological conclusion

The most consequential result of this audit is not any single defect. It is this pairing:

> **Lighthouse: `home` = 100/100 accessibility, `color-contrast` items = 0.**
> **Direct measurement: 36 WCAG 1.4.3 AA failures, 35 of them on pages Lighthouse scored 100.**

Both statements are true. The gap is fully explained: axe-core cannot compute contrast against `linear-gradient` backgrounds, Lighthouse reports only *violations* and drops *incomplete* nodes, and this design system happens to put almost all of its small text on gradient surfaces. Nothing is wrong with Lighthouse — it is being asked a question outside its resolving power, and it answers honestly by not answering.

A team optimising for the score would have shipped nothing. A team that reads the score as *coverage-limited evidence* finds a one-token fix affecting every page.

The same discipline cut in the other direction four times (§0), where my own hypotheses failed against measurement. The rule that produced both outcomes is identical: **prefer the rendered artifact to the report about the artifact, and validate the instrument before trusting the reading.**

Where I remain uncertain, explicitly:

- **Real-world WebGL2 unavailability rate** is unmeasured. I proved the failure mode is reachable and catastrophic; I cannot state its frequency. Given the fix is two lines, frequency does not change the recommendation — but it would change the priority if the fix were expensive.
- **Cross-browser rendering** was verified in Chromium 140 only. Firefox and Safari were not available in this environment. `oklch()`, `scrollbar-gutter`, `overflow: clip`, and `text-wrap: balance` are all supported in current versions of both, but this is inference from support tables, not observation. `color-scheme: dark` (§1.1) would additionally harden Safari's form-control and scrollbar rendering.
- **§1.4's WCAG citation** is contested above. My position is that axe cites the wrong criterion (2.5.3) for a real failure under a different one (1.3.1 / 4.1.2). A reviewer could reasonably disagree with the citation while still agreeing the card needs restructuring.
