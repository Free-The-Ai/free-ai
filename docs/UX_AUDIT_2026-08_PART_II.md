# FreeTheAi — UX Audit, Part II: Dynamic & Interaction Layer

**Companion to** `UX_AUDIT_2026-08.md` (commit `dc888cf`), which covered the static layer: design tokens, contrast maths, accessibility tree, and Lighthouse across 8 routes.

**This part covers what Part I explicitly did not:** live interaction behaviour, focus management, dialog and menu lifecycles, search/filter flow, validation semantics, runtime performance, and zoom. Nothing here re-litigates Part I.

**Method:** live CDP instrumentation against the production build (`adapter-static`, no SPA fallback) at 1440×900 and 390×844×3; real keyboard input via the CDP Input domain; a full navigation performance trace; 3-second idle frame sampling; 200% text-scale reflow testing.

---

## 0. Scope corrections

Two sections of the brief have no subject matter in this codebase. Reporting on them would mean inventing findings.

**Forms.** The brief asks for "form validation behavior, inline feedback, error messaging, success states, recovery flows." A repository-wide search returns **zero `<form>` elements**. The three `TextField` instances are live-filter search inputs — no submission, no validation, no success state. There is a latent defect in the component (§2.5), but there is no validation behaviour to audit because none exists.

**Chat/conversation/character-card surfaces.** As recorded in Part I, these do not exist. This is a marketing and documentation site.

---

## 1. What passed — verified live, not assumed

Six subsystems were tested adversarially and **passed**. This matters as much as the failures: it tells the team which patterns to preserve during remediation, and it bounds the blast radius of the fixes below.

### 1.1 Dialog lifecycle — fully APG-compliant

`ModelDetailModal` wraps `shared/ui/Drawer.svelte`. Driven by real keyboard input, the complete lifecycle:

| Step | Result |
|---|---|
| Enter on `.model-card` | dialog opens |
| `role` / `aria-modal` | `dialog` / `true` |
| Accessible name | `"Details for mim/mimo-v2-pro"` (via `aria-labelledby`) |
| Initial focus | moved inside, onto `button.model-modal-copy` |
| Tab from last focusable | stayed inside (`Drawer.svelte:84-89` wraps both directions) |
| Body scroll | locked on open (`scroll-locked`), released on close |
| Escape | closed the dialog |
| Focus restore | **returned to the exact `.model-card` that opened it** |

This is a correct, complete implementation — `previousFocus` capture at `Drawer.svelte:134`, restore at `:147`, Escape with both `preventDefault` and `stopPropagation` at `:69-71`. Many production dialogs fail the focus-restore step; this one does not.

*One robustness suggestion, not a defect:* background content is neither `inert` nor `aria-hidden`. `aria-modal="true"` is respected by current screen readers, and the JS trap handles keyboard containment, so the current implementation is sound. Adding `inert` to sibling roots would be belt-and-braces against older AT. Ranked as a suggestion because I have no evidence of a failure in supported browsers.

### 1.2 Menu button — APG-compliant

| Step | Result |
|---|---|
| Enter on `.catalog-filter-trigger` | `aria-expanded` `false → true` |
| Panel | `role="menu"`, 11 items, visible |
| Focus | moved **into** the first menu item |
| Focus indicator on that item | `2px solid oklch(0.659 0.192 40.1)`, `:focus-visible` matched, distinguishable from siblings |
| Escape | menu closed, panel removed from DOM |
| Focus restore | **returned to the trigger** |

### 1.3 Filter results are announced

`.catalog-summary[aria-live="polite"]` updated correctly through a live typing sequence: `"58 models across all providers"` → `"8 models…"` → `"0 models…"`. Screen-reader users are told the result count changed. This is frequently missing in filter UIs; it is present and working here. (One defect within it — §2.4.)

### 1.4 Empty state exists

Searching `zzzzqqq` renders **"No models match your search."** in `.catalog-results` (84px tall, 1 child). My first probe read `.catalog-panel` — which includes the charts — and appeared empty. Corrected on re-measurement.

### 1.5 Runtime performance is genuinely good

Navigation trace on `/models`, the heaviest route:

| Metric | Value | Assessment |
|---|---|---|
| LCP | 451 ms | good (TTFB 3 ms, render delay 448 ms) |
| CLS | **0.01** | excellent |
| Forced reflow | 59 ms, unattributed, savings "none" | negligible |
| Long tasks in 3 s idle | **0** | — |
| Idle frame time, median | **16.7 ms** | locked to 60 fps |
| Idle frame time, p95 | **16.8 ms** | no tail latency |
| Frames > 20 ms | 1 of 177 (**1%**) | — |

**The interesting result is why.** Nine canvases are live on the page, including a full-viewport WebGL2 shader. Total backing store across all nine: **0.24 megapixels**. The background shader covers 1425×900 CSS px but renders at **89×56 backing pixels**, upscaled with `image-rendering: pixelated`.

That is not a compromise — it *is* the dither aesthetic. The art direction and the performance strategy are the same decision. A conventional full-resolution gradient background would cost roughly 250× the fragment work for a result the design does not want. `DitherShader` also honours `pauseWhenOffscreen` and `document.hidden`.

This deserves stating plainly because Part I's §1.1 recommends adding a CSS fallback behind this canvas. **That fix does not compromise the performance story** — a `background-color` on `html` costs nothing and only fills the gap when the shader is absent.

### 1.6 Header logo is correctly named

`<a class="brand">` has no text, but contains `<svg role="img" aria-label="FreeTheAi">`. Properly named. Flagged by my first heuristic, retracted on inspection.

---

## 2. New findings

### 2.1 — The catalogue search input has no accessible name

**Severity: High · Confidence: High (measured) · WCAG 3.3.2 Labels or Instructions (A) · Effort: 1 attribute**

Measured on the live input:

```
id                     "s1"
element.labels.length  0            ← no <label for> anywhere
aria-label             null
aria-labelledby        null
aria-describedby       null
placeholder            "Search model aliases..."
```

**The placeholder is the only naming source.** Two consequences, both verified:

1. **The label disappears on use.** I typed `glm` through a real input event. The placeholder is replaced by the value; `labelNowVisibleOnScreen: false`. Once a user has typed, nothing on screen states what the field is for. This is the textbook placeholder-as-label failure: it penalises users with working-memory and cognitive impairments precisely when they return to a partially-completed task.
2. **Even before typing, the only label fails contrast.** Part I §1.2 catalogued `.kb-text-field__input::placeholder` among the `--dim` consumers — **2.75:1**. The sole label is sub-AA.

The same pattern repeats in `ProviderStatusGrid` ("Search providers…") and `PaidModelTable` ("Search paid aliases…"). Three instances, one component.

#### This is the second independent Lighthouse blind spot

`/models` scored **95** with only `color-contrast`, `heading-order`, and `label-content-name-mismatch` flagged. axe's `label` rule **did not fire**, because HTML-AAM permits `placeholder` as a last-resort accessible name, so axe computes a non-empty name and passes.

The tool is not malfunctioning — it is answering "does an accessible name exist?" (yes) rather than "does a persistent, sufficient label exist?" (no). The first question is mechanically decidable; the second requires knowing that the name vanishes on input. Part I's §1.2 found axe blind to gradient backgrounds; this is blindness of a different kind — a specification permitting something that research and WCAG 3.3.2 both discourage.

**Fix.** Add a visually-hidden label (the codebase already has `.sr-only`), or a visible one:

```svelte
<TextField label="Search model aliases" labelVisibility="sr-only" ... />
```

`TextField.svelte:55` already renders `<label for={fieldId}>` when `label` is passed — the wiring exists and is simply unused. This is a props change, not a component change.

**Why not just `aria-label`?** It would satisfy axe and screen readers but leave sighted users with the same vanishing-label problem. A persistent visible label serves both. If space is the constraint, a floating label preserves the compact resting state while keeping the label on screen after input — that is the pattern Material and Carbon converged on independently, and the convergence is evidence that the constraint is common and the solution stable.

**UX principles that genuinely apply.** *Recognition over recall* is the direct one: a placeholder converts a recognition task into a recall task the moment it disappears. **Miller's Law / working memory** explains the population affected — the cost lands on users already near capacity. I am **not** citing *Aesthetic-Usability Effect* here even though it is the usual defence of placeholder-only fields: it predicts that users will *forgive* the flaw, not that the flaw is absent, so it cannot justify the pattern.

---

### 2.2 — At 200% text zoom the header CTAs move off-screen and cannot be reached

**Severity: High · Confidence: High (measured) · WCAG 1.4.4 (AA) + 2.4.11 (AA) · Effort: Low**

Setting the site's own `--font-scale` hook to `2` (root font-size 18px → 36px) at a 1425px viewport:

| Control | Right edge | Viewport | Off-screen by | State |
|---|---|---|---|---|
| **♥ Donate** | 1660px | 1425px | **235px** | `fullyOffscreen: true` |
| Join Discord | 1511px | 1425px | 86px | partially clipped |

```
canScrollHorizontally : false
body overflow-x       : clip
both controls focusable: true
```

Because `body { overflow-x: clip }` creates **no scrollport**, the clipped controls cannot be scrolled to. Two failures:

- **1.4.4 Resize Text (AA)** — content and functionality are lost at 200% text scaling. Donate, a primary conversion action, becomes unreachable by pointer.
- **2.4.11 Focus Not Obscured, Minimum (AA, WCAG 2.2)** — both controls remain focusable. A keyboard user tabbing through the header lands on a control that is entirely outside the viewport, with no way to bring it into view.

#### Root cause — and it is not the header

`.nav` is `display:flex; justify-content:space-between`, with `.nav-actions` an `inline-flex` row carrying **no `flex-wrap`**. The codebase *does* have a mitigation:

```css
@media (max-width: 1100px) {
    .donate-button .donate-button-label { display: none; }
    .donate-button { padding: 0 12px; }
}
```

**It cannot fire.** That is a *viewport-width* media query, and text-only zoom does not change viewport width — it changes content width. The entire responsive strategy treats viewport width as the only variable, so any user who scales text without scaling layout falls straight through it.

This is the general defect, not a header bug: the same assumption will break any other content-dense row under text scaling.

**Fix — two lines, addressing the cause:**

```css
.nav        { flex-wrap: wrap; row-gap: 8px; }
@media (max-width: 68.75em) { /* em units respond to root font-size */
    .donate-button .donate-button-label { display: none; }
}
```

`em`-based media queries scale with the root font size, so the existing mitigation begins firing under text zoom as originally intended. `flex-wrap` provides the graceful fallback beyond that. Container queries would be the more precise modern tool, but `em` queries fix the actual bug with less change — the existing rule was already correct in intent and merely used the wrong unit.

**On `overflow-x: clip`.** Part I noted the code comment explaining `clip` was chosen over `hidden` to avoid a wheel-event scroll trap — sound reasoning. I am **not** recommending reverting it. Removing `clip` would convert clipped content into a horizontal scrollbar, which is a *different* 1.4.10 Reflow failure (two-dimensional scrolling), not a fix. The overflow must be eliminated at source by making the header wrap.

---

### 2.3 — The model detail dialog has no close button

**Severity: Medium · Confidence: High · Effort: Low**

Enumerating every control inside the open dialog:

| Control | Name | Tabbable |
|---|---|---|
| `button.model-modal-copy` | "Copy alias" | yes |
| `a.model-modal-docs` | "View API docs" | yes |

`hasExplicitCloseButton: false`. Available dismissals:

- **Escape** — works, keyboard only, no on-screen indication
- **Backdrop click** — works (`pointerEvents` active), pointer only, no affordance
- **Drag handle** — `aria-hidden="true"`, a pointer gesture

So each user population has exactly one dismissal path and **none of them is signposted**. A screen-reader user tabbing the dialog's controls hears "Copy alias" and "View API docs" and encounters no way out; they must already know Escape. A touch user must either guess that tapping outside dismisses, or discover the drag handle.

**This is not a hard WCAG failure** — Escape satisfies 2.1.1 Keyboard, and I will not overstate it. It is an **ARIA APG Dialog pattern deviation** and a discoverability defect.

**UX principles.** *Jakob's Law* is the strongest: users arrive with a near-universal learned model that dialogs carry an × in the corner. Its absence forces recall over recognition. *Postel's Law* is the design rule that follows — accept many ways to close; today each population has exactly one, unsignposted.

**Counter-argument, considered.** The component is a bottom-sheet `Drawer` on mobile, where a drag handle is the platform-native dismissal and an × is often omitted (iOS sheets, Material bottom sheets). That defence is legitimate **on mobile**. It does not extend to the desktop rendering, where no drag affordance is conventional and the sheet reads as a modal. A responsive close button — hidden on mobile where the handle carries the affordance, shown on desktop — resolves both without fighting either platform convention.

---

### 2.4 — An interactive button lives inside an `aria-live` region

**Severity: Low-Medium · Confidence: High · Effort: Trivial**

```
.catalog-summary[aria-live="polite"]
  └── button "Clear filters"
```

Measured announcement text after filtering: `"8 models across all providers Clear filters"`.

The button's label is read as part of every status announcement. Worse, any future change to the button (label, disabled state, appearance/disappearance) will itself trigger a spurious announcement, because mutations *anywhere* inside a live region are announced.

Live regions should contain status text only. Move the button outside the `aria-live` element — a wrapper change, no logic.

---

### 2.5 — `TextField` ships a latent Level-A defect in its error state

**Severity: Medium (latent) · Confidence: High · Effort: 3 attributes**

`TextField.svelte` renders:

```svelte
<div class="kb-text-field" data-invalid={error ? "" : undefined}>
  <input id={fieldId} data-invalid={error ? "" : undefined} ... />
  {#if description}<p class="kb-text-field__description">{description}</p>{/if}
  {#if error}<p class="kb-text-field__error">{error}</p>{/if}
</div>
```

Three problems:

1. `data-invalid` is a **CSS hook only** — there is no `aria-invalid`, so AT is never told the field is in an error state.
2. The error `<p>` has **no `id`**, and the input has **no `aria-describedby`** — the message is visually adjacent but programmatically unconnected. A screen-reader user hears the field and never the error.
3. The same applies to `description`, so hint text is also unannounced.

That is **WCAG 3.3.1 Error Identification (A)** and **1.3.1 Info and Relationships (A)** — if the state were reachable.

**It is not currently reachable.** All three call sites pass only `value`, `placeholder`, and `oninput`; `error` is never set; the site has no forms. **This is a latent defect, and I am ranking it as such rather than as an active failure.**

It is still worth fixing now, and the reason is Poka-Yoke rather than remediation: the component *presents* a working error API. The next engineer who builds a contact or signup form will pass `error`, see it render correctly, and ship a Level-A failure having done nothing wrong. The defect is in the component's design, so the fix belongs there:

```svelte
<input id={fieldId}
       aria-invalid={error ? "true" : undefined}
       aria-describedby={[description && `${fieldId}-desc`, error && `${fieldId}-err`]
                          .filter(Boolean).join(' ') || undefined} ... />
{#if description}<p id="{fieldId}-desc" class="kb-text-field__description">{description}</p>{/if}
{#if error}<p id="{fieldId}-err" class="kb-text-field__error">{error}</p>{/if}
```

Same class of defect as Part I §1.7 (`data-contrast` with no consumers) and §1.1 (`d.colorScheme` as a no-op): **an attribute is written, an effect is assumed, and nothing verifies the effect occurs.** Three instances of one habit is a pattern worth naming to the team, not three unrelated bugs.

---

## 3. Retractions from this pass

Three further hypotheses died under measurement, bringing the two-part total to **seven**.

| Claim | Test | Verdict |
|---|---|---|
| Header logo link is unnamed | inspected contents | **Retracted** — `<svg role="img" aria-label="FreeTheAi">` |
| Filter trigger button is unnamed | inspected contents | **Retracted** — named by contents, "Prefix All prefixes"; my helper omitted content-based naming |
| Zero-result state renders nothing | queried `.catalog-results` directly | **Retracted** — "No models match your search." is rendered; I had measured the wrong container |

All three came from an accessible-name helper I wrote that did not implement content-based naming, plus one wrong selector. The corrective is the same each time: **when a custom probe disagrees with the platform, suspect the probe first.**

---

## 4. Priority — Part II

| # | Finding | Sev | Effort | Fix |
|---|---|---|---|---|
| 1 | §2.1 Search input has no accessible name (×3) | High | 1 prop | pass `label` — the wiring already exists |
| 2 | §2.2 200% text zoom clips header CTAs | High | 2 lines | `flex-wrap: wrap` + `em`-based media query |
| 3 | §2.5 `TextField` latent error semantics | Med | 3 attrs | `aria-invalid` + `aria-describedby` |
| 4 | §2.3 Dialog has no close button | Med | Low | responsive close button |
| 5 | §2.4 Button inside `aria-live` region | Low-Med | Trivial | move it outside |

Combined with Part I, the full remediation for every High and Critical finding across both parts is roughly **fifteen lines of CSS and markup**. None requires a redesign, which is why this audit does not propose one.

---

## 5. Assessment

The pattern across both parts is consistent and worth stating directly.

**The interaction engineering is strong.** The dialog and menu implementations are APG-correct including the steps teams usually miss — focus restore to the exact opener, Escape with propagation stopped, scroll-lock release, focus moved into the menu, a visible `:focus-visible` ring on menu items. The live region works. The empty state exists. Frame timing is locked at 60 fps with zero long tasks, and the background shader's cost is negligible because the pixelated aesthetic and the performance strategy are the same decision.

**The defects cluster in one place: the boundary between a visual state and its programmatic equivalent.** A `data-invalid` attribute with no `aria-invalid`. A `data-contrast` attribute with no CSS. A `d.colorScheme` assignment to a property that does not exist. A placeholder standing in for a label. An error message adjacent to its field but unlinked. Each is an assumption that *writing something that looks like the mechanism* produces the mechanism's effect.

That is a single root cause with a single countermeasure, and it is not more code review: it is **verification at the seam**. Every one of these would have been caught by asking the rendered page rather than reading the source — `element.labels.length`, `getComputedStyle`, a grep of the shipped CSS for the attribute selector. Three of them I only found because I asked the live DOM.

Which is the same lesson my own seven retractions taught from the other direction.

**Remaining uncertainty, stated explicitly:**

- **Real screen-reader behaviour was not observed.** Every accessibility claim here is derived from the DOM, computed styles, ARIA attributes, and focus state — not from NVDA, JAWS, or VoiceOver. That is a genuine limitation. The claims most exposed to it are §2.3 (whether users find Escape in practice) and §1.1's `inert` suggestion (whether `aria-modal` alone suffices in the field). Both are ranked Medium and suggestion respectively for that reason.
- **Chromium 140 only.** Firefox and Safari were unavailable, unchanged from Part I.
- **200% zoom was tested via the site's `--font-scale` hook, not native browser text zoom.** These are equivalent in effect (both scale the root font size without changing the viewport) but not identical in mechanism. I consider the finding solid because the failure is arithmetic — the header's fixed-width content exceeds the viewport once type doubles — but native-zoom confirmation would remove the last doubt.
- **`interactionToNextPaint` was not measured** under sustained input; the trace covered navigation and a 3-second idle window. Given zero long tasks and a p95 frame time of 16.8 ms, poor INP is unlikely, but "unlikely" is not "measured."
