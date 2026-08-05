<script lang="ts">
    import {
        siAnthropic,
        siGooglegemini,
        siDeepseek,
        siMeta,
        siMistralai,
        siQwen,
        siX,
        siNvidia,
        siMinimax,
        siKimi,
        siOllama,
        siHuggingface,
    } from "simple-icons";
    import { buildSeo } from "@/shared/lib/seo";
    import { siteConfig } from "@/shared/config/site";
    import { SeoHead } from "@/shared/ui";
    import { LiveStats } from "@/features/live-stats";
    import {
        buildWebsiteJsonLd,
        buildOrganizationJsonLd,
        buildSoftwareJsonLd,
        buildWebApiJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildSignupHowToJsonLd,
        buildBreadcrumbJsonLd,
    } from "@/shared/lib/jsonLd";

    const pageTitle = "FreeTheAi (Free The AI) - Free OpenAI-Compatible AI API";
    const pageDescription =
        "FreeTheAi, also searched as Free The AI, is a free OpenAI-compatible AI API with 80+ active models, Discord key signup, streaming chat, tool calling, and Anthropic-style messages. No credit card or billing.";

    const seo = buildSeo({
        title: pageTitle,
        description: pageDescription,
        path: "/home",
        jsonLd: [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            buildMachineReadableResourcesJsonLd(),
            buildSignupHowToJsonLd(),
            buildBreadcrumbJsonLd([{ name: "FreeTheAi", url: "https://freetheai.xyz/home" }]),
        ],
    });

    const providerIcons = [
        siAnthropic,
        siGooglegemini,
        siDeepseek,
        siMeta,
        siMistralai,
        siQwen,
        siX,
        siNvidia,
        siMinimax,
        siKimi,
        siOllama,
        siHuggingface,
    ];

    const howItWorks: [string, string, string][] = [
        ["Deposit crypto", "Fund your FreeTheAI wallet with crypto. One balance pays for every model on the marketplace.", "account_balance_wallet"],
        ["Call any model", "OpenAI, Anthropic, Google, and more through one API. Access comes from independent sellers, not the original companies.", "code"],
        ["Choose the right route", "Select cheapest or fastest routing. Each request uses one reviewed route with server-owned pricing and access checks.", "auto_awesome"],
    ];

    const whyCards: [string, string, string][] = [
        ["One wallet, fair billing", "Sellers list per-call or per-token pricing. Every transaction is crypto, settled from your balance.", "account_balance_wallet"],
        ["Priced by the market", "Approved independent providers offer reviewed capacity at different prices and service levels. FreeTheAI owns the catalog, routing, billing, and support.", "monitoring"],
        ["Free routes when available", "Reviewed donated and seller capacity can appear as FreeTheAI free routes. Daily check-in and limits remain server-owned.", "lock"],
        ["Server-owned route selection", "Choose the cheapest or fastest reviewed route for each request. Authorization, pricing, and billing are checked before dispatch.", "speed"],
        ["Three formats, one API", "OpenAI Chat Completions, OpenAI Responses, and Anthropic Messages use one account and one server-controlled marketplace.", "code"],
        ["Sellers earn in crypto", "Offer approved independent capacity, set per-call or per-token pricing, and receive manual crypto payouts after completed usage.", "smart_toy"],
    ];

</script>

<svelte:head>
    <link rel="preload" as="image" href="/hero-dune.webp" />
</svelte:head>

<SeoHead {seo} />

<main>
    <section class="hp-hero">
        <div class="hp-hero-art" aria-hidden="true">
            <img src="/hero-dune.webp" alt="" width="1080" height="878" />
        </div>
        <div class="hp-hero-content">
            <h1>The models you want. The price <span class="hp-underline">you&nbsp;choose.</span></h1>
            <p class="hp-hero-sub">
                Deposit once with crypto and call models from approved independent capacity. Server-owned routing selects the
                cheapest or fastest reviewed route for each request.
            </p>
            <div class="hp-cta-row">
                <a class="primary-button hp-btn" href={siteConfig.socials.discord} target="_blank" rel="noreferrer" data-sound="interaction.confirm">
                    <span>Start routing</span>
                </a>
                <a class="hp-btn-ghost" href="/models" data-sound="interaction.tap">Browse models</a>
            </div>
        </div>
    </section>

    <LiveStats />

    <section class="hp-section" aria-labelledby="hp-how-title">
        <div class="hp-split">
            <div class="hp-split-head">
                <h2 id="hp-how-title">How it works</h2>
                <p>One wallet, one API, a marketplace full of sellers.</p>
            </div>
            <div class="hp-card-grid hp-card-grid-3">
                {#each howItWorks as [title, text, icon] (title)}
                    <article class="hp-card">
                        <span class="hp-card-icon material-symbols-outlined" aria-hidden="true">{icon}</span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <section class="hp-section hp-providers" aria-labelledby="hp-providers-title">
        <h2 id="hp-providers-title">The providers you already&nbsp;know</h2>
        <div class="hp-provider-row">
            {#each providerIcons as icon (icon.slug)}
                <span class="hp-provider-icon" title={icon.title}>
                    <svg viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={icon.title}><path d={icon.path} /></svg>
                </span>
            {/each}
        </div>
    </section>

    <section class="hp-section" aria-labelledby="hp-why-title">
        <div class="hp-split">
            <div class="hp-split-head">
                <h2 id="hp-why-title">Why FreeTheAI</h2>
                <p>Many sellers, one marketplace. More choice on price, speed, and quality.</p>
            </div>
            <div class="hp-card-grid hp-card-grid-3">
                {#each whyCards as [title, text, icon] (title)}
                    <article class="hp-card">
                        <span class="hp-card-icon material-symbols-outlined" aria-hidden="true">{icon}</span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <section class="hp-cta hp-crop" aria-labelledby="hp-cta-title">
        <div class="hp-cta-copy">
            <h2 id="hp-cta-title">Stop paying list price for&nbsp;AI</h2>
            <p>Create an account, deposit with crypto, and call top models at marketplace prices in minutes.</p>
        </div>
        <div class="hp-cta-row">
            <a class="primary-button hp-btn" href={siteConfig.socials.discord} target="_blank" rel="noreferrer" data-sound="interaction.confirm">
                <span>Create account</span>
            </a>
            <a class="hp-btn-ghost" href="/models" data-sound="interaction.tap">Browse models</a>
        </div>
    </section>

    <section class="hp-start hp-crop" aria-labelledby="hp-start-title">
        <h2 id="hp-start-title">Get started<br />with FreeTheAI</h2>
        <a class="primary-button hp-btn" href="/quickstart" data-sound="interaction.confirm">
            <span>&rarr; Quickstart</span>
        </a>
    </section>
</main>

<style>
    main {
        gap: clamp(56px, 8vw, 96px);
    }

    /* ── Hero ── */
    .hp-hero {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        min-height: clamp(440px, 52vw, 540px);
        display: flex;
        align-items: center;
        background: var(--bg);
    }
    .hp-hero-art {
        position: absolute;
        inset: 0;
    }
    .hp-hero-art img {
        position: absolute;
        top: 0;
        left: 10%;
        width: 124%;
        max-width: none;
        height: 100%;
        object-fit: cover;
        object-position: center 14%;
    }
    /* Blend the artwork into the card so the copy keeps AA contrast. */
    .hp-hero-art::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
            linear-gradient(90deg, oklch(0.13 0 0 / 0.96) 0%, oklch(0.13 0 0 / 0.82) 32%, oklch(0.13 0 0 / 0.25) 62%, transparent 82%),
            linear-gradient(0deg, oklch(0.13 0 0 / 0.55) 0%, transparent 32%);
    }
    .hp-hero-content {
        position: relative;
        z-index: 1;
        max-width: 660px;
        padding: clamp(24px, 4.5vw, 56px);
    }
    .hp-hero-content h1 {
        font-size: clamp(2.3rem, 4.6vw, 3.9rem);
        font-weight: 600;
        line-height: 1.02;
        letter-spacing: -0.04em;
    }
    .hp-underline {
        text-decoration: underline;
        text-decoration-thickness: 0.055em;
        text-underline-offset: 0.16em;
    }
    .hp-hero-sub {
        margin: 20px 0 0;
        max-width: 46ch;
        font-family: var(--font-mono);
        font-size: 0.8rem;
        line-height: 1.7;
        color: var(--muted);
    }
    .hp-cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 28px;
    }
    .hp-btn,
    .hp-btn-ghost {
        font-family: var(--font-mono);
        font-size: 0.78rem;
        min-height: var(--control-height);
    }
    .hp-btn-ghost {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--control-padding);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius);
        background: oklch(1 0 0 / 0.04);
        color: var(--text);
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition:
            background 200ms var(--ease-out-smooth),
            border-color 200ms var(--ease-out-smooth),
            transform var(--press-dur) var(--ease-out-smooth);
    }
    .hp-btn-ghost:hover {
        background: oklch(1 0 0 / 0.09);
    }
    .hp-btn-ghost:active {
        transform: scale(var(--press-scale));
    }

    /* ── Sections ── */
    .hp-section {
        display: grid;
        gap: clamp(28px, 4vw, 44px);
    }
    .hp-split {
        display: grid;
        grid-template-columns: minmax(220px, 0.8fr) minmax(0, 2fr);
        gap: clamp(24px, 4vw, 48px);
        align-items: start;
    }
    .hp-split-head {
        position: sticky;
        top: 96px;
    }
    .hp-split-head h2,
    .hp-providers h2 {
        font-size: clamp(1.7rem, 3vw, 2.3rem);
        font-weight: 600;
        letter-spacing: -0.03em;
        line-height: 1.1;
    }
    .hp-split-head p {
        margin: 14px 0 0;
        max-width: 30ch;
        font-family: var(--font-mono);
        font-size: 0.74rem;
        line-height: 1.7;
        color: var(--muted);
    }

    /* ── Cards ── */
    .hp-card-grid {
        display: grid;
        gap: 14px;
    }
    .hp-card-grid-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .hp-card {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: oklch(1 0 0 / 0.02);
        padding: 20px;
        display: grid;
        gap: 12px;
        align-content: start;
    }
    .hp-card-icon {
        font-size: 17px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--sk-inset-bg);
        color: var(--muted);
    }
    .hp-card h3 {
        font-size: 0.92rem;
        font-weight: 600;
        letter-spacing: -0.01em;
    }
    .hp-card p {
        margin: 0;
        font-family: var(--font-mono);
        font-size: 0.7rem;
        line-height: 1.65;
        color: var(--muted);
    }

    /* ── Providers ── */
    .hp-providers {
        justify-items: center;
        text-align: center;
    }
    .hp-provider-row {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: clamp(22px, 4vw, 44px);
    }
    .hp-provider-icon {
        display: inline-flex;
        color: var(--dim);
        transition: color 150ms var(--ease-out-smooth);
    }
    .hp-provider-icon:hover {
        color: var(--text);
    }
    .hp-provider-icon svg {
        width: 26px;
        height: 26px;
    }

    /* ── CTA panels with crop marks ── */
    .hp-crop {
        position: relative;
    }
    .hp-crop::before,
    .hp-crop::after {
        content: "";
        position: absolute;
        top: 0;
        width: 14px;
        height: 14px;
        border-top: 1.5px solid var(--border-strong);
        pointer-events: none;
    }
    .hp-crop::before {
        left: 0;
        border-left: 1.5px solid var(--border-strong);
    }
    .hp-crop::after {
        right: 0;
        border-right: 1.5px solid var(--border-strong);
    }
    .hp-cta,
    .hp-start {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: clamp(20px, 3vw, 32px) 0;
    }
    .hp-cta-copy h2 {
        font-size: clamp(1.8rem, 3.4vw, 2.6rem);
        font-weight: 600;
        letter-spacing: -0.03em;
        line-height: 1.08;
    }
    .hp-cta-copy p {
        margin: 14px 0 0;
        max-width: 52ch;
        font-family: var(--font-mono);
        font-size: 0.74rem;
        line-height: 1.7;
        color: var(--muted);
    }
    .hp-cta .hp-cta-row {
        margin-top: 0;
        flex-shrink: 0;
    }
    .hp-start h2 {
        font-size: clamp(2.2rem, 4.6vw, 3.6rem);
        font-weight: 600;
        letter-spacing: -0.04em;
        line-height: 1.04;
    }

    @media (max-width: 56em) {
        .hp-split {
            grid-template-columns: 1fr;
        }
        .hp-split-head {
            position: static;
        }
        .hp-card-grid-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .hp-cta,
        .hp-start {
            flex-direction: column;
            align-items: flex-start;
        }
    }
    @media (max-width: 34em) {
        .hp-card-grid-3 {
            grid-template-columns: 1fr;
        }
    }
</style>
