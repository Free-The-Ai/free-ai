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
                handleHttpError: "fail",
                handleMissingId: "fail",
            },
        }),
    ],
});
