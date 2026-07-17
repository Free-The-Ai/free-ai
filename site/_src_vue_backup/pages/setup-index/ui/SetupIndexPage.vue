<script setup lang="ts">
import { computed, ref } from "vue";
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { CtaButton, DitherGradient } from "@/shared/ui";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, CATEGORY_ORDER, SETUP_GUIDES, setupGuidesByCategory } from "@/entities/setup-guide";
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildSoftwareJsonLd, buildWebApiJsonLd, buildWebsiteJsonLd } from "@/shared/lib/jsonLd";

const guidesByCategory = setupGuidesByCategory();
const totalGuides = SETUP_GUIDES.length;

const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FreeTheAi setup guides",
    description: "Step-by-step guides for connecting popular AI clients to the FreeTheAi OpenAI-compatible API.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: totalGuides,
    itemListElement: SETUP_GUIDES.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://freetheai.xyz/setup/${guide.slug}`,
        name: `${guide.name} setup`,
    })),
};

const pageDescription = `Setup guides for ${totalGuides}+ AI clients on the free FreeTheAi OpenAI-compatible API. OpenCode, Kilo Code, Zed, SillyTavern, Janitor AI, Chub AI, Cline, Roo Code, Continue.dev, Aider, Claude Code, LibreChat, Open WebUI and more.`;

const setupKeywords = [
    "freetheai setup",
    "free openai compatible api",
    "free claude api",
    "free anthropic api",
    "openai sdk free api",
    "free ai api setup",
    ...SETUP_GUIDES.flatMap((guide) => [guide.name.toLowerCase(), `${guide.name.toLowerCase()} freetheai`]),
].join(", ");

useSeo({
    title: "FreeTheAi Setup Guides - Connect Any OpenAI-Compatible Client",
    description: pageDescription,
    path: "/setup",
    keywords: setupKeywords,
    jsonLd: [
        buildWebsiteJsonLd(),
        buildOrganizationJsonLd(),
        buildSoftwareJsonLd(),
        buildWebApiJsonLd(),
        itemListJsonLd,
        buildBreadcrumbJsonLd([
            { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
            { name: "Setup", url: "https://freetheai.xyz/setup" },
        ]),
    ],
});

const filterQuery = ref("");
const normalizedQuery = computed(() => filterQuery.value.trim().toLowerCase());

function matchesGuide(guide: (typeof SETUP_GUIDES)[number]): boolean {
    if (!normalizedQuery.value) return true;
    const haystack = `${guide.name} ${guide.tagline} ${guide.summary} ${guide.keywords.join(" ")}`.toLowerCase();
    return haystack.includes(normalizedQuery.value);
}

function categoryHasVisibleGuides(category: (typeof CATEGORY_ORDER)[number]): boolean {
    return (guidesByCategory[category] ?? []).some(matchesGuide);
}

let firstGuideSlug: string | null = null;
for (const category of CATEGORY_ORDER) {
    const guides = guidesByCategory[category];
    if (guides && guides.length > 0) {
        firstGuideSlug = guides[0].slug;
        break;
    }
}
</script>

<template>
    <main class="setup-main">
        <section class="setup-hero shell">
            <DitherGradient class="setup-glow" from="orange" direction="up" :opacity="0.28" />
            <span class="eyebrow">Setup guides</span>
            <h1>Plug FreeTheAi into your favorite client.</h1>
            <p class="setup-lede">
                One key, one base URL, every model. Pick your client below and follow the exact steps. All guides use
                <code>https://api.freetheai.xyz/v1</code>.
            </p>
            <div class="setup-cta-row">
                <CtaButton :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">Get a free key</CtaButton>
                <router-link class="setup-secondary" to="/quickstart">60-second quickstart</router-link>
                <router-link class="setup-secondary" to="/models">Browse models</router-link>
            </div>
        </section>

        <div class="section shell setup-search-shell">
            <div class="search-field">
                <span class="material-symbols-outlined" aria-hidden="true">search</span>
                <input v-model="filterQuery" type="search" placeholder="Filter guides by client, model, or keyword..." />
            </div>
        </div>

        <section class="section shell setup-path-section">
            <header class="setup-section-head">
                <span class="eyebrow">Popular paths</span>
                <h2>Start from what you are trying to connect.</h2>
                <p>These pages group the setup guides by client type, so you can jump straight to the right base URL, route, and model setup.</p>
            </header>
            <div class="setup-path-grid">
                <router-link class="setup-path-card" to="/roleplay-api">
                    <strong>Roleplay API</strong>
                    <span>SillyTavern, Janitor AI, Chub AI, and RisuAI.</span>
                </router-link>
                <router-link class="setup-path-card" to="/coding-agent-api">
                    <strong>Coding agent API</strong>
                    <span>OpenCode, Cline, Roo Code, Kilo Code, Zed, and Aider.</span>
                </router-link>
                <router-link class="setup-path-card" to="/openai-compatible-api">
                    <strong>OpenAI-compatible API</strong>
                    <span>SDKs, custom clients, bots, and generic app integrations.</span>
                </router-link>
            </div>
        </section>

        <template v-for="category in CATEGORY_ORDER" :key="category">
            <section v-if="guidesByCategory[category]?.length && categoryHasVisibleGuides(category)" class="section shell setup-section" :id="category">
                <header class="setup-section-head">
                    <span class="eyebrow">{{ CATEGORY_LABELS[category] }}</span>
                    <h2>{{ guidesByCategory[category].length }} {{ guidesByCategory[category].length === 1 ? "guide" : "guides" }}</h2>
                    <p>{{ CATEGORY_DESCRIPTIONS[category] }}</p>
                </header>
                <div class="setup-grid">
                    <router-link
                        v-for="guide in guidesByCategory[category].filter(matchesGuide)"
                        :key="guide.slug"
                        class="setup-card"
                        :to="`/setup/${guide.slug}`"
                        style="position: relative"
                    >
                        <span v-if="guide.slug === firstGuideSlug" class="popular-badge">Popular</span>
                        <header class="setup-card-head">
                            <h3>{{ guide.name }}</h3>
                            <span class="setup-card-arrow" aria-hidden="true">&rarr;</span>
                        </header>
                        <p class="setup-card-tagline">{{ guide.tagline }}</p>
                        <p class="setup-card-summary">{{ guide.summary }}</p>
                        <div class="setup-card-foot">
                            <span class="setup-card-go">View setup &rarr;</span>
                        </div>
                    </router-link>
                </div>
            </section>
        </template>

        <section class="section shell setup-foot-section">
            <header class="section-head">
                <span class="eyebrow">Don't see your client?</span>
                <h2>Most OpenAI-compatible clients work out of the box.</h2>
            </header>
            <p class="setup-foot-lede">
                FreeTheAi follows the OpenAI Chat Completions, Anthropic Messages, and OpenAI Responses formats. Anything that
                lets you set a custom base URL and API key works. Use <code>https://api.freetheai.xyz/v1</code> as the base URL
                and pick any alias from the model catalog.
            </p>
            <div class="setup-foot-links">
                <CtaButton to="/quickstart">Read the quickstart</CtaButton>
                <router-link class="setup-secondary" to="/docs#compatibility">Compatibility docs</router-link>
                <a class="setup-secondary" :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">Ask in Discord</a>
            </div>
        </section>
    </main>
</template>

<style scoped>
.setup-main {
    gap: 28px;
    padding: 22px 0 64px;
}
.setup-hero {
    display: grid;
    gap: 14px;
    padding: clamp(28px, 4.6vw, 52px);
}
.setup-hero h1 {
    margin: 0;
    font-size: clamp(2.35rem, 4.7vw, 3.6rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
}
.setup-lede {
    margin: 0;
    max-width: 60ch;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1.55;
}
.setup-lede code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85em;
}
.setup-cta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin-top: 6px;
}
.setup-cta-row .cta-arrow {
    opacity: 0.65;
    font-size: 0.9rem;
}
.setup-secondary {
    color: var(--muted);
    font-size: 0.92rem;
    text-decoration: none;
    border-bottom: 1px solid var(--sk-border);
    padding-bottom: 2px;
    transition: color 150ms var(--ease-out-smooth), border-color 150ms var(--ease-out-smooth);
}
.setup-secondary:hover {
    color: var(--accent-text);
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}
.setup-section {
    display: grid;
    gap: 18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-path-section {
    display: grid;
    grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.28fr);
    gap: 22px;
    align-items: start;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-path-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}
.setup-path-card {
    display: grid;
    gap: 8px;
    min-height: 132px;
    padding: 18px 20px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--text);
    text-decoration: none;
    transition: border-color 160ms var(--ease-out-smooth), transform 160ms var(--ease-out-smooth);
}
.setup-path-card:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.42);
    transform: translateY(-2px);
}
.setup-path-card strong {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    letter-spacing: -0.01em;
}
.setup-path-card span {
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.55;
}
@media (max-width: 920px) {
    .setup-path-section,
    .setup-path-grid {
        grid-template-columns: 1fr;
    }
    .setup-path-card {
        min-height: 0;
    }
}
.setup-section-head {
    display: grid;
    gap: 4px;
}
.setup-section-head .eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.setup-section-head h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.5rem;
    letter-spacing: -0.02em;
}
.setup-section-head p {
    margin: 0;
    max-width: 60ch;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.55;
}
.setup-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 14px;
}
.setup-card {
    position: relative;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 8px;
    padding: 18px 20px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    text-decoration: none;
    color: var(--text);
    transition: border-color 200ms var(--ease-out-smooth), transform 200ms var(--ease-out-smooth), box-shadow 200ms var(--ease-out-smooth);
    min-height: 214px;
}
.setup-card:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.42);
    transform: translateY(-2px);
    box-shadow: var(--sk-inset-shadow), 0 0 0 1px oklch(0.659 0.192 40.1 / 0.18);
}
.setup-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}
.setup-card-head h3 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.2rem;
    letter-spacing: -0.01em;
}
.setup-card-arrow {
    font-size: 1rem;
    color: var(--accent-text);
    opacity: 0.65;
    transition: opacity 150ms var(--ease-out-smooth), transform 200ms var(--ease-out-smooth);
}
.setup-card:hover .setup-card-arrow {
    opacity: 1;
    transform: translateX(2px);
}
.setup-card-tagline {
    margin: 0;
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    line-height: 1.5;
}
.setup-card-summary {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.55;
}
.setup-card-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
    padding-top: 10px;
    border-top: 1px solid var(--sk-border);
}
.setup-card-go {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-shadow: var(--accent-text-glow);
}
.setup-foot-section {
    display: grid;
    gap: 14px;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-foot-section .section-head {
    display: grid;
    gap: 4px;
}
.setup-foot-section .eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.setup-foot-section h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.4rem;
    letter-spacing: -0.02em;
}
.setup-foot-lede {
    margin: 0;
    max-width: 64ch;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.55;
}
.setup-foot-lede code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85em;
}
.setup-foot-links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
}
.setup-foot-links .cta-arrow {
    opacity: 0.65;
    font-size: 0.9rem;
}
@media (prefers-reduced-motion: reduce) {
    .setup-card,
    .setup-card:hover,
    .setup-card-arrow,
    .setup-card:hover .setup-card-arrow,
    .setup-path-card,
    .setup-path-card:hover,
    .setup-secondary {
        transition: none;
        transform: none;
    }
}
.setup-hero {
    position: relative;
    overflow: hidden;
}
.setup-glow {
    z-index: 0;
}
.setup-hero > *:not(.setup-glow) {
    position: relative;
    z-index: 1;
}
</style>
