<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import {
        buildOrganizationJsonLd,
        buildSoftwareJsonLd,
        buildWebsiteJsonLd,
        buildWebApiJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildModelCatalogJsonLd,
        buildBreadcrumbJsonLd,
    } from "@/shared/lib/jsonLd";
    import { CatalogBrowser } from "@/features/model-catalog-search";
    import { DitherGradient, SeoHead } from "@/shared/ui";
    import { modelPrefix } from "@/shared/lib/format";
    import modelSnapshot from "@/entities/model/models.json";

    const DISABLED_PREFIXES = new Set(["vhr"]);

    interface SnapshotModelRaw {
        id?: unknown;
        prefix?: unknown;
    }

    const snapshotModels = Array.isArray((modelSnapshot as { data?: unknown[] }).data)
        ? (modelSnapshot as { data: SnapshotModelRaw[] }).data
              .filter((model): model is { id: string; prefix?: string } => typeof model?.id === "string" && model.id.trim() !== "")
              .map((model) => ({
                  id: model.id.trim(),
                  prefix: typeof model.prefix === "string" && model.prefix.trim() ? model.prefix.trim() : modelPrefix(model.id.trim()),
              }))
              .filter((model) => !DISABLED_PREFIXES.has(model.prefix))
        : [];

    const sortedSnapshotModels = [...snapshotModels].sort((left, right) =>
        left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }),
    );

    const prefixGroups = (() => {
        const groups = new Map<string, string[]>();
        for (const model of sortedSnapshotModels) {
            const list = groups.get(model.prefix) ?? [];
            list.push(model.id);
            groups.set(model.prefix, list);
        }
        return [...groups.entries()].sort((left, right) => left[0].localeCompare(right[0]));
    })();

    const totalSnapshotModels = sortedSnapshotModels.length;
    const totalSnapshotPrefixes = prefixGroups.length;
    const snapshotGeneratedAt = (modelSnapshot as { generated_at?: string }).generated_at ?? null;

    const pageDescription = `Search the FreeTheAi model catalog: ${totalSnapshotModels} active OpenAI-compatible chat, image, and tool-capable model aliases across ${totalSnapshotPrefixes} provider prefixes with live filtering and copyable IDs.`;

    const seo = buildSeo({
        title: "FreeTheAi Model Catalog - Free OpenAI-Compatible AI Models",
        description: pageDescription,
        path: "/models",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd({ modelCount: totalSnapshotModels, modelGeneratedAt: snapshotGeneratedAt ?? undefined }),
            buildModelCatalogJsonLd(sortedSnapshotModels.map((model) => model.id)),
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Model Catalog", url: "https://freetheai.xyz/models" },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="models-main">
    <section class="models-hero shell">
        <DitherGradient class="models-glow" from="orange" direction="up" opacity={0.28} />
        <span class="eyebrow">Model catalog</span>
        <h1>FreeTheAi public model aliases</h1>
        <p class="models-lede">
            {totalSnapshotModels} OpenAI-compatible chat, image, and audio model aliases across {totalSnapshotPrefixes}
            provider prefixes. Search, filter, and copy any alias into your client.
        </p>
        <div class="models-hero-meta">
            <span class="models-hero-chip"><strong>{totalSnapshotModels}</strong> models</span>
            <span class="models-hero-chip"><strong>{totalSnapshotPrefixes}</strong> providers</span>
            <a href="/docs#models" class="models-hero-link">API docs</a>
        </div>
    </section>
    <section class="section shell models-catalog-section" id="catalog">
        <CatalogBrowser />
        <noscript>
            <p class="models-noscript">
                JavaScript is disabled. The full live catalog browser needs JavaScript, but the static snapshot below lists
                every public alias for crawlers and read-only viewers.
            </p>
        </noscript>
        <section class="models-static-catalog" aria-label="Static FreeTheAi model catalog snapshot" data-snapshot-models={totalSnapshotModels} data-snapshot-prefixes={totalSnapshotPrefixes}>
            <header class="models-static-head">
                <h2>FreeTheAi public model aliases</h2>
                <p>
                    {totalSnapshotModels} OpenAI-compatible model aliases across {totalSnapshotPrefixes} provider
                    prefixes. Use any alias as the <code>model</code> field with base URL
                    <code>https://api.freetheai.xyz/v1</code>.
                    {#if snapshotGeneratedAt}<span class="models-static-stamp">Snapshot generated {snapshotGeneratedAt}.</span>{/if}
                </p>
            </header>
            {#each prefixGroups as [prefix, ids] (prefix)}
                <section class="models-static-group">
                    <h3>{prefix}/* <span>{ids.length} models</span></h3>
                    <ul>
                        {#each ids as id (id)}
                            <li><code>{id}</code></li>
                        {/each}
                    </ul>
                </section>
            {/each}
            <p class="models-static-foot">
                Live availability and rate limits are documented in the <a href="/docs#models">API docs</a>.
                The live catalog above reflects current model state from the FreeTheAi API.
            </p>
        </section>
    </section>
</main>

<style>
.models-hero {
    display: grid;
    gap: 12px;
    padding: clamp(28px, 4.6vw, 52px);
    text-align: center;
    justify-items: center;
}
.models-hero .eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.models-hero h1 {
    margin: 0;
    font-size: clamp(2.35rem, 4.7vw, 3.6rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
}
.models-lede {
    margin: 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 1.02rem;
    line-height: 1.6;
    text-wrap: pretty;
}
.models-hero-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
}
.models-hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--muted);
    font-size: 0.85rem;
}
.models-hero-chip strong {
    color: var(--accent-text);
    font-family: var(--font-serif);
    font-size: 1rem;
    text-shadow: var(--accent-text-glow);
}
.models-hero-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-shell-bg);
    box-shadow: var(--sk-raised-shadow);
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: border-color 150ms var(--ease-out-smooth), box-shadow 150ms var(--ease-out-smooth);
}
.models-hero-link:hover {
    border-color: var(--border-strong);
    box-shadow: var(--sk-raised-shadow), var(--sk-accent-glow);
}
.models-static-catalog {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
.models-noscript :global(.models-noscript-msg),
.models-noscript :global(p) {
    margin: 0 0 18px;
    padding: 12px 14px;
    border: 1px dashed var(--sk-border);
    border-radius: var(--radius-sm);
    color: var(--muted);
    font-size: 0.88rem;
}
.models-hero {
    position: relative;
    overflow: hidden;
}
:global(.models-glow) {
    z-index: 0;
}
.models-hero > :global(*:not(.models-glow)) {
    position: relative;
    z-index: 1;
}
</style>
