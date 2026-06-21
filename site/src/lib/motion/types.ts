/**
 * Adaptive motion system types.
 *
 * Motion here is context-driven, not fixed: the same interaction produces
 * different duration / easing / scale / distance values depending on the
 * pointer velocity, the travel distance, the element size, the viewport,
 * and the user's reduced-motion preference. The shape mirrors the sound
 * system (src/lib/sound) so the two feedback layers stay architecturally
 * consistent (Yokoten).
 */

// ── Inputs: the interaction context ──

export type MotionIntent =
  | "enter"
  | "exit"
  | "expand"
  | "collapse"
  | "press"
  | "release"
  | "swap"
  | "scroll"
  | "navigate";

export interface MotionContext {
  /** What the interaction is doing (drives default easing direction). */
  intent: MotionIntent;
  /** Pixels the element will travel (translate distance). 0 if none. */
  distance?: number;
  /** Pointer velocity in px/ms at the moment of release (drag/swipe). */
  pointerVelocity?: number;
  /** Scroll velocity in px/ms (for scroll-driven reveals). */
  scrollVelocity?: number;
  /** Element bounding size (px) — scales the transform delta. */
  size?: number;
  /** Viewport width in px. */
  viewportWidth?: number;
}

// ── Outputs: computed motion parameters ──

export interface MotionParams {
  /** Computed duration in ms (0 when reduced-motion collapses motion). */
  duration: number;
  /** Computed easing as a CSS cubic-bezier() string. */
  easing: string;
  /** Pre-transform scale (e.g. 0.98 for a subtle enter). */
  scale: number;
  /** Translate distance in px (sign included). */
  translate: number;
  /** Opacity start value for fades. */
  opacity: number;
  /** True when the user requested reduced motion — callers may skip entirely. */
  reduced: boolean;
}

// ── Tuning ──

export interface MotionTuning {
  /** Reference travel speed in px/ms for distance-proportional duration. */
  baseVelocity?: number;
  /** Clamp duration to [min, max] in ms. */
  minDuration?: number;
  maxDuration?: number;
  /** Pre-scale delta applied per intent (multiplied by size factor). */
  scaleDelta?: number;
  /** Translate distance baseline in px. */
  baseTranslate?: number;
}

// ── Presets ──

export type MotionPresetName =
  | "dropdown"
  | "modal"
  | "panel"
  | "popover"
  | "tooltip"
  | "toast"
  | "press"
  | "hover"
  | "digit"
  | "textSwap"
  | "iconSwap"
  | "reveal";

export type MotionPresets = Record<MotionPresetName, MotionTuning>;

// ── Config ──

export type ReducedMotionMode = "inherit" | "force-off" | "force-on";

export interface MotionConfig {
  /** Global scale multiplier for all computed durations (slow-mo / speed-up). */
  speedScale: number;
  /** How aggressively pointer velocity shortens duration (0 = ignore, 1 = full). */
  velocityResponsiveness: number;
  /** How aggressively element size shrinks the scale delta (0..1). */
  sizeResponsiveness: number;
  reducedMotion: ReducedMotionMode;
}
