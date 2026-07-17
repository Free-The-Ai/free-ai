/**
 * Runs after `vite build`. Replaces vite-ssg's onFinished hook:
 * - GitHub Pages needs a root-level 404.html, not adapter-static's nested
 *   /404/index.html.
 * - Replaces @astrojs/sitemap: STATIC_ROUTES is the single source of truth
 *   for both the prerendered pages and the sitemap.
 */
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_ROUTES } from "../src/lib/shared/config/staticRoutes.ts";
import { siteConfig } from "../src/lib/shared/config/site.ts";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const distDir = path.join(rootDir, "dist");
const siteOrigin = siteConfig.site;

async function relocateNotFound() {
    const nested = path.join(distDir, "404", "index.html");
    const target = path.join(distDir, "404.html");
    if (!existsSync(nested)) throw new Error(`Expected ${nested} to exist after the build.`);
    await rename(nested, target);
    const nestedDir = path.join(distDir, "404");
    if ((await readdir(nestedDir)).length === 0) await rm(nestedDir, { recursive: true });
}

async function writeSitemap() {
    const urls = STATIC_ROUTES.filter((route) => route !== "/" && route !== "/404").map((route) => `${siteOrigin}${route}/`);
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteOrigin}/sitemap-0.xml</loc></sitemap></sitemapindex>`;
    const sitemapUrls = urls.map((url) => `<url><loc>${url}</loc></url>`).join("");
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${sitemapUrls}</urlset>`;
    await mkdir(distDir, { recursive: true });
    await writeFile(path.join(distDir, "sitemap-index.xml"), sitemapIndex, "utf8");
    await writeFile(path.join(distDir, "sitemap-0.xml"), sitemap, "utf8");
}

await relocateNotFound();
await writeSitemap();
