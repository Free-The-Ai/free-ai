/**
 * MotionProvider — Mount component for the adaptive motion system.
 *
 * Mirrors SoundProvider: renders null (NOT a wrapper), uses module-level
 * singleton shared across all Astro islands via the ES module cache. Must be
 * placed as a self-closing sibling, e.g. in Layout.astro:
 *
 *   <MotionProvider client:load config={{ speedScale: 1, reducedMotion: "inherit" }} />
 *
 * Lifecycle: initMotionSystem() is called on first mount. Pointer/scroll/
 * reduced-motion listeners on window persist across SPA navigations. Cleanup
 * happens on tab close via beforeunload inside singleton.ts.
 */
import { useEffect } from "react";
import {
  initMotionSystem,
  motionConfigure,
} from "../lib/motion/singleton";
import type { MotionConfig } from "../lib/motion/types";

interface MotionProviderProps {
  config?: Partial<MotionConfig>;
}

export default function MotionProvider(props: MotionProviderProps) {
  useEffect(() => {
    motionConfigure(props.config);
    initMotionSystem();
  }, []);

  return null;
}
