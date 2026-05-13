import sitemap from "@astrojs/sitemap";
import solid from "@astrojs/solid-js";
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://freetheai.xyz",
    output: "static",
    integrations: [
        sitemap({
            filter: (url) => url !== "https://freetheai.xyz/",
        }),
        solid(),
    ],
    devToolbar: {
        enabled: false,
    },
});
