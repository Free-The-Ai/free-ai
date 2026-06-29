/**
 * Theme singleton — module-level state shared across all Astro islands.
 *
 * Mirrors src/lib/sound/singleton.ts and src/lib/motion/singleton.ts: Solid.js
 * createContext cannot bridge separate hydration boundaries, but all islands
 * share one ES module cache, so module-level variables are shared page-wide.
 *
 * Applies resolved design tokens to :root as CSS custom properties so every
 * component — which already reads --control-height, --radius, --accent, etc. —
 * becomes runtime-configurable without per-component changes.
 *
 * Public API:
 *   themeConfigure(partial) — set scheme/density/typography/scale/contrast
 *   themeGet()              — read the current ThemeState
 *   themeToggleScheme()     — cycle dark → midnight
 *   initThemeSystem()       — start system-preference detection + persistence
 *   destroyThemeSystem()    — cleanup
 */
import type { ColorScheme, ThemeConfig, ThemeState, ThemeTokens } from "./types";
import { resolveTokens } from "./presets";

// ── Module-level state ──

const STORAGE_KEY = "fta-theme";

const DEFAULT_CONFIG: ThemeConfig = {
  scheme: "dark",
  density: "comfortable",
  typography: "standard",
  scale: 1,
  highContrast: false,
};

let config: ThemeConfig = { ...DEFAULT_CONFIG };
let tokens: ThemeTokens = {};
let systemScheme = false;
let initialized = false;

let schemeMql: MediaQueryList | null = null;
let contrastMql: MediaQueryList | null = null;

// ── Token application ──

function applyTokens(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveTokens(
    config.scheme,
    config.density,
    config.typography,
    config.highContrast,
  );
  // Apply the global UI scale as a multiplier baked into sizing tokens.
  const s = config.scale;
  for (const [key, value] of Object.entries(resolved)) {
    root.style.setProperty(key, scaleToken(key, value, s));
  }
  // Expose the raw scale for components that need the multiplier directly.
  root.style.setProperty("--ui-scale", String(s));
  root.style.colorScheme = "dark";
  root.setAttribute("data-theme", config.scheme);
  root.setAttribute("data-density", config.density);
  tokens = resolved;
}

/** Scale sizing tokens by the global UI scale (touch-target accessibility). */
function scaleToken(key: string, value: string, scale: number): string {
  if (scale === 1) return value;
  const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (!pxMatch) return value;
  const scaled = Math.round(parseFloat(pxMatch[1]) * scale);
  // Only scale control/sizing tokens, not font-scale.
  if (
    key.startsWith("--control-") ||
    key === "--radius" ||
    key === "--radius-sm"
  ) {
    return `${scaled}px`;
  }
  return value;
}

// ── Persistence ──

function loadPersisted(): Partial<ThemeConfig> | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ThemeConfig>) : null;
  } catch {
    return null;
  }
}

function persist(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may be unavailable (private mode) — fail silently.
  }
}

// ── System preference detection ──

function detectSystemScheme(): ColorScheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return "dark";
}

function detectSystemContrast(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
}

function onSchemeChange(event: MediaQueryListEvent): void {
  // Only auto-follow the system if the user hasn't explicitly chosen a scheme.
  if (systemScheme) {
    config.scheme = "dark";
    applyTokens();
    persist();
  }
}

function onContrastChange(event: MediaQueryListEvent): void {
  config.highContrast = event.matches;
  applyTokens();
  persist();
}

// ── Public API ──

export function themeConfigure(partial?: Partial<ThemeConfig>): void {
  if (!partial) return;
  const wasSystem = systemScheme;
  if (partial.scheme) systemScheme = false; // explicit choice overrides auto
  config = { ...config, ...partial };
  applyTokens();
  persist();
  // Preserve systemScheme flag if only non-scheme props changed.
  if (!partial.scheme) systemScheme = wasSystem;
}

export function themeGet(): ThemeState {
  return { config: { ...config }, tokens: { ...tokens }, systemScheme };
}

const SCHEME_CYCLE: ColorScheme[] = ["dark", "midnight"];

export function themeToggleScheme(): ColorScheme {
  const idx = SCHEME_CYCLE.indexOf(config.scheme);
  const next = SCHEME_CYCLE[(idx + 1) % SCHEME_CYCLE.length];
  themeConfigure({ scheme: next });
  return next;
}

export function themeToggleDensity() {
  const cycle = ["compact", "comfortable", "spacious"] as const;
  const idx = cycle.indexOf(config.density);
  themeConfigure({ density: cycle[(idx + 1) % cycle.length] });
  return config.density;
}

// ── Lifecycle ──

export function initThemeSystem(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Restore persisted user preferences first.
  const persisted = loadPersisted();
  if (persisted) {
    config = { ...DEFAULT_CONFIG, ...persisted };
    systemScheme = false;
  } else {
    // No stored preference — follow the system scheme + contrast.
    config.scheme = detectSystemScheme();
    config.highContrast = detectSystemContrast();
    systemScheme = true;
  }
  applyTokens();

  schemeMql = null;

  contrastMql = window.matchMedia("(prefers-contrast: more)");
  contrastMql.addEventListener("change", onContrastChange);

  // Expose globally for inline Layout.astro scripts (theme toggle button, etc.)
  (window as unknown as Record<string, unknown>).__themeToggle = themeToggleScheme;
  (window as unknown as Record<string, unknown>).__themeToggleDensity = themeToggleDensity;
  (window as unknown as Record<string, unknown>).__themeGet = themeGet;
}

export function destroyThemeSystem(): void {
  if (!initialized) return;
  initialized = false;
  schemeMql?.removeEventListener("change", onSchemeChange);
  schemeMql = null;
  contrastMql?.removeEventListener("change", onContrastChange);
  schemeMql = null;
  contrastMql = null;
}

/**
 * Inline-friendly token bootstrap. Called from a <script is:inline> in <head>
 * (before hydration) to apply persisted/system theme on first paint, avoiding
 * a flash of the wrong theme (FOUC). Mirrors the loader fade pattern.
 */
export function themeInlineBootstrap(): string {
  return `(function(){try{var k="${STORAGE_KEY}";var s=localStorage.getItem(k);var c=s?JSON.parse(s):null;var scheme=c&&c.scheme?c.scheme:"dark";var hc=c&&c.highContrast?c.highContrast:matchMedia("(prefers-contrast: more)").matches;var d=document.documentElement;d.setAttribute("data-theme",scheme);d.colorScheme="dark";d.setAttribute("data-contrast",hc?"high":"normal");}catch(e){}})();`;
}
