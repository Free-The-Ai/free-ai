/**
 * createMotion — Solid reactive primitive for adaptive motion.
 *
 * Usage in a component:
 *
 *   const open = createSignal(false);
 *   const motion = createMotion(() => ({
 *     preset: "dropdown",
 *     intent: open() ? "enter" : "exit",
 *     get distance() { return el()?.offsetHeight ?? 0; },
 *   }));
 *   <div ref={motion.ref} style={motion.style()} />
 *
 * It recomputes whenever the reactive inputs change and writes the computed
 * CSS custom properties (--motion-duration / -easing / -scale / -translate /
 * -opacity) onto the bound element so CSS animations read live values.
 */
import { createEffect, createMemo, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import {
  motionApply,
  motionFor,
} from "./singleton";
import type {
  MotionContext,
  MotionIntent,
  MotionPresetName,
  MotionTuning,
} from "./types";

export interface MotionInput extends Partial<MotionContext>, Partial<MotionTuning> {
  preset: MotionPresetName;
  intent: MotionIntent;
}

export interface MotionController {
  /** Ref callback — attach to the element that should receive motion vars. */
  ref: (el: HTMLElement) => void;
  /** Reactive style object: { "--motion-duration", ... } for inline use. */
  style: Accessor<Record<string, string>>;
}

export function createMotion(
  input: Accessor<MotionInput>,
): MotionController {
  let el: HTMLElement | null = null;

  const params = createMemo(() => {
    const i = input();
    return motionFor(i.preset, i.intent, i);
  });

  // Write live CSS vars onto the bound element whenever inputs change.
  createEffect(() => {
    if (el) motionApply(el, params());
  });

  onCleanup(() => {
    el = null;
  });

  const ref = (node: HTMLElement): void => {
    el = node;
    motionApply(node, params());
  };

  const style = createMemo<Record<string, string>>(() => {
    const p = params();
    return {
      "--motion-duration": `${p.duration}ms`,
      "--motion-easing": p.easing,
      "--motion-scale": String(p.scale),
      "--motion-translate": `${p.translate}px`,
      "--motion-opacity": String(p.opacity),
    };
  });

  return { ref, style };
}
