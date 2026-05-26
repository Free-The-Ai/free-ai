/**
 * SoundProvider — Mount component for the sound system.
 *
 * ARCHITECTURE: Uses module-level singleton (no Solid.js context).
 * In Astro, each client:load island is a separate Solid.js hydration boundary,
 * so createContext/useContext fails across islands. A module-level singleton
 * shared via ES module cache works across all islands on the same page.
 *
 * This mirrors the existing haptics pattern (src/lib/haptics.ts).
 */

import { onMount, onCleanup } from "solid-js";
import type { JSXElement } from "solid-js";
import {
  initSoundSystem,
  destroySoundSystem,
  soundPlay,
  soundConfigure,
} from "../lib/sound/singleton";
import type { SensoryConfig } from "../lib/sound/types";

export { soundPlay, soundConfigure } from "../lib/sound/singleton";

interface SoundProviderProps {
  config?: Partial<SensoryConfig>;
  children: JSXElement;
}

export default function SoundProvider(props: SoundProviderProps) {
  onMount(() => {
    soundConfigure(props.config);
    initSoundSystem();
    onCleanup(destroySoundSystem);
  });

  return props.children;
}
