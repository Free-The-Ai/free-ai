/**
 * useMotion — React hook for adaptive motion.
 *
 * Usage in a component:
 *
 *   const [open, setOpen] = useState(false);
 *   const motion = useMotion({
 *     preset: "dropdown",
 *     intent: open ? "enter" : "exit",
 *     get distance() { return el?.offsetHeight ?? 0; },
 *   });
 *   <div ref={motion.ref} style={motion.style} />
 *
 * It computes the CSS custom properties (--motion-duration / -easing / -scale /
 * -translate / -opacity) and writes them onto the bound element so CSS
 * animations read live values.
 */
import { useEffect, useMemo, useRef } from "react";
import { motionApply, motionFor } from "./singleton";
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
  ref: (el: HTMLElement | null) => void;
  /** Style object: { "--motion-duration", ... } for inline use. */
  style: Record<string, string>;
}

export function useMotion(input: MotionInput): MotionController {
  const elRef = useRef<HTMLElement | null>(null);

  const params = useMemo(
    () => motionFor(input.preset, input.intent, input),
    [input],
  );

  const style = useMemo<Record<string, string>>(
    () => ({
      "--motion-duration": `${params.duration}ms`,
      "--motion-easing": params.easing,
      "--motion-scale": String(params.scale),
      "--motion-translate": `${params.translate}px`,
      "--motion-opacity": String(params.opacity),
    }),
    [params],
  );

  useEffect(() => {
    if (elRef.current) motionApply(elRef.current, params);
  }, [params]);

  const ref = (node: HTMLElement | null): void => {
    elRef.current = node;
    if (node) motionApply(node, params);
  };

  return { ref, style };
}
