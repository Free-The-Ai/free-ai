/**
 * ThemeProvider — Mount component for the runtime theme system.
 *
 * Mirrors SoundProvider / MotionProvider: renders null (NOT a wrapper), uses a
 * module-level singleton shared across all Astro islands via the ES module
 * cache. Place as a self-closing sibling in Layout.astro:
 *
 *   <ThemeProvider client:load config={{ scheme: "dark", density: "comfortable" }} />
 *
 * For a flash-free first paint, also inject themeInlineBootstrap() into a
 * <script is:inline> in <head> so persisted/system scheme applies before
 * hydration. Lifecycle: initThemeSystem() on mount; cleanup on beforeunload.
 */
import { useEffect } from "react";
import {
  initThemeSystem,
  themeConfigure,
} from "../lib/theme/singleton";
import type { ThemeConfig } from "../lib/theme/types";

interface ThemeProviderProps {
  config?: Partial<ThemeConfig>;
}

export default function ThemeProvider(props: ThemeProviderProps) {
  useEffect(() => {
    // User-provided config (from Layout props) is treated as an explicit choice.
    if (props.config && Object.keys(props.config).length > 0) {
      themeConfigure(props.config);
    }
    initThemeSystem();
  }, []);

  return null;
}
