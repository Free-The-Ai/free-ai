<script lang="ts">
    /**
     * Renders a `buildSeo()` result into `<svelte:head>`. Single source of truth
     * for per-page SEO markup so every route composes the same tag set instead
     * of re-implementing the previous @unhead/vue `useSeo` composable inline.
     */
    import type { ResolvedSeo } from "@/shared/lib/seo";

    let { seo }: { seo: ResolvedSeo } = $props();
</script>

<svelte:head>
    <title>{seo.title}</title>
    {#each seo.meta as tag (tag.name ?? tag.property)}
        {#if tag.name}
            <meta name={tag.name} content={tag.content} />
        {:else if tag.property}
            <meta property={tag.property} content={tag.content} />
        {/if}
    {/each}
    <link rel="canonical" href={seo.canonical} />
    {#each seo.jsonLd as block, i (i)}
        {@html `<script type="application/ld+json">${JSON.stringify(block)}</` + `script>`}
    {/each}
</svelte:head>
