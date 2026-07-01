/**
 * Theme system types — runtime-configurable design tokens.
 *
 * Instead of adding density/spacing/color/typography props to every component
 * (high churn, high cyclomatic complexity), this system exposes ONE
 * configuration surface that writes CSS custom properties to :root. Every
 * component already reads those vars (--control-height, --radius, --accent,
 * --font-scale, …), so the entire UI becomes configurable with near-zero
 * per-component change. This mirrors the sound + motion singletons (Yokoten).
 */

export type ColorScheme = "dark" | "midnight";
export type Density = "compact" | "comfortable" | "spacious";
export type TypographyScale = "small" | "standard" | "large";

export interface ThemeConfig {
  /** Color scheme — controls bg/surface/text/border/accent tokens. */
  scheme: ColorScheme;
  /** Density — scales control height, padding, gaps, radii. */
  density: Density;
  /** Typography scale — multiplies base font-size for all text. */
  typography: TypographyScale;
  /** Global UI scale multiplier (1 = 100%). Drives touch-target sizing. */
  scale: number;
  /** High-contrast accessibility mode (boosts border/text contrast). */
  highContrast: boolean;
}

/** A flat map of CSS custom property → value. */
export type ThemeTokens = Record<string, string>;
