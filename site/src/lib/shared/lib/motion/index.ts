/**
 * Adaptive motion system — public API barrel.
 *
 * motionFor(preset, intent, overrides?) -> computed MotionParams (duration,
 * easing, scale, translate, opacity) adapted to the live pointer/scroll
 * velocity, distance, element size, and reduced-motion preference.
 */
export { motionFor, motionApply } from "./singleton";
