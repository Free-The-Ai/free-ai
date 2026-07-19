import { fileURLToPath, URL } from "node:url";
import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-static";
import { defineConfig } from "vite";

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src/lib", import.meta.url)),
        },
    },
    plugins: [
        sveltekit({
            // Enforce runes mode for EVERY component (incl. the ~31 that use no
            // rune and would otherwise compile in Svelte 4 legacy mode). Legacy
            // APIs (export let, $:, on:, <slot>) become compile errors.
            compilerOptions: { runes: true },
            adapter: adapter({
                pages: "dist",
                assets: "dist",
                fallback: undefined,
                precompress: false,
                strict: true,
            }),
            alias: {
                "@/*": "./src/lib/*",
            },
            prerender: {
                crawl: true,
                entries: ["*"],
                // sitemap-index.xml / sitemap-0.xml are written by scripts/postbuild.mjs
                // *after* prerendering, so the crawler's broken-link check can't see
                // them yet — the layout's own <link rel="sitemap"> reference to them
                // is the only expected 404 during this pass.
                handleHttpError: ({ path, message }) => {
                    if (path === "/sitemap-index.xml") return;
                    throw new Error(message);
                },
                handleMissingId: "fail",
            },
        }),
    ],
});
