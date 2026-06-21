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
    "--bg": "#0f0f0f",
    "--surface": "#191919",
    "--border": "rgba(255, 255, 255, 0.06)",
    "--border-strong": "rgba(255, 255, 255, 0.12)",
    "--text": "#e8e8e8",
    "--muted": "#777777",
    "--dim": "#444444",
    "--control-bg": "rgba(255, 255, 255, 0.035)",
    "--code-bg": "#111111",
    "--code-text": "#aaaaaa",
    "--sk-bg-gradient":
      "radial-gradient(circle at 50% -12%, rgba(238, 93, 32, 0.08), transparent 34rem), linear-gradient(180deg, #151515 0%, #0f0f0f 32%, #0b0b0b 100%)",
    "--sk-shell-bg": "linear-gradient(180deg, #202020 0%, #191919 100%)",
    "--sk-inset-bg": "linear-gradient(180deg, #111111 0%, #181818 100%)",
  },
  light: {
    "--bg": "#f6f5f2",
    "--surface": "#ffffff",
    "--border": "rgba(0, 0, 0, 0.08)",
    "--border-strong": "rgba(0, 0, 0, 0.16)",
    "--text": "#1a1a1a",
    "--muted": "#6b6b6b",
    "--dim": "#9a9a9a",
    "--control-bg": "rgba(0, 0, 0, 0.03)",
    "--code-bg": "#f0efec",
    "--code-text": "#444444",
    "--sk-bg-gradient":
      "radial-gradient(circle at 50% -12%, rgba(238, 93, 32, 0.06), transparent 34rem), linear-gradient(180deg, #fafaf8 0%, #f2f1ed 32%, #ecebe6 100%)",
    "--sk-shell-bg": "linear-gradient(180deg, #ffffff 0%, #f4f3f0 100%)",
    "--sk-inset-bg": "linear-gradient(180deg, #f0efec 0%, #e8e7e3 100%)",
  },
  midnight: {
    "--bg": "#050505",
    "--surface": "#0d0d0d",
    "--border": "rgba(255, 255, 255, 0.04)",
    "--border-strong": "rgba(255, 255, 255, 0.10)",
    "--text": "#f0f0f0",
    "--muted": "#6a6a6a",
    "--dim": "#3a3a3a",
    "--control-bg": "rgba(255, 255, 255, 0.025)",
    "--code-bg": "#080808",
    "--code-text": "#999999",
    "--sk-bg-gradient":
      "radial-gradient(circle at 50% -12%, rgba(238, 93, 32, 0.06), transparent 34rem), linear-gradient(180deg, #0a0a0a 0%, #050505 32%, #000000 100%)",
    "--sk-shell-bg": "linear-gradient(180deg, #141414 0%, #0d0d0d 100%)",
    "--sk-inset-bg": "linear-gradient(180deg, #080808 0%, #101010 100%)",
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
  "--border": "rgba(255, 255, 255, 0.18)",
  "--border-strong": "rgba(255, 255, 255, 0.32)",
  "--text": "#ffffff",
  "--muted": "#999999",
  "--sk-border": "rgba(255, 255, 255, 0.20)",
};

const HIGH_CONTRAST_LIGHT: ThemeTokens = {
  "--border": "rgba(0, 0, 0, 0.28)",
  "--border-strong": "rgba(0, 0, 0, 0.45)",
  "--text": "#000000",
  "--muted": "#444444",
  "--sk-border": "rgba(0, 0, 0, 0.28)",
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
