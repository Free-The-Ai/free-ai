/**
 * Single client bootstrap, replacing the three null-rendering Astro provider
 * islands (SoundProvider, MotionProvider, ThemeProvider). Runs once, client
 * side only, after the SSG-rendered app mounts. Configure-then-init order is
 * preserved exactly from the original components.
 */
import { initSoundSystem, soundConfigure } from "@/shared/lib/sound/singleton";
import { initMotionSystem, motionConfigure } from "@/shared/lib/motion/singleton";
import { initThemeSystem, themeConfigure } from "@/shared/lib/theme/singleton";

export function bootstrapClientSystems(): void {
    soundConfigure({ volume: 0.3, theme: "aero" });
    initSoundSystem();

    motionConfigure({ speedScale: 1, reducedMotion: "inherit" });
    initMotionSystem();

    themeConfigure({ scheme: "dark", density: "comfortable", typography: "standard" });
    initThemeSystem();
}
