/**
 * Runtime theme system — public API barrel.
 *
 * configure design tokens (color scheme, density, typography scale, UI scale,
 * high-contrast) at runtime. Tokens are applied to :root as CSS custom
 * properties so every component reading --control-height / --radius / --accent
 * / --font-scale etc. becomes configurable with zero per-component change.
 */
export {
  themeConfigure,
  themeGet,
  themeToggleScheme,
  themeToggleDensity,
  initThemeSystem,
  destroyThemeSystem,
  themeInlineBootstrap,
} from "./singleton";

export { resolveTokens, SCHEMES, DENSITIES, TYPOGRAPHY } from "./presets";

export type {
  ColorScheme,
  Density,
  TypographyScale,
  ThemeConfig,
  ThemeTokens,
  ThemeState,
} from "./types";
