---
name: skeuomorphic-ui
description: Build dark skeuomorphic UI components (knobs, sliders, inset controls, raised shells) with top-lighting, layered shadows, tactile depth, and animation-ready interaction patterns. Trigger this skill when the user asks for skeuomorphic components, neumorphic dark controls, rotary dials, or realistic hardware-like UI.
---

# Skeuomorphic UI

Use this skill to design and implement dark skeuomorphic components with consistent lighting, material depth, and tactile motion.

## Non-Negotiable Foundations

- Scene/background must stay in the `#080808` to `#1a1a1a` range.
- Parent skeuomorphic shell should generally sit around: `bg-gradient-to-b from-[#202020] to-[#191919]`.
- Light direction is from the top.
- Every shadow/highlight decision must reinforce top lighting.

## Core Material Recipes

### 1) Raised Shell (main component body)

Use for the big parent/control housing.

- Base:
  - `bg-gradient-to-b from-[#202020] to-[#191919]`
- Highlight + depth shadow recipe:
  - `shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,{black_shadow}]`
- `{black_shadow}` examples (2-3 layers):
  - `0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060`
- Optional **crisp** raised stack (full one-liner, same black lift as above baked in):
  - `shadow-[0_0.5px_0px_#ffffff1a_inset,0_1px_0.5px_#ffffff25_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060]`
  - **When to use:** Only when you deliberately want the surface to read **extra crisp**—tighter micro-edge and a slightly harder highlight. Skip it for default chrome so every control does not fight for the same razor-sharp read.

Notes:
- White inset shadows represent reflected light on upper surfaces.
- Black shadows create lift from the scene/background.

### 2) Inset Surface (trenches, tracks, wells, recessed buttons)

Use for slider slots, inset icon wells, internal cavities.

- Base color should be darker, within `#080808` to `#1a1a1a`.
- Recommended inset shadow:
  - `shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset]`

Notes:
- Keep inset surfaces visibly carved into the parent shell.
- White edge reflection + dark inner shadow should feel concave.

### 3) Popping / Raised Objects (dial caps, knobs, protruding controls)

Use same philosophy as raised shell, with stronger external black depth if needed.

- Reuse raised recipe:
  - `shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_2px_#ffffff35_inset,{black_shadow}]`
- You may intensify black shadows for heavier lift.

## Component Architecture Pattern

When building a complex skeuomorphic control, structure in this order:

1. Scene background (very dark)
2. Parent raised shell
3. Inset zones (track, wells, cavities)
4. Raised interactive objects (dial/button caps)
5. Readout/details (numbers, ticks, icon glows)

This layer order is mandatory for believable depth.

## Interaction Rules

- Keep tactile cues explicit:
  - `cursor-grab` while idle
  - `cursor-grabbing` while dragging
  - subtle active scaling for buttons (`active:scale-[0.97]` style behavior)
- Use spring motion for fill/rotation where possible.
- Preserve realistic feedback timing (short, snappy transitions).

## Dial Guidance

- Use perimeter ticks (even angular distribution).
- Rotation can be driven by pointer angle delta.
- Normalize angle jumps across `-180/180` crossing.
- Map rotation delta to value fill with clamping.
- Optional tick audio should be rate-limited (avoid high-frequency spam).

## Color and Glow Rules

- Accent gradients can vary by mode (e.g., brightness vs volume), but base shell tones stay dark.
- Icon glow must be restrained and mode-aware.
- Glow should never overpower material lighting/shadows.

## Reusable Tailwind Tokens

Use these as defaults unless user asks otherwise:

- Scene bg: `bg-[#0f0f0f]` (or any shade inside `#080808` to `#1a1a1a`)
- Raised shell gradient: `bg-gradient-to-b from-[#202020] to-[#191919]`
- Raised shell light/depth:
  - `shadow-[0_1px_0.5px_#ffffff1a_inset,0_1px_1px_#ffffff35_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060]`
- Raised shell (**crisp** — use sparingly):
  - `shadow-[0_0.5px_0px_#ffffff1a_inset,0_1px_0.5px_#ffffff25_inset,0_10px_10px_-9px_#00000070,0_20px_20px_-14px_#00000060,0_0px_6px_0px_#00000060]`
  - Reserve this stack for hero pieces or focal controls where an unusually sharp, “cut” top edge is desired. Prefer the default raised shell shadow for routine surfaces.
- Inset cavity:
  - `shadow-[0_0.5px_0_#ffffff50,0_2px_6px_#00000090_inset]`

## Quality Checklist (must pass)

- Background is within `#080808` to `#1a1a1a`.
- Parent shell uses near `#202020 -> #191919` gradient.
- Light comes from top consistently.
- Raised areas have top reflective inset whites plus black lift shadows.
- Inset areas look carved in (concave), not flat.
- Protruding parts read clearly above parent surface.
- Interaction states (hover/active/drag) improve tactility.
- Accent glow supports hierarchy, not noise.

## Anti-Patterns

- Flat dark blocks with no layered shadows.
- Random light direction between elements.
- Overbright glow that kills form.
- Insets that look raised (wrong shadow orientation).
- Background lighter than component shell.

## If User Provides Existing Skeuomorphic Code

- Preserve the existing depth hierarchy first.
- Adjust only tokens needed for consistency.
- Do not replace handcrafted shadow stacks with generic presets.

## Typography and Density (Compact Default)

- Default to compact, UI-realistic scale. Do not oversize text.
- Unless the user asks for a hero layout, keep component height and type dense:
  - Primary labels: ~`20px` to `28px`
  - Secondary labels/meta: ~`14px` to `20px`
  - Numeric emphasis: ~`24px` to `34px`
- Keep vertical rhythm tight: prefer smaller paddings/gaps before increasing font size.
- Scale icons with text hierarchy; avoid icons visually dominating labels.
- For skeuomorphic control bars/cards, prioritize compact proportions over dramatic sizing.

## Nested Inset + Popping Button Pattern (Learned Rule)

- When a row has multiple circular action buttons, use **individual inset wells** per button rather than one shared inset group.
- Correct structure:
  - `Outer raised shell` -> `InsetSlot (per button)` -> `CircleBtn (raised/popping)`
- For visual symmetry in each inset well:
  - Button should be **flush on Y-axis** (touch top and bottom of the inset interior).
  - Keep margin/padding mainly on X-axis.
- Recommended implementation pattern:
  - Inset well: `h-full ... p-1.5 ...`
  - Button inside inset: `size-full aspect-square rounded-full ...`
- Avoid:
  - A single shared inset behind several buttons when the design calls for separated wells.
  - Extra top/bottom gap around a popping button inside its inset.

## Raised Material Consistency (Learned Rule)

- Raised child controls (for example circular action buttons) should use the **same raised material gradient** as the raised parent shell by default.
- Default raised material to reuse:
  - `bg-gradient-to-b from-[#202020] to-[#191919]`
- Do not introduce a lighter/different raised gradient for child buttons unless the user explicitly asks for contrast.