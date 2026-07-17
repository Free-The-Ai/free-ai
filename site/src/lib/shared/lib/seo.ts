/**
 * Route-level SEO helper. Computes per-page title/description/canonical/
 * OG/Twitter/Dublin-Core metadata and JSON-LD for rendering via
 * <svelte:head> in each +page.svelte, mirroring the previous @unhead/vue
 * useSeo composable. Site-wide (non-route) head tags live in
 * src/routes/+layout.svelte.
 */
import { siteConfig } from "@/shared/config/site";

export interface SeoOptions {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string;
    path: string;
    jsonLd?: Record<string, unknown>[];
}

export interface SeoMetaTag {
    name?: string;
    property?: string;
    content: string;
}

export interface ResolvedSeo {
    title: string;
    meta: SeoMetaTag[];
    canonical: string;
    jsonLd: Record<string, unknown>[];
}

export function buildSeo(options: SeoOptions): ResolvedSeo {
    const rawTitle = options.title ?? siteConfig.title;
    const title = rawTitle === siteConfig.title || rawTitle.includes(siteConfig.title) ? rawTitle : `${rawTitle} | ${siteConfig.title}`;
    const description = options.description ?? siteConfig.description;
    const canonical = new URL(options.path, siteConfig.site).toString();
    const ogImage = new URL(options.image ?? siteConfig.defaults.ogImage, siteConfig.site).toString();
    const keywords = options.keywords ? `${options.keywords}, ${siteConfig.defaults.keywords.join(", ")}` : siteConfig.defaults.keywords.join(", ");
    const jsonLd = options.jsonLd ?? [];

    return {
        title,
        canonical,
        jsonLd,
        meta: [
            { name: "title", content: title },
            { name: "description", content: description },
            { name: "keywords", content: keywords },
            { name: "DC.title", content: title },
            { name: "DC.description", content: description },
            { name: "DC.identifier", content: canonical },
            { property: "og:url", content: canonical },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:image", content: ogImage },
            { name: "twitter:title", content: title },
            { name: "twitter:description", content: description },
            { name: "twitter:image", content: ogImage },
        ],
    };
}
