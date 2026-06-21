/**
 * Motion singleton — module-level state shared across all Astro islands.
 *
 * Mirrors src/lib/sound/singleton.ts: Solid.js createContext cannot bridge
 * separate hydration boundaries, but all islands share one ES module cache,
 * so module-level variables are shared across the page.
 *
 * Tracks real interaction signals (pointer velocity, scroll velocity,
 * reduced-motion) and exposes:
 *   motionConfigure()  — set speed scale, responsiveness, reduced-motion mode
 *   motionContext()    — read the live context snapshot
 *   motionFor()        — compute adaptive params for a preset + intent
 *   motionApply()      — write computed params onto an element as CSS vars
 *   initMotionSystem() — start pointer/scroll/reduced-motion sensing
 *   destroyMotionSystem() — cleanup
 */
import type {
  MotionConfig,
  MotionContext,
  MotionIntent,
  MotionParams,
  MotionPresetName,
  MotionTuning,
} from "./types";
import { DEFAULT_CONFIG, resolveMotion } from "./engine";
import { MOTION_PRESETS } from "./presets";

// ── Module-level state ──

let config: MotionConfig = { ...DEFAULT_CONFIG };
let reduced = false;
let initialized = false;

// Live interaction signals
let pointerVelocity = 0; // px/ms
let scrollVelocity = 0; // px/ms
let lastPointerX = 0;
let lastPointerY = 0;
let lastPointerTime = 0;
let lastScrollY = 0;
let lastScrollTime = 0;
let scrollSampleTime = 0;
let scrollSampleY = 0;

let reducedMotionMql: MediaQueryList | null = null;

// ── Config ──

export function motionConfigure(partial?: Partial<MotionConfig>): void {
  if (!partial) return;
  config = { ...config, ...partial };
  if (partial.reducedMotion) applyReducedMotionMode();
}

export function motionConfig(): MotionConfig {
  return { ...config };
}

export function motionReduced(): boolean {
  return reduced;
}

function applyReducedMotionMode(): void {
  if (config.reducedMotion === "force-off") {
    reduced = true;
  } else if (config.reducedMotion === "force-on") {
    reduced = false;
  }
  // "inherit" defers to the matchMedia listener set in initMotionSystem.
}

// ── Signal handlers ──

function onPointerMove(event: PointerEvent): void {
  const now = performance.now();
  const dt = now - lastPointerTime;
  if (dt > 0 && dt < 100) {
    const dx = event.clientX - lastPointerX;
    const dy = event.clientY - lastPointerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pointerVelocity = pointerVelocity * 0.6 + (dist / dt) * 0.4; // smoothed EMA
  }
  lastPointerX = event.clientX;
  lastPointerY = event.clientY;
  lastPointerTime = now;
}

function onPointerUp(): void {
  // Let the last measured velocity linger briefly so a release handler that
  // calls motionFor() reads the actual flick speed, then decay to rest.
  setTimeout(() => {
    pointerVelocity = 0;
  }, 80);
}

function onScroll(): void {
  const y = window.scrollY;
  const now = performance.now();
  const dt = now - scrollSampleTime;
  if (dt >= 16) {
    const dy = Math.abs(y - scrollSampleY);
    if (dt > 0) {
      scrollVelocity = scrollVelocity * 0.5 + (dy / dt) * 0.5;
    }
    scrollSampleTime = now;
    scrollSampleY = y;
  }
  lastScrollY = y;
  lastScrollTime = now;
}

function onReducedMotionChange(event: MediaQueryListEvent): void {
  if (config.reducedMotion === "inherit") {
    reduced = event.matches;
  }
}

// ── Context snapshot ──

/** Read the current live interaction context (pointer + scroll velocity). */
export function motionContext(intent: MotionIntent): MotionContext {
  return {
    intent,
    pointerVelocity,
    scrollVelocity,
    viewportWidth: typeof window !== "undefined" ? window.innerWidth : 0,
  };
}

// ── Public compute API ──

/**
 * Compute adaptive motion parameters for a preset + intent, enriched with the
 * live pointer/scroll context. Pass `distance` and `size` for distance- and
 * size-proportional tuning.
 */
export function motionFor(
  preset: MotionPresetName,
  intent: MotionIntent,
  overrides: Partial<MotionContext & MotionTuning> = {},
): MotionParams {
  const tuning: MotionTuning = { ...MOTION_PRESETS[preset], ...overrides };
  const context: MotionContext = { ...motionContext(intent), ...overrides };
  return resolveMotion(context, tuning, config, reduced);
}

/**
 * Write computed parameters onto an element as CSS custom properties so
 * CSS-driven animations read runtime values instead of fixed tokens.
 * Sets: --motion-duration, --motion-easing, --motion-scale,
 *       --motion-translate, --motion-opacity.
 */
export function motionApply(
  el: HTMLElement,
  params: MotionParams,
): void {
  const style = el.style;
  style.setProperty("--motion-duration", `${params.duration}ms`);
  style.setProperty("--motion-easing", params.easing);
  style.setProperty("--motion-scale", String(params.scale));
  style.setProperty("--motion-translate", `${params.translate}px`);
  style.setProperty("--motion-opacity", String(params.opacity));
}

// ── Lifecycle ──

export function initMotionSystem(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  reducedMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced = config.reducedMotion === "force-off"
    ? true
    : config.reducedMotion === "force-on"
      ? false
      : reducedMotionMql.matches;
  reducedMotionMql.addEventListener("change", onReducedMotionChange);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerUp, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  lastScrollY = window.scrollY;
  lastScrollTime = performance.now();
  scrollSampleTime = lastScrollTime;
  scrollSampleY = lastScrollY;

  window.addEventListener("beforeunload", destroyMotionSystem);
}

export function destroyMotionSystem(): void {
  if (!initialized) return;
  initialized = false;

  reducedMotionMql?.removeEventListener("change", onReducedMotionChange);
  reducedMotionMql = null;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("beforeunload", destroyMotionSystem);
}
