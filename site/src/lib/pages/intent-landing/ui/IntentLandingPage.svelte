<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import { siteConfig } from "@/shared/config/site";
    import { CtaButton, DitherGradient, SeoHead } from "@/shared/ui";
    import { INTENT_PAGES } from "@/entities/intent-page";
    import { SETUP_GUIDES } from "@/entities/setup-guide";
    import { buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildSoftwareJsonLd, buildWebApiJsonLd, buildWebsiteJsonLd } from "@/shared/lib/jsonLd";

    let { intentKey }: { intentKey: string } = $props();

    const page = $derived(INTENT_PAGES[intentKey]);

    const guideMap = new Map(SETUP_GUIDES.map((guide) => [guide.slug, guide]));
    const guides = $derived(
        page.setupSlugs.map((slug) => guideMap.get(slug)).filter((guide): guide is (typeof SETUP_GUIDES)[number] => Boolean(guide)),
    );

    let filterQuery = $state("");
    const normalizedQuery = $derived(filterQuery.trim().toLowerCase());

    function matchesGuide(guide: (typeof SETUP_GUIDES)[number]): boolean {
        if (!normalizedQuery) return true;
        const haystack = `${guide.categoryLabel} ${guide.name} ${guide.tagline}`.toLowerCase();
        return haystack.includes(normalizedQuery);
    }

    const visibleGuides = $derived(guides.filter(matchesGuide));

    // svelte-ignore state_referenced_locally
    const current = page;
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: current.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    };
    const webPageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `https://freetheai.xyz/${current.slug}#webpage`,
        name: current.title,
        url: `https://freetheai.xyz/${current.slug}`,
        description: current.description,
        isPartOf: { "@id": "https://freetheai.xyz/#website" },
        about: {
            "@type": "Service",
            name: current.title,
            serviceType: current.eyebrow,
            provider: { "@id": "https://freetheai.xyz/#organization" },
            audience: { "@type": "Audience", audienceType: current.audience },
            areaServed: "Worldwide",
            url: `https://freetheai.xyz/${current.slug}`,
        },
    };
    // svelte-ignore state_referenced_locally
    const itemListJsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${current.eyebrow} setup guides`,
        numberOfItems: guides.length,
        itemListElement: guides.map((guide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${guide.name} setup`,
            url: `https://freetheai.xyz/setup/${guide.slug}`,
        })),
    };

    // svelte-ignore state_referenced_locally
    const seo = buildSeo({
        title: page.title,
        description: page.description,
        keywords: page.keywords.join(", "),
        path: `/${page.slug}`,
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            webPageJsonLd,
            itemListJsonLd,
            faqJsonLd,
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: current.eyebrow, url: `https://freetheai.xyz/${current.slug}` },
            ]),
        ],
    });
</script>

<SeoHead {seo} />

<main class="intent-main">
    <section class="intent-hero shell">
        <DitherGradient class="intent-glow" from="grey" direction="up" opacity={0.3} />
        <span class="eyebrow">{page.eyebrow}</span>
        <h1>{page.h1}</h1>
        <p class="intent-lede">{page.lede}</p>
        <div class="intent-cta-row">
            <CtaButton to={page.primaryHref}>{page.primaryLabel}</CtaButton>
            <a class="intent-secondary" href={page.secondaryHref}>{page.secondaryLabel}</a>
            <a class="intent-secondary" href={siteConfig.socials.discord} target="_blank" rel="noreferrer">Get a free key</a>
        </div>
    </section>

    <section class="section shell intent-config-section">
        <header class="intent-section-head">
            <span class="eyebrow">Copy-paste basics</span>
            <h2>Use the same FreeTheAi gateway everywhere.</h2>
            <p>{page.audience}</p>
        </header>
        <div class="intent-config-grid">
            {#each page.config as item (item.title)}
                <article class="intent-config-card">
                    <span>{item.title}</span>
                    <code>{item.text}</code>
                </article>
            {/each}
        </div>
    </section>

    <section class="section shell intent-grid-section">
        <div class="intent-info-panel">
            <header class="intent-section-head">
                <span class="eyebrow">Why it works</span>
                <h2>Built for real clients, not just docs.</h2>
            </header>
            <div class="intent-card-list">
                {#each page.strengths as item (item.title)}
                    <article>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </article>
                {/each}
            </div>
        </div>
        <div class="intent-info-panel">
            <header class="intent-section-head">
                <span class="eyebrow">Routes</span>
                <h2>Pick the route your client expects.</h2>
            </header>
            <div class="intent-card-list">
                {#each page.routes as item (item.title)}
                    <article>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    {#if guides.length > 0}
        <section class="section shell intent-guides-section">
            <header class="intent-section-head">
                <span class="eyebrow">Exact setup</span>
                <h2>Start with one of these guides.</h2>
                <p>Each guide includes the right URL format, model field, and common client-specific gotchas.</p>
            </header>
            <div class="search-field">
                <span class="material-symbols-outlined" aria-hidden="true">search</span>
                <input bind:value={filterQuery} type="search" placeholder="Filter guides..." />
            </div>
            <div class="intent-guide-grid">
                {#each visibleGuides as guide, index (guide.slug)}
                    <a class="intent-guide-card" href={`/setup/${guide.slug}`} style="position: relative">
                        {#if index === 0}<span class="popular-badge">Popular</span>{/if}
                        <span>{guide.categoryLabel}</span>
                        <strong>{guide.name}</strong>
                        <p>{guide.tagline}</p>
                        <em>Open guide -&gt;</em>
                    </a>
                {/each}
            </div>
        </section>
    {/if}

    <section class="section shell intent-faq-section">
        <header class="intent-section-head">
            <span class="eyebrow">FAQ</span>
            <h2>Fast answers.</h2>
        </header>
        <div class="intent-faq-list">
            {#each page.faqs as faq (faq.question)}
                <details>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                </details>
            {/each}
        </div>
    </section>
</main>

<style>
.intent-main {
    gap: 24px;
    padding: 22px 0 64px;
}
.intent-hero {
    position: relative;
    display: grid;
    gap: 16px;
    overflow: hidden;
    padding: clamp(30px, 5vw, 58px);
}
:global(.intent-glow) {
    opacity: 0.6;
    z-index: 0;
}
.intent-hero > * {
    position: relative;
    z-index: 1;
}
.intent-hero h1 {
    max-width: 780px;
    margin: 0;
    font-size: clamp(2.3rem, 5vw, 4rem);
    line-height: 1.02;
    letter-spacing: -0.055em;
}
.intent-lede {
    max-width: 68ch;
    margin: 0;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1.65;
    text-wrap: pretty;
}
.intent-cta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin-top: 4px;
}
.intent-cta-row :global(.cta-arrow) {
    opacity: 0.65;
    font-size: 0.9rem;
}
.intent-secondary {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    color: var(--muted);
    font-size: 0.92rem;
    text-decoration: none;
    border-bottom: 1px solid var(--sk-border);
    transition: color 150ms var(--ease-out-smooth), border-color 150ms var(--ease-out-smooth);
}
.intent-secondary:hover {
    color: var(--accent-text);
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}
.intent-config-section,
.intent-guides-section,
.intent-faq-section {
    display: grid;
    gap: 18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.intent-section-head {
    display: grid;
    gap: 5px;
}
.intent-section-head .eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.intent-section-head h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.35rem, 2.4vw, 1.8rem);
    letter-spacing: -0.02em;
}
.intent-section-head p {
    max-width: 64ch;
    margin: 0;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.6;
}
.intent-config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 12px;
}
.intent-config-card {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 16px 18px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.intent-config-card span {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.intent-config-card code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.86rem;
    line-height: 1.5;
    word-break: break-word;
    text-shadow: var(--accent-text-glow);
}
.intent-grid-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 0;
    background: transparent;
    border: 0;
    box-shadow: none;
}
.intent-info-panel {
    display: grid;
    gap: 16px;
    padding: clamp(22px, 3.8vw, 36px);
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-shell-bg);
    box-shadow: var(--sk-raised-crisp-shadow);
}
.intent-card-list {
    display: grid;
    gap: 10px;
}
.intent-card-list article {
    display: grid;
    gap: 5px;
    padding: 14px 16px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.intent-card-list h3 {
    margin: 0;
    color: var(--text);
    font-family: var(--font-serif);
    font-size: 1.05rem;
    letter-spacing: -0.01em;
}
.intent-card-list p {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.58;
}
.intent-guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 12px;
}
.intent-guide-card {
    display: grid;
    gap: 7px;
    min-height: 176px;
    padding: 17px 18px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--text);
    text-decoration: none;
    transition: border-color 160ms var(--ease-out-smooth), transform 160ms var(--ease-out-smooth);
}
.intent-guide-card:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.42);
    transform: translateY(-2px);
}
.intent-guide-card span,
.intent-guide-card em {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-style: normal;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-shadow: var(--accent-text-glow);
}
.intent-guide-card strong {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    letter-spacing: -0.01em;
}
.intent-guide-card p {
    margin: 0;
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.55;
}
.intent-guide-card em {
    align-self: end;
}
.intent-faq-list {
    display: grid;
    gap: 10px;
}
.intent-faq-list details {
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.intent-faq-list summary {
    cursor: pointer;
    padding: 15px 17px;
    color: var(--text);
    font-family: var(--font-serif);
    font-size: 1.04rem;
}
.intent-faq-list p {
    margin: 0;
    padding: 0 17px 16px;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.58;
}
@media (max-width: 780px) {
    .intent-grid-section {
        grid-template-columns: 1fr;
    }
    .intent-hero h1 {
        letter-spacing: -0.04em;
    }
}
@media (prefers-reduced-motion: reduce) {
    .intent-guide-card,
    .intent-secondary {
        transition: none;
    }
    .intent-guide-card:hover {
        transform: none;
    }
}
</style>
