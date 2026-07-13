import "@/app/styles/global.css";
import "@/app/styles/kit.css";
import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { routes } from "./router/routes";
import { bootstrapClientSystems } from "./providers";
import { initGlobalInteractions } from "./interactions";

export const createApp = ViteSSG(App, { routes }, ({ router }) => {
    if (import.meta.env.SSR) return;

    bootstrapClientSystems();
    initGlobalInteractions();

    let firstNavigation = true;
    router.beforeEach(() => {
        if (firstNavigation) {
            firstNavigation = false;
            return;
        }
        const soundPlay = (window as unknown as { __soundPlay?: (role: string) => void }).__soundPlay;
        soundPlay?.("navigation.forward");
    });
});
