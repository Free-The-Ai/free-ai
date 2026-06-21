/**
 * Motion presets — per-interaction tuning baselines.
 *
 * These replace the fixed CSS duration/scale tokens (--dropdown-open-dur,
 * --modal-scale, etc.) with adaptable starting points. Each preset feeds the
 * engine, which then adjusts the values at runtime for distance, velocity,
 * element size, and reduced-motion.
 */
import type { MotionPresets } from "./types";

export const MOTION_PRESETS: MotionPresets = {
  dropdown: {
    baseVelocity: 1.2,
    minDuration: 100,
    maxDuration: 260,
    scaleDelta: 0.02,
    baseTranslate: 6,
  },
  modal: {
    baseVelocity: 1.0,
    minDuration: 160,
    maxDuration: 360,
    scaleDelta: 0.03,
    baseTranslate: 8,
  },
  panel: {
    baseVelocity: 0.9,
    minDuration: 200,
    maxDuration: 420,
    scaleDelta: 0.0,
    baseTranslate: 40,
  },
  popover: {
    baseVelocity: 1.1,
    minDuration: 120,
    maxDuration: 300,
    scaleDelta: 0.02,
    baseTranslate: 16,
  },
  tooltip: {
    baseVelocity: 1.4,
    minDuration: 80,
    maxDuration: 180,
    scaleDelta: 0.04,
    baseTranslate: 4,
  },
  toast: {
    baseVelocity: 1.0,
    minDuration: 140,
    maxDuration: 320,
    scaleDelta: 0.02,
    baseTranslate: 24,
  },
  press: {
    baseVelocity: 2.0,
    minDuration: 60,
    maxDuration: 120,
    scaleDelta: 0.03,
    baseTranslate: 0,
  },
  hover: {
    baseVelocity: 1.8,
    minDuration: 80,
    maxDuration: 200,
    scaleDelta: 0.0,
    baseTranslate: 0,
  },
  digit: {
    baseVelocity: 1.3,
    minDuration: 240,
    maxDuration: 520,
    scaleDelta: 0.08,
    baseTranslate: 6,
  },
  textSwap: {
    baseVelocity: 1.6,
    minDuration: 80,
    maxDuration: 180,
    scaleDelta: 0.03,
    baseTranslate: 3,
  },
  iconSwap: {
    baseVelocity: 1.7,
    minDuration: 100,
    maxDuration: 220,
    scaleDelta: 0.5,
    baseTranslate: 0,
  },
  reveal: {
    baseVelocity: 1.0,
    minDuration: 200,
    maxDuration: 600,
    scaleDelta: 0.02,
    baseTranslate: 24,
  },
};
