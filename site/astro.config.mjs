import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://freetheai.xyz",
    output: "static",
    integrations: [
        sitemap({
            filter: (url) => url !== "https://freetheai.xyz/",
        }),
        react(),
    ],
    devToolbar: {
        enabled: false,
    },
});
