/**
 * Theme singleton — plain module-level state, framework-agnostic like its
 * shared/lib/sound and shared/lib/motion counterparts. Every caller imports
 * the same functions from the same ES module, so no Vue provide/inject is
 * needed to share state across components.
 *
 * Applies resolved design tokens to :root as CSS custom properties so every
 * component — which already reads --control-height, --radius, --accent, etc. —
 * becomes runtime-configurable without per-component changes.
 *
 * Public API:
 *   themeConfigure(partial) — set scheme/density/typography/scale/contrast
 *   themeToggleScheme()     — cycle dark → midnight
 *   initThemeSystem()       — start system-preference detection + persistence
 */
import type { ColorScheme, ThemeConfig, ThemeTokens } from "./types";
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

let contrastMql: MediaQueryList | null = null;

// ── Token application ──

function applyTokens(): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const resolved = resolveTokens(config.density, config.typography);
  // Apply the global UI scale as a multiplier baked into sizing tokens.
  const s = config.scale;
  for (const [key, value] of Object.entries(resolved)) {
    root.style.setProperty(key, scaleToken(key, value, s));
  }
  // Expose the raw scale for components that need the multiplier directly.
  root.style.setProperty("--ui-scale", String(s));
  // Colour is selected by attribute, not by inline token writes, so the CSS in
  // global.css stays authoritative and the palette is already correct before
  // this ever runs. `color-scheme` is likewise declared on html in CSS.
  root.setAttribute("data-theme", config.scheme);
  root.setAttribute("data-density", config.density);
  root.setAttribute("data-contrast", config.highContrast ? "high" : "normal");
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
  } catch (error) {
    console.error("Failed to load persisted theme", error);
    return null;
  }
}

function persist(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to persist theme", error);
  }
}

// ── System preference detection ──

function detectSystemContrast(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
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

const SCHEME_CYCLE: ColorScheme[] = ["dark", "midnight"];

function themeToggleScheme(): ColorScheme {
  const idx = SCHEME_CYCLE.indexOf(config.scheme);
  const next = SCHEME_CYCLE[(idx + 1) % SCHEME_CYCLE.length];
  themeConfigure({ scheme: next });
  return next;
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
    // No stored preference — default to dark scheme, detect system contrast.
    config.scheme = "dark";
    config.highContrast = detectSystemContrast();
    systemScheme = true;
  }
  applyTokens();

  contrastMql = window.matchMedia("(prefers-contrast: more)");
  contrastMql.addEventListener("change", onContrastChange);

  // Expose globally for the header widget's theme-toggle button (see
  // widgets/header/ui/SiteHeader.svelte).
  (window as unknown as Record<string, unknown>).__themeToggle = themeToggleScheme;
}

/**
 * Inline-friendly token bootstrap. Called from a <script is:inline> in <head>
 * (before hydration) to apply persisted/system theme on first paint, avoiding
 * a flash of the wrong theme (FOUC).
 *
 * Reads localStorage, so it must tolerate storage being blocked (Safari private
 * mode, cookie-blocking extensions). The catch re-applies the defaults rather
 * than swallowing silently, so `data-theme` / `data-contrast` are always set
 * even when persistence is unavailable.
 *
 * Does NOT set colour-scheme here: `d.colorScheme = "dark"` assigns to a
 * property HTMLElement does not have (it lives on CSSStyleDeclaration), so it
 * was an inert expando. `color-scheme: dark` is declared on html in global.css
 * instead, which also applies before first paint and cannot silently fail.
 */
export function themeInlineBootstrap(): string {
  return `(function(){var d=document.documentElement;var scheme="dark";var hc=false;try{hc=matchMedia("(prefers-contrast: more)").matches;var s=localStorage.getItem("${STORAGE_KEY}");var c=s?JSON.parse(s):null;if(c){if(c.scheme)scheme=c.scheme;if(typeof c.highContrast==="boolean")hc=c.highContrast;}}catch(e){}d.setAttribute("data-theme",scheme);d.setAttribute("data-contrast",hc?"high":"normal");})();`;
}
