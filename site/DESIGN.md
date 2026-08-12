# FreeTheAi Design System

> Monochrome architecture with a single warm heartbeat. Sharp panels, forgiving controls. Built for developers who want the API, not the pageantry.

## Overview

The design language is **monochrome yet alive**: a disciplined near-black canvas with one warm red accent (`--accent-warm`) that appears on eyebrows, active states, and step markers. Everything else is greyscale — white text on near-black surfaces, differentiated by elevation, inset depth, and typographic weight rather than color.

The site is a static SvelteKit app serving a free OpenAI-compatible AI API gateway. The audience is developers: people who want to find a model, copy a code snippet, and ship. Every visual decision serves speed of comprehension.

## Colors

The palette is monochrome greyscale with two functional accents (warm red for brand, magenta-red for donate/danger/amber for states).

```yaml
colors:
  bg: "oklch(0.150 0 0)"           # near-black canvas
  surface: "oklch(0.196 0 0)"       # raised surface
  border: "oklch(1 0 0 / 0.07)"     # hairline border
  border-strong: "oklch(1 0 0 / 0.14)"  # hover/focus border
  text: "oklch(0.931 0 0)"          # primary text (near-white)
  muted: "oklch(0.700 0 0)"         # secondary text — clears WCAG AA
  dim: "oklch(0.625 0 0)"           # tertiary text — clears WCAG AA
  accent: "oklch(0.940 0 0)"        # monochrome accent (white) — filled controls
  accent-text: "oklch(0.969 0 0)"   # accent text with glow
  on-accent: "oklch(0.150 0 0)"     # dark text on light accent fill
  accent-warm: "oklch(0.577 0.215 27.3)"  # brand heartbeat — the one point of chroma
  donate: "oklch(0.750 0.173 353.8)"      # magenta-red for donate CTAs
  danger: "oklch(0.673 0.215 25.0)"       # error/danger
  amber: "oklch(0.666 0.157 58.3)"        # warning/amber
```

### Color rules

- `--accent-warm` is the ONLY chroma in the default palette. Use it for eyebrows, active tab backgrounds, step-number connectors, and badge highlights. Never invent new hue angles.
- `--accent` (white) is for filled controls: primary buttons render as white pills with dark text (`--on-accent`).
- `--donate`, `--danger`, `--amber` are state-specific. Do not use them for decoration.
- All text color tiers are contrast-tested against their lightest possible surface to clear WCAG 1.4.3 AA.

## Typography

Four-font system, loaded from Google Fonts with `display=optional`.

```yaml
typography:
  display: '"Space Grotesk", "Inter", system-ui, sans-serif'  # headings, watermark
  sans: '"Inter", "Segoe UI", system-ui, sans-serif'           # body, UI
  serif: '"STIX Two Text", "Georgia", serif'                    # section headings (editorial)
  mono: '"IBM Plex Mono", "JetBrains Mono", monospace'          # code, eyebrows, metadata
```

- Headlines use `letter-spacing: -0.045em` for tight display setting.
- Eyebrows are `font-mono, 0.68rem, weight 500, letter-spacing 0.1em, uppercase`.
- Code is `--code-bg: oklch(0.178 0 0)` with `--code-text: oklch(0.738 0 0)`.

## Layout

```yaml
spacing:
  grid: 8px               # all spacing snaps to 8px or multiples
  section-gap: "clamp(56px, 8vw, 96px)"  # homepage section rhythm
  shell-padding: "clamp(24px, 4.2vw, 42px)"
  control-height: 40px
  control-height-sm: 32px
  control-height-lg: 48px
```

- `.shell` — raised card surface (border, shell-bg gradient, raised shadow).
- `.inset` — recessed surface (border, inset-bg gradient, inset shadow).
- `.section` — horizontal-padded content row.
- `.jp-dense` — tighter gap rhythm for interior pages.

## Rounded

```yaml
rounded:
  radius: 0           # default — large surfaces, cards, sections (sharp)
  radius-sm: 0        # small surfaces (sharp)
  radius-control: 3px # small interactive elements — tabs, chips, copy buttons
  radius-full: 99px   # pills, circular toggle buttons
```

### Radius rules

- Large surfaces (hero cards, sections, panels): `--radius` (0px). This is the bold identity.
- Small interactive elements (tab buttons, chips, copy buttons): `--radius-control` (3px). Sharp yet forgiving.
- Pills and circular controls: `--radius-full` (99px).
- Never use `calc(var(--radius) - Npx)` — it evaluates to a negative value. Use `--radius-control` directly.

## Elevation

```yaml
elevation:
  raised:  # raised cards, modals
    - "0 10px 10px -9px oklch(0 0 0 / 0.44)"
    - "0 20px 20px -14px oklch(0 0 0 / 0.38)"
    - "0 0 6px oklch(0 0 0 / 0.38)"
  inset:   # recessed surfaces, inputs
    - "0 0.5px 0 oklch(1 0 0 / 0.31)"
    - "0 2px 6px oklch(0 0 0 / 0.56) inset"
  accent-glow:  # hover glow on accent controls
    - "0 0 0 1px oklch(1 0 0 / 0.10)"
    - "0 0 18px oklch(1 0 0 / 0.09)"
```

### Elevation rules

- Three named levels only: raised (cards), inset (inputs), accent-glow (hover).
- A modal is nearer than a card. A dropdown is nearer than the page. This ordering stays stable whoever edited last.
- Never invent shadow blur/opacity values. Every shadow maps to one of the three recipes.

## Motion

```yaml
motion:
  ease-out-expo: "cubic-bezier(0.16, 1, 0.3, 1)"
  ease-out-smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
  ease-in-smooth: "cubic-bezier(0.4, 0, 1, 1)"
  dropdown-open: 180ms
  dropdown-close: 120ms
  button-press: 100ms / 0.96 scale
  hover-lift: -1px / 140ms
  focus-ring: 120ms
```

### Motion rules

- `prefers-reduced-motion: reduce` disables all transforms and transitions.
- `prefers-reduced-motion: no-preference` enables scroll-driven reveal animations (`animation-timeline: view()`) with an `@supports` gate.
- Copy-button icon swap animates via Web Animations API (blur-out → swap → blur-in), auto-reverting after 1500ms.

## Components

### Buttons
- `CtaButton` — primary CTA with optional arrow and bloom effect.
- `DitherButton` — CTA with dither-paint shader background.
- `.kb-button[data-variant]` — `primary` (accent fill), `ghost` (transparent), default (shell bg).

### Surfaces
- `.shell` — raised card.
- `.inset` — recessed panel.
- `DitherGradient` — background glow element.
- `ProgressiveBlur` — page-level blur overlay.

### Navigation
- Desktop: top bar with TextRoll link animation, dropdown for setup guides.
- Mobile: bottom tab bar (Home, Models, Status, More) with drawer sheet.

### Code blocks
- Shiki-highlighted with `dark-plus` theme.
- `.copy-btn` delegated globally via `interactions.ts` — copies nearest `code` text, swaps icon to check, auto-reverts.

## Do's and Don'ts

### Do
- Use `var(--accent-warm)` for the single point of color emphasis.
- Use `var(--radius-control)` on small interactive elements.
- Use elevation levels (raised/inset/glow) to separate surfaces, not borders alone.
- Use `clamp()` for all fluid sizing.
- Load fonts with `display=optional` and `media="print"` swap.

### Don't
- Don't hardcode hex colors — all colors are tokens in `:root`.
- Don't use `calc(var(--radius) - Npx)` — it produces negative values.
- Don't invent shadow values — use the three named elevation recipes.
- Don't add new font families — the four-font system is complete.
- Don't use `backdrop-filter` (glassmorphism) or gradient orbs.
- Don't use purple/indigo glow — the accent is monochrome white + warm red only.
