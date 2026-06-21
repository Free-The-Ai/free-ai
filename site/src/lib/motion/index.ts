/**
 * Adaptive motion system — public API barrel.
 *
 * motionFor(preset, intent, overrides?) → computed MotionParams (duration,
 * easing, scale, translate, opacity) adapted to the live pointer/scroll
 * velocity, distance, element size, and reduced-motion preference.
 */
export {
  motionConfigure,
  motionConfig,
  motionContext,
  motionReduced,
  motionFor,
  motionApply,
  initMotionSystem,
  destroyMotionSystem,
} from "./singleton";

export { createMotion } from "./primitives";
export type { MotionController, MotionInput } from "./primitives";

export {
  computeDuration,
  computeScale,
  computeTranslate,
  computeOpacity,
  resolveMotion,
  DEFAULT_CONFIG,
} from "./engine";
export { MOTION_PRESETS } from "./presets";
export type {
  MotionConfig,
  MotionContext,
  MotionIntent,
  MotionParams,
  MotionPresetName,
  MotionPresets,
  MotionTuning,
  ReducedMotionMode,
} from "./types";
