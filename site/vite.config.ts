import { fileURLToPath, URL } from "node:url";
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import type { ViteSSGOptions } from "vite-ssg";
import { SETUP_GUIDES } from "./src/entities/setup-guide/model";

/** Every route the SSG build must prerender to static HTML. Single source of
 * truth for both the sitemap generator (scripts/postbuild.mjs) and the SSG
 * crawler seed list, so dynamic /setup/:slug routes are never missed. */
export const STATIC_ROUTES: string[] = [
    "/",
    "/home",
    "/docs",
    "/models",
    "/pricing",
    "/status",
    "/quickstart",
    "/setup",
    ...SETUP_GUIDES.map((guide) => `/setup/${guide.slug}`),
    "/roleplay-api",
    "/coding-agent-api",
    "/openai-compatible-api",
    "/team",
    "/support",
    "/privacy",
    "/terms",
    "/what-is-free-the-ai",
    "/404",
];

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const distDir = path.join(rootDir, "dist");
const siteOrigin = "https://freetheai.xyz";

/** GitHub Pages needs a root-level 404.html, not the nested /404/index.html
 * vite-ssg's dirStyle:'nested' produces. */
async function relocateNotFound(): Promise<void> {
    const nested = path.join(distDir, "404", "index.html");
    const target = path.join(distDir, "404.html");
    if (!existsSync(nested)) throw new Error(`Expected ${nested} to exist after the SSG build.`);
    await rename(nested, target);
    const nestedDir = path.join(distDir, "404");
    if ((await readdir(nestedDir)).length === 0) await rm(nestedDir, { recursive: true });
}

/** Replaces @astrojs/sitemap: same STATIC_ROUTES list drives both the SSG
 * crawl and the sitemap, so there is one source of truth for site routes. */
async function writeSitemap(): Promise<void> {
    const urls = STATIC_ROUTES.filter((route) => route !== "/" && route !== "/404").map((route) => `${siteOrigin}${route}/`);
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteOrigin}/sitemap-0.xml</loc></sitemap></sitemapindex>`;
    const sitemapUrls = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${sitemapUrls}</urlset>`;
    await mkdir(distDir, { recursive: true });
    await writeFile(path.join(distDir, "sitemap-index.xml"), sitemapIndex, "utf8");
    await writeFile(path.join(distDir, "sitemap-0.xml"), sitemap, "utf8");
}

const ssgOptions: ViteSSGOptions = {
    script: "async",
    formatting: "minify",
    dirStyle: "nested",
    includedRoutes: () => STATIC_ROUTES,
    // Astro's static build never inlined critical CSS; keep parity and skip
    // the extra beasties dependency.
    beastiesOptions: false,
    onFinished: async () => {
        await relocateNotFound();
        await writeSitemap();
    },
};

export default defineConfig({
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    plugins: [vue()],
    ssgOptions,
});
