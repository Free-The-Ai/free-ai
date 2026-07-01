/**
 * Sound system singleton — module-level state shared across all Astro islands.
 *
 * In Astro, each client:load component is a separate Solid.js hydration boundary.
 * Solid.js createContext/useContext cannot bridge these boundaries. However, all
 * islands share the same ES module cache, so module-level variables are shared
 * across all islands on the page.
 *
 * This module provides:
 * - soundConfigure() — set volume, theme, enabled state
 * - soundPlay() — play a sound by role (used by UI components)
 * - initSoundSystem() — start AudioContext warmup + data-sound delegation
 * - destroySoundSystem() — cleanup
 */

import type {
  SensoryConfig,
  SoundCategory,
  SoundPackName,
  SoundPlayback,
  SoundRole,
  PlaySoundOptions,
  SoundSynthesizer,
} from "./types";
import { ALL_SOUND_ROLES } from "./types";
import {
  playSound as enginePlaySound,
  closeAudioContext,
  ensureResumed,
  getAudioContext,
} from "./engine";
import { soundPacks } from "./packs";

// ── Config defaults ──

const DEFAULT_CATEGORIES: Record<SoundCategory, boolean> = {
  interaction: true,
  overlay: true,
  navigation: true,
  notification: true,
  hero: false,
};

const DEFAULT_CONFIG: SensoryConfig = {
  enabled: true,
  volume: 0.35,
  theme: "aero",
  categories: { ...DEFAULT_CATEGORIES },
  reducedMotion: "inherit",
};

// ── Module-level state ──

let config: SensoryConfig = { ...DEFAULT_CONFIG };
let reducedMotion = false;
let initialized = false;
let soundReducedMql: MediaQueryList | null = null;

// ── Role resolution ──

function parseRole(role: SoundRole): { category: SoundCategory; name: string } {
  const dot = role.indexOf(".");
  return {
    category: role.slice(0, dot) as SoundCategory,
    name: role.slice(dot + 1),
  };
}

function resolveRole(role: SoundRole): SoundSynthesizer | null {
  const { category } = parseRole(role);
  if (!config.categories[category]) return null;
  const theme = config.theme as SoundPackName;
  const pack = soundPacks[theme] ?? soundPacks.aero;
  return pack[role] ?? null;
}

// ── Public API ──

/** Configure the sound system. Call before or after initSoundSystem(). */
export function soundConfigure(partial?: Partial<SensoryConfig>): void {
  if (!partial) return;
  config = {
    ...DEFAULT_CONFIG,
    ...partial,
    categories: { ...DEFAULT_CATEGORIES, ...partial.categories },
  };
}

/** Check if sounds are currently enabled. */
export function soundEnabled(): boolean {
  return config.enabled && !reducedMotion;
}

/** Check if the user has manually muted. */
function soundIsMuted(): boolean {
  return !config.enabled;
}

/** Toggle mute state. Returns the new muted state. */
function soundToggleMute(): boolean {
  config = { ...config, enabled: !config.enabled };
  return !config.enabled;
}

/**
 * Play a sound by role. This is the main API for UI components.
 * Returns SoundPlayback or null if disabled/unknown role.
 */
export function soundPlay(
  role: SoundRole,
  options: PlaySoundOptions = {},
): SoundPlayback | null {
  if (!soundEnabled()) return null;
  const source = resolveRole(role);
  if (!source) return null;
  return enginePlaySound(source, { ...options, volume: (options.volume ?? 1) * config.volume });
}

// ── Delegation ──

const VALID_ROLES = new Set<string>(ALL_SOUND_ROLES);

function isValidRole(value: string | null): value is SoundRole {
  return value !== null && VALID_ROLES.has(value);
}

function closestSoundTarget(event: Event): Element | null {
  for (const node of event.composedPath()) {
    if (node instanceof Element && node.hasAttribute("data-sound")) {
      return node;
    }
  }
  return null;
}

// ── Lifecycle ──

function handleClick(e: Event) {
  const target = closestSoundTarget(e);
  if (!target) return;
  const role = target.getAttribute("data-sound");
  if (isValidRole(role)) soundPlay(role);
}

function handlePointerEnter(e: Event) {
  const target = closestSoundTarget(e);
  if (!target) return;
  const role = target.getAttribute("data-sound");
  if (isValidRole(role)) soundPlay(role);
}

let warmUpHandler: (() => void) | null = null;

// ── Scroll sound throttling ──

const SCROLL_PIXEL_INTERVAL = 80;
const SCROLL_MIN_VELOCITY = 0.5;    // px/ms — ignore very slow scroll
const SCROLL_MAX_VELOCITY_MULT = 1.5;
let lastScrollY = 0;
let lastScrollTime = 0;
let scrollAccumulated = 0;

function handleScroll() {
  if (!soundEnabled() || reducedMotion) return;
  const y = window.scrollY;
  const now = performance.now();
  const delta = Math.abs(y - lastScrollY);

  // Reset on direction change or huge jumps (keyboard PgDn etc.)
  if (delta > 400) {
    lastScrollY = y;
    lastScrollTime = now;
    scrollAccumulated = 0;
    return;
  }

  scrollAccumulated += delta;
  lastScrollY = y;

  if (scrollAccumulated < SCROLL_PIXEL_INTERVAL) return;

  const elapsed = now - lastScrollTime;
  const velocity = elapsed > 0 ? delta / elapsed : 0;
  lastScrollTime = now;

  // Ignore very slow scrolling
  if (velocity < SCROLL_MIN_VELOCITY) {
    scrollAccumulated = 0;
    return;
  }

  scrollAccumulated = 0;

  // Velocity-sensitive volume: faster = louder, capped
  const velocityMult = Math.min(velocity / 2, SCROLL_MAX_VELOCITY_MULT);
  soundPlay("navigation.scroll", { volume: 0.15 + velocityMult * 0.1 });
}

function onSoundReducedMotionChange(event: MediaQueryListEvent): void {
  reducedMotion = event.matches;
}

/** Initialize the sound system. Call from onMount in SoundProvider. */
export function initSoundSystem(): void {
  if (initialized) return;
  initialized = true;

  // Eagerly create AudioContext so resume() is the only async step on first gesture
  getAudioContext();

  // Reduced motion detection
  if (config.reducedMotion === "inherit" && typeof window !== "undefined") {
    soundReducedMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = soundReducedMql.matches;
    soundReducedMql.addEventListener("change", onSoundReducedMotionChange);
  } else if (config.reducedMotion === "force-off") {
    reducedMotion = true;
  }

  // Warm up AudioContext on first user gesture.
  // Uses capture phase to fire BEFORE click/pointer delegation handlers,
  // ensuring AudioContext.resume() starts before soundPlay checks ctx.state.
  warmUpHandler = () => {
    ensureResumed();
    document.removeEventListener("click", warmUpHandler!, true);
    document.removeEventListener("keydown", warmUpHandler!, true);
    document.removeEventListener("pointerdown", warmUpHandler!, true);
    warmUpHandler = null;
  };
  document.addEventListener("click", warmUpHandler, { capture: true, passive: true });
  document.addEventListener("keydown", warmUpHandler, { capture: true, passive: true });
  document.addEventListener("pointerdown", warmUpHandler, { capture: true, passive: true });

  // data-sound event delegation
  document.addEventListener("click", handleClick, { passive: true });
  document.addEventListener("pointerenter", handlePointerEnter, { passive: true });

  // Scroll sound (throttled by distance, velocity-sensitive)
  lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
  lastScrollTime = performance.now();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Expose sound API globally for Layout.astro scripts (page navigation, mute toggle, etc.)
  if (typeof window !== "undefined") {
    (window as any).__soundPlay = soundPlay;
    (window as any).__soundToggleMute = soundToggleMute;
    (window as any).__soundIsMuted = soundIsMuted;
  }

  // Cleanup on tab close only — module-level state persists across navigations.
  // Astro ClientRouter destroys and recreates client:load islands on each nav,
  // so onCleanup would tear down the sound system unnecessarily. The singleton
  // survives because all state is module-level in the ES module cache.
  window.addEventListener("beforeunload", destroySoundSystem);
}

/** Destroy the sound system. Called automatically on beforeunload. */
function destroySoundSystem(): void {
  if (!initialized) return;
  initialized = false;

  if (warmUpHandler) {
    document.removeEventListener("click", warmUpHandler, true);
    document.removeEventListener("keydown", warmUpHandler, true);
    document.removeEventListener("pointerdown", warmUpHandler, true);
    warmUpHandler = null;
  }
  document.removeEventListener("click", handleClick);
  document.removeEventListener("pointerenter", handlePointerEnter);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("beforeunload", destroySoundSystem);
  soundReducedMql?.removeEventListener("change", onSoundReducedMotionChange);
  soundReducedMql = null;
  if (typeof window !== "undefined") {
    delete (window as any).__soundPlay;
    delete (window as any).__soundToggleMute;
    delete (window as any).__soundIsMuted;
  }
  closeAudioContext();
}
