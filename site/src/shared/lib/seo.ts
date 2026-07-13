/**
 * Route-level SEO composable. Wires per-page title/description/canonical/
 * OG/Twitter/Dublin-Core metadata and JSON-LD into @unhead/vue, mirroring
 * BaseHead.astro's per-page fields. Site-wide (non-route) head tags live in
 * app/App.vue.
 */
import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { useHead } from "@unhead/vue";
import { siteConfig } from "@/shared/config/site";

export interface SeoOptions {
    title?: MaybeRefOrGetter<string | undefined>;
    description?: MaybeRefOrGetter<string | undefined>;
    image?: MaybeRefOrGetter<string | undefined>;
    keywords?: MaybeRefOrGetter<string | undefined>;
    path: MaybeRefOrGetter<string>;
    jsonLd?: MaybeRefOrGetter<Record<string, unknown>[] | undefined>;
}

export function useSeo(options: SeoOptions): void {
    const pageTitle = computed(() => {
        const title = toValue(options.title) ?? siteConfig.title;
        return title === siteConfig.title || title.includes(siteConfig.title) ? title : `${title} | ${siteConfig.title}`;
    });
    const description = computed(() => toValue(options.description) ?? siteConfig.description);
    const canonical = computed(() => new URL(toValue(options.path), siteConfig.site).toString());
    const ogImage = computed(() => new URL(toValue(options.image) ?? siteConfig.defaults.ogImage, siteConfig.site).toString());
    const keywords = computed(() => {
        const extra = toValue(options.keywords);
        const base = siteConfig.defaults.keywords.join(", ");
        return extra ? `${extra}, ${base}` : base;
    });
    const jsonLdBlocks = computed(() => toValue(options.jsonLd) ?? []);

    useHead({
        title: pageTitle,
        meta: [
            { name: "title", content: pageTitle },
            { name: "description", content: description },
            { name: "keywords", content: keywords },
            { name: "DC.title", content: pageTitle },
            { name: "DC.description", content: description },
            { name: "DC.identifier", content: canonical },
            { property: "og:url", content: canonical },
            { property: "og:title", content: pageTitle },
            { property: "og:description", content: description },
            { property: "og:image", content: ogImage },
            { name: "twitter:title", content: pageTitle },
            { name: "twitter:description", content: description },
            { name: "twitter:image", content: ogImage },
        ],
        link: [{ rel: "canonical", href: canonical }],
        script: jsonLdBlocks.value.map((block) => ({
            type: "application/ld+json",
            innerHTML: JSON.stringify(block),
        })),
    });
}
