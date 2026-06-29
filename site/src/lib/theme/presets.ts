/**
 * Theme presets — token bundles for each scheme/density/typography variant.
 *
 * Each preset is a partial CSS-var map. resolveTheme() merges the selected
 * scheme + density + typography + scale + contrast overrides into one flat
 * token map applied to :root. Values preserve the existing Hyperstudio dark
 * aesthetic so the default ("dark"/"comfortable"/"standard") is pixel-identical
 * to the pre-theme :root.
 */
import type {
  ColorScheme,
  Density,
  ThemeTokens,
  TypographyScale,
} from "./types";

// ── Color schemes ──

const SCHEMES: Record<ColorScheme, ThemeTokens> = {
  dark: {
    "--bg": "oklch(0.168 0 0)",
    "--surface": "oklch(0.213 0 0)",
    "--border": "oklch(1 0 0 / 0.06)",
    "--border-strong": "oklch(1 0 0 / 0.12)",
    "--text": "oklch(0.931 0 0)",
    "--muted": "oklch(0.583 0 0)",
    "--dim": "oklch(0.485 0 0)",
    "--control-bg": "oklch(1 0 0 / 0.035)",
    "--code-bg": "oklch(0.178 0 0)",
    "--code-text": "oklch(0.738 0 0)",
    "--sk-bg-gradient":
      "radial-gradient(circle at 50% -12%, oklch(0.659 0.192 40.1 / 0.08), transparent 34rem), linear-gradient(180deg, oklch(0.191 0 0) 0%, oklch(0.168 0 0) 32%, oklch(0.115 0 0) 100%)",
    "--sk-shell-bg": "linear-gradient(180deg, oklch(0.244 0 0) 0%, oklch(0.213 0 0) 100%)",
    "--sk-inset-bg": "linear-gradient(180deg, oklch(0.178 0 0) 0%, oklch(0.209 0 0) 100%)",
  },
  light: {
    "--bg": "oklch(0.970 0 0)",
    "--surface": "oklch(1 0 0)",
    "--border": "oklch(0 0 0 / 0.08)",
    "--border-strong": "oklch(0 0 0 / 0.16)",
    "--text": "oklch(0.218 0 0)",
    "--muted": "oklch(0.549 0 0)",
    "--dim": "oklch(0.647 0 0)",
    "--control-bg": "oklch(0 0 0 / 0.03)",
    "--code-bg": "oklch(0.952 0 0)",
    "--code-text": "oklch(0.387 0 0)",
    "--sk-bg-gradient":
      "radial-gradient(circle at 50% -12%, oklch(0.659 0.192 40.1 / 0.06), transparent 34rem), linear-gradient(180deg, oklch(0.985 0 0) 0%, oklch(0.952 0 0) 32%, oklch(0.928 0 0) 100%)",
    "--sk-shell-bg": "linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.964 0 0) 100%)",
    "--sk-inset-bg": "linear-gradient(180deg, oklch(0.952 0 0) 0%, oklch(0.928 0 0) 100%)",
  },
  midnight: {
    "--bg": "oklch(0.115 0 0)",
    "--surface": "oklch(0.159 0 0)",
    "--border": "oklch(1 0 0 / 0.04)",
    "--border-strong": "oklch(1 0 0 / 0.10)",
    "--text": "oklch(0.955 0 0)",
    "--muted": "oklch(0.566 0 0)",
    "--dim": "oklch(0.471 0 0)",
    "--control-bg": "oklch(1 0 0 / 0.025)",
    "--code-bg": "oklch(0.134 0 0)",
    "--code-text": "oklch(0.683 0 0)",
    "--sk-bg-gradient":
      "radial-gradient(circle at 50% -12%, oklch(0.659 0.192 40.1 / 0.06), transparent 34rem), linear-gradient(180deg, oklch(0.134 0 0) 0%, oklch(0.115 0 0) 32%, oklch(0 0 0) 100%)",
    "--sk-shell-bg": "linear-gradient(180deg, oklch(0.191 0 0) 0%, oklch(0.159 0 0) 100%)",
    "--sk-inset-bg": "linear-gradient(180deg, oklch(0.134 0 0) 0%, oklch(0.173 0 0) 100%)",
  },
};

// ── Densities ──

const DENSITIES: Record<Density, ThemeTokens> = {
  compact: {
    "--control-height": "34px",
    "--control-height-sm": "28px",
    "--control-height-lg": "40px",
    "--control-padding": "0 12px",
    "--control-padding-sm": "0 8px",
    "--control-padding-lg": "0 16px",
    "--section-gap": "48px",
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
    "--section-gap": "64px",
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
    "--section-gap": "80px",
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

// ── High-contrast overrides (accessibility) ──

const HIGH_CONTRAST: ThemeTokens = {
  "--border": "oklch(1 0 0 / 0.18)",
  "--border-strong": "oklch(1 0 0 / 0.32)",
  "--text": "oklch(1 0 0)",
  "--muted": "oklch(0.683 0 0)",
  "--sk-border": "oklch(1 0 0 / 0.20)",
};

const HIGH_CONTRAST_LIGHT: ThemeTokens = {
  "--border": "oklch(0 0 0 / 0.28)",
  "--border-strong": "oklch(0 0 0 / 0.45)",
  "--text": "oklch(0 0 0)",
  "--muted": "oklch(0.387 0 0)",
  "--sk-border": "oklch(0 0 0 / 0.28)",
};

export function resolveTokens(
  scheme: ColorScheme,
  density: Density,
  typography: TypographyScale,
  highContrast: boolean,
): ThemeTokens {
  const tokens: ThemeTokens = {
    ...SCHEMES[scheme],
    ...DENSITIES[density],
    ...TYPOGRAPHY[typography],
  };
  if (highContrast) {
    const contrastOverrides =
      scheme === "light" ? HIGH_CONTRAST_LIGHT : HIGH_CONTRAST;
    Object.assign(tokens, contrastOverrides);
  }
  tokens["--ui-scale"] = "1"; // scale multiplier applied separately in singleton
  tokens["--font-scale"] = tokens["--font-scale"] ?? "1";
  return tokens;
}

export { SCHEMES, DENSITIES, TYPOGRAPHY };
