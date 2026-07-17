<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import { buildBreadcrumbJsonLd, buildMachineReadableResourcesJsonLd, buildOrganizationJsonLd, buildWebsiteJsonLd, buildWebApiJsonLd } from "@/shared/lib/jsonLd";
    import { ProviderStatusGrid } from "@/features/provider-status";
    import { DitherGradient, SeoHead } from "@/shared/ui";

    const seo = buildSeo({
        title: "FreeTheAi Status",
        description: "Live FreeTheAi API status by public alias prefix, including provider health signals for the free OpenAI-compatible API.",
        path: "/status",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd(),
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Status", url: "https://freetheai.xyz/status" },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="status-main">
    <section class="status-hero shell">
        <DitherGradient class="status-glow" from="orange" direction="up" opacity={0.28} />
        <span class="eyebrow">Live status</span>
        <h1>Provider health</h1>
        <p class="status-lede">Real-time signals from the FreeTheAi API by provider prefix.</p>
        <a href="https://api.freetheai.xyz/v1/health" target="_blank" rel="noreferrer" class="status-api-link">
            Open /v1/health <span aria-hidden="true">&rarr;</span>
        </a>
    </section>

    <ProviderStatusGrid />
</main>

<style>
.status-hero {
    display: grid;
    gap: 12px;
    padding: clamp(28px, 4.6vw, 52px);
    text-align: center;
    justify-items: center;
}
.status-hero .eyebrow {
    color: var(--dim);
}
.status-hero h1 {
    margin: 0;
    font-size: clamp(2.35rem, 4.7vw, 3.6rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
}
.status-lede {
    margin: 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 1.02rem;
    line-height: 1.6;
    text-wrap: pretty;
}
.status-api-link {
    color: var(--accent-text);
    font-size: 0.9rem;
    text-decoration: none;
    font-weight: 500;
}
.status-api-link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
}
:global(.status-summary) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    padding: 0 clamp(20px, 4vw, 40px) clamp(22px, 3.8vw, 36px);
}
:global(.status-summary-card) {
    display: grid;
    gap: 6px;
    padding: 18px 16px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    text-align: center;
}
:global(.status-summary-card > span:first-child) {
    font-family: var(--font-mono);
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 600;
    color: var(--text);
    line-height: 1;
}
:global(.status-summary-card > span:last-child) {
    font-size: 0.78rem;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}
:global(.status-summary-card.is-healthy > span:first-child) {
    color: oklch(0.72 0.15 145);
}
:global(.status-summary-card.is-degraded > span:first-child) {
    color: oklch(0.72 0.15 50);
}
@media (max-width: 560px) {
    :global(.status-summary) {
        grid-template-columns: 1fr;
    }
}
.status-hero {
    position: relative;
    overflow: hidden;
}
:global(.status-glow) {
    z-index: 0;
}
.status-hero > :global(*:not(.status-glow)) {
    position: relative;
    z-index: 1;
}
</style>
