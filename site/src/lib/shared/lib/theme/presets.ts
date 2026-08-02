/**
 * Theme presets — sizing token bundles for each density/typography variant.
 *
 * COLOUR TOKENS ARE NOT DEFINED HERE. They live in app/styles/global.css as
 * `:root`, `:root[data-theme="midnight"]`, and `:root[data-contrast="high"]`.
 *
 * They used to be duplicated here and written onto <html> as inline styles at
 * hydration. Inline styles outrank `:root`, so the stylesheet was silently not
 * the source of truth, and the two copies drifted apart — a contrast fix
 * applied to global.css had no effect once JS ran. Colour now has exactly one
 * home, in CSS, which also means the correct palette is present before
 * hydration and without JavaScript at all.
 *
 * This module keeps only what CSS cannot express as a static rule: density and
 * typography bundles, which are multiplied by the runtime UI scale.
 */
import type { Density, ThemeTokens, TypographyScale } from "./types";

// ── Densities ──

const DENSITIES: Record<Density, ThemeTokens> = {
  compact: {
    "--control-height": "34px",
    "--control-height-sm": "28px",
    "--control-height-lg": "40px",
    "--control-padding": "0 12px",
    "--control-padding-sm": "0 8px",
    "--control-padding-lg": "0 16px",
    "--radius": "5px",
    "--radius-sm": "3px",
  },
  comfortable: {
    "--control-height": "40px",
    "--control-height-sm": "32px",
    "--control-height-lg": "48px",
    "--control-padding": "0 18px",
    "--control-padding-sm": "0 12px",
    "--control-padding-lg": "0 24px",
    "--radius": "6px",
    "--radius-sm": "4px",
  },
  spacious: {
    "--control-height": "46px",
    "--control-height-sm": "38px",
    "--control-height-lg": "54px",
    "--control-padding": "0 22px",
    "--control-padding-sm": "0 16px",
    "--control-padding-lg": "0 28px",
    "--radius": "8px",
    "--radius-sm": "5px",
  },
};

// ── Typography scales ──

const TYPOGRAPHY: Record<TypographyScale, ThemeTokens> = {
  // --font-scale multiplies the fluid clamp() base set on <html>.
  small: { "--font-scale": "0.875" },
  standard: { "--font-scale": "1" },
  large: { "--font-scale": "1.125" },
};

export function resolveTokens(
  density: Density,
  typography: TypographyScale,
): ThemeTokens {
  const tokens: ThemeTokens = {
    ...DENSITIES[density],
    ...TYPOGRAPHY[typography],
  };
  tokens["--ui-scale"] = "1"; // scale multiplier applied separately in singleton
  tokens["--font-scale"] = tokens["--font-scale"] ?? "1";
  return tokens;
}
