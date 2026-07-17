/**
 * Adaptive motion engine — pure functions that turn interaction context into
 * runtime-computed motion parameters.
 *
 * Unlike fixed CSS tokens, every value here is derived from the live context:
 *   duration  ∝ distance / velocity        (constant perceived speed)
 *   duration /= 1 + pointerVelocity * k    (fast release = snappy settle)
 *   scale    *= 1 - sizeResponsiveness·f(size)  (bigger elements move less)
 *   easing    chosen by intent             (enter decelerates, exit accelerates)
 *   everything collapses to ~0 when reduced-motion is on
 *
 * No DOM access, no side effects — fully testable. The singleton wires it to
 * real pointer/scroll/reduced-motion signals.
 */
import type {
  MotionConfig,
  MotionContext,
  MotionIntent,
  MotionParams,
  MotionTuning,
} from "./types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const DEFAULT_CONFIG: MotionConfig = {
  speedScale: 1,
  velocityResponsiveness: 0.4,
  sizeResponsiveness: 0.5,
  reducedMotion: "inherit",
};

/** Intent → easing curve. Enters decelerate; exits accelerate; swaps spring. */
const EASING_BY_INTENT: Record<MotionIntent, string> = {
  enter: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  expand: "cubic-bezier(0.22, 1, 0.36, 1)",
  collapse: "cubic-bezier(0.4, 0, 1, 1)",
  press: "cubic-bezier(0.4, 0, 1, 1)",
  release: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  swap: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  scroll: "cubic-bezier(0.22, 1, 0.36, 1)",
  navigate: "cubic-bezier(0.16, 1, 0.3, 1)",
};

/**
 * Compute the duration for a single interaction from its context.
 *
 * - Base duration scales with travel distance so perceived speed is constant.
 * - A faster pointer release shortens the settle (flings snap into place).
 * - A faster scroll marginally speeds up scroll-driven reveals.
 * - Result is clamped to [minDuration, maxDuration] then scaled globally.
 */
function computeDuration(
  context: MotionContext,
  tuning: Required<Pick<MotionTuning, "baseVelocity" | "minDuration" | "maxDuration">>,
  config: MotionConfig,
): number {
  const distance = Math.abs(context.distance ?? 0);
  const baseVelocity = Math.max(1, tuning.baseVelocity);

  // Distance-proportional base: longer travel → longer duration, but with a
  // sub-linear curve so small distances aren't absurdly fast.
  const proportional = (Math.sqrt(distance) / Math.sqrt(baseVelocity)) * 16;

  let duration = clamp(
    proportional,
    tuning.minDuration,
    tuning.maxDuration,
  );

  // Pointer-release velocity: high momentum → shorter settle.
  const pv = context.pointerVelocity ?? 0;
  if (pv > 0) {
    duration /= 1 + pv * config.velocityResponsiveness;
  }

  // Scroll velocity nudges reveals a touch faster for a lively feel.
  const sv = context.scrollVelocity ?? 0;
  if (sv > 0) {
    duration /= 1 + clamp(sv * 0.05, 0, 0.35);
  }

  return clamp(duration * config.speedScale, tuning.minDuration, tuning.maxDuration);
}

/**
 * Compute the pre-transform scale. Bigger elements get a smaller delta so the
 * motion stays subtle; small elements can afford a larger pop.
 */
function computeScale(
  context: MotionContext,
  scaleDelta: number,
  config: MotionConfig,
): number {
  const size = context.size ?? 0;
  // Map a 0..400px size band to a 1..0 size factor (small → 1, large → ~0).
  const sizeFactor = config.sizeResponsiveness
    ? 1 - config.sizeResponsiveness * clamp(size / 400, 0, 1)
    : 1;
  return 1 - scaleDelta * sizeFactor;
}

/** Translate distance, signed by intent direction (exits move outward). */
function computeTranslate(
  context: MotionContext,
  baseTranslate: number,
): number {
  const exitLike: MotionIntent[] = ["exit", "collapse"];
  return exitLike.includes(context.intent) ? -Math.abs(baseTranslate) : Math.abs(baseTranslate);
}

/** Opacity start for fades: enters/swaps/exits start invisible. */
function computeOpacity(context: MotionContext): number {
  const transparent: MotionIntent[] = ["enter", "exit", "swap"];
  return transparent.includes(context.intent) ? 0 : 1;
}

/**
 * Resolve the full parameter set for one interaction. This is the core API:
 * give it context + tuning, receive runtime-computed motion values.
 */
export function resolveMotion(
  context: MotionContext,
  tuning: MotionTuning,
  config: MotionConfig,
  reduced: boolean,
): MotionParams {
  // Reduced motion: collapse to an imperceptible, transform-free settle so the
  // element still appears but without spatial travel.
  if (reduced) {
    return {
      duration: clamp(80 * config.speedScale, 0, 120),
      easing: "linear",
      scale: 1,
      translate: 0,
      opacity: 1,
      reduced: true,
    };
  }

  return {
    duration: computeDuration(
      context,
      {
        baseVelocity: tuning.baseVelocity ?? 1.2,
        minDuration: tuning.minDuration ?? 80,
        maxDuration: tuning.maxDuration ?? 500,
      },
      config,
    ),
    easing: EASING_BY_INTENT[context.intent],
    scale: computeScale(context, tuning.scaleDelta ?? 0.02, config),
    translate: computeTranslate(context, tuning.baseTranslate ?? 0),
    opacity: computeOpacity(context),
    reduced: false,
  };
}
