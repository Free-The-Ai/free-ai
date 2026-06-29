/**
 * SoundProvider — Mount component for the sound system.
 *
 * ARCHITECTURE: Uses module-level singleton (no React context).
 * In Astro, each client:load island is a separate hydration boundary,
 * so context fails across islands. A module-level singleton shared via ES
 * module cache works across all islands on the same page.
 *
 * IMPORTANT: This component renders nothing (returns null). It is NOT a wrapper.
 * It must be placed as a self-closing sibling element, NOT wrapping children.
 * Wrapping children caused <astro-island> to enclose transition:persist elements,
 * which breaks Astro View Transitions (elements persist across navigations but
 * their parent island gets destroyed, leaving transitions stuck).
 *
 * Usage in Layout.astro:
 *   <SoundProvider client:load config={{ volume: 0.3, theme: "aero" }} />
 *
 * The sound system persists across navigations because it uses module-level
 * state that survives component recreation.
 * Lifecycle: initSoundSystem() is called on first mount. Event listeners
 * on document/window survive navigation. The AudioContext persists.
 * Only the beforeunload event tears everything down.
 */

import { useEffect } from "react";
import {
  initSoundSystem,
  soundConfigure,
} from "../lib/sound/singleton";
import type { SensoryConfig } from "../lib/sound/types";

interface SoundProviderProps {
  config?: Partial<SensoryConfig>;
}

export default function SoundProvider(props: SoundProviderProps) {
  useEffect(() => {
    soundConfigure(props.config);
    initSoundSystem();
    // Do NOT destroy on unmount — module-level state survives navigation.
    // The sound system uses document/window event listeners that persist.
    // Cleanup happens on tab close via beforeunload inside singleton.ts.
  }, []);

  return null;
}
