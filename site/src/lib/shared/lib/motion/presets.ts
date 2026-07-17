/**
 * Motion presets — per-interaction tuning baselines.
 *
 * These replace the fixed CSS duration/scale tokens with adaptable starting
 * points. Each preset feeds the engine, which then adjusts the values at
 * runtime for distance, velocity, element size, and reduced-motion.
 */
import type { MotionPresets } from "./types";

export const MOTION_PRESETS: MotionPresets = {
  panel: {
    baseVelocity: 0.9,
    minDuration: 200,
    maxDuration: 420,
    scaleDelta: 0.0,
    baseTranslate: 40,
  },
};
