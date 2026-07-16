import "@/app/styles/global.css";
import "@/app/styles/kit.css";
import { ViteSSG } from "vite-ssg";
import { START_LOCATION } from "vue-router";
import App from "./App.vue";
import { routes } from "./router/routes";
import { bootstrapClientSystems } from "./providers";
import { initGlobalInteractions } from "./interactions";

export const createApp = ViteSSG(
    App,
    {
        routes,
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) return savedPosition;
            if (to.hash) {
                const top = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
                return {
                    el: to.hash,
                    top,
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                };
            }
            if (from === START_LOCATION) return false;
            return { top: 0 };
        },
    },
    ({ router }) => {
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
    },
);
