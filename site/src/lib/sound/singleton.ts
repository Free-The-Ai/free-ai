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
  SoundSource,
} from "./types";
import { ALL_SOUND_ROLES } from "./types";
import {
  playSound as enginePlaySound,
  closeAudioContext,
  ensureResumed,
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
  overrides: {},
  reducedMotion: "inherit",
};

// ── Module-level state ──

let config: SensoryConfig = { ...DEFAULT_CONFIG };
let reducedMotion = false;
let initialized = false;

// ── Role resolution ──

function parseRole(role: SoundRole): { category: SoundCategory; name: string } {
  const dot = role.indexOf(".");
  return {
    category: role.slice(0, dot) as SoundCategory,
    name: role.slice(dot + 1),
  };
}

function resolveRole(role: SoundRole): SoundSource | null {
  const { category } = parseRole(role);
  if (!config.categories[category]) return null;
  const override = config.overrides[role];
  if (override) return override;
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
    overrides: { ...DEFAULT_CONFIG.overrides, ...partial.overrides },
  };
}

/** Get current config (for Toast and other module-level consumers). */
export function soundConfig(): SensoryConfig & { reducedMotion: boolean } {
  return { ...config, reducedMotion };
}

/** Check if sounds are currently enabled. */
export function soundEnabled(): boolean {
  return config.enabled && !reducedMotion;
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

/** Initialize the sound system. Call from onMount in SoundProvider. */
export function initSoundSystem(): void {
  if (initialized) return;
  initialized = true;

  // Reduced motion detection
  if (config.reducedMotion === "inherit" && typeof window !== "undefined") {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = mql.matches;
    mql.addEventListener("change", (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    });
  } else if (config.reducedMotion === "force-off") {
    reducedMotion = true;
  }

  // Warm up AudioContext on first user gesture
  warmUpHandler = () => {
    ensureResumed();
    document.removeEventListener("click", warmUpHandler!);
    document.removeEventListener("keydown", warmUpHandler!);
    document.removeEventListener("pointerdown", warmUpHandler!);
    warmUpHandler = null;
  };
  document.addEventListener("click", warmUpHandler, { passive: true });
  document.addEventListener("keydown", warmUpHandler, { passive: true });
  document.addEventListener("pointerdown", warmUpHandler, { passive: true });

  // data-sound event delegation
  document.addEventListener("click", handleClick, { passive: true });
  document.addEventListener("pointerenter", handlePointerEnter, { passive: true });
}

/** Destroy the sound system. Call from onCleanup in SoundProvider. */
export function destroySoundSystem(): void {
  if (!initialized) return;
  initialized = false;

  if (warmUpHandler) {
    document.removeEventListener("click", warmUpHandler);
    document.removeEventListener("keydown", warmUpHandler);
    document.removeEventListener("pointerdown", warmUpHandler);
    warmUpHandler = null;
  }
  document.removeEventListener("click", handleClick);
  document.removeEventListener("pointerenter", handlePointerEnter);
  closeAudioContext();
}
