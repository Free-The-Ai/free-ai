<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { CtaButton } from "@/shared/ui";
import { highlightedCode } from "@/shared/config/highlighted.generated";
import { CATEGORY_LABELS, SETUP_GUIDES, type HighlightLang, type SetupGuide } from "@/entities/setup-guide";
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd, buildSoftwareJsonLd, buildWebApiJsonLd, buildWebsiteJsonLd } from "@/shared/lib/jsonLd";

const route = useRoute();
const router = useRouter();

const guide = computed(() => SETUP_GUIDES.find((item) => item.slug === route.params.slug));

if (!guide.value) router.replace("/404");

interface PreparedStep {
    title: string;
    body: string;
    code?: { lang: HighlightLang; value: string };
    codeHtml?: string;
}

function prepareSteps(current: SetupGuide | undefined): PreparedStep[] {
    if (!current) return [];
    const html = highlightedCode.setup[current.slug as keyof typeof highlightedCode.setup] ?? [];
    return current.steps.map((step, index) => ({
        ...step,
        codeHtml: step.code ? (html[index] ?? undefined) : undefined,
    }));
}

const preparedSteps = ref<PreparedStep[]>(prepareSteps(guide.value));

watch(
    () => route.params.slug,
    () => {
        if (!guide.value) {
            router.replace("/404");
            return;
        }
        preparedSteps.value = prepareSteps(guide.value);
    },
);

const compatibilityChips = computed(() => {
    const current = guide.value;
    if (!current) return [];
    return [
        { label: "Chat completions", on: !!current.compatibility.chatCompletions },
        { label: "Messages", on: !!current.compatibility.messages },
        { label: "Responses", on: !!current.compatibility.responses },
        { label: "Streaming", on: !!current.compatibility.streaming },
        { label: "Tool calling", on: !!current.compatibility.toolCalling },
        { label: "Images", on: !!current.compatibility.images },
    ].filter((chip) => chip.on);
});

const pageTitle = computed(() => (guide.value ? `Connect ${guide.value.name} to FreeTheAi - Free OpenAI-Compatible API Setup` : "Setup - FreeTheAi"));
const pageDescription = computed(() =>
    guide.value ? `${guide.value.tagline} Step-by-step setup guide for ${guide.value.name} with FreeTheAi - free OpenAI-compatible API at ${guide.value.baseUrl}. ${guide.value.summary}`.slice(0, 300) : "",
);
const pageKeywords = computed(() => {
    const current = guide.value;
    if (!current) return "";
    return [
        current.name.toLowerCase(),
        `${current.name.toLowerCase()} freetheai`,
        `${current.name.toLowerCase()} setup`,
        `${current.name.toLowerCase()} api`,
        `${current.name.toLowerCase()} openai compatible`,
        "free openai compatible api",
        "freetheai setup",
        ...current.keywords,
    ].join(", ");
});

useSeo({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    path: () => `/setup/${route.params.slug}`,
    jsonLd: computed(() => {
        const current = guide.value;
        if (!current) return [];
        const howToJsonLd = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `Connect ${current.name} to FreeTheAi`,
            description: current.summary,
            totalTime: `PT${Math.max(2, current.steps.length)}M`,
            supply: [
                { "@type": "HowToSupply", name: "FreeTheAi API key from Discord /signup" },
                { "@type": "HowToSupply", name: `${current.name} client` },
            ],
            tool: [{ "@type": "HowToTool", name: "FreeTheAi OpenAI-compatible API" }],
            step: current.steps.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                name: step.title,
                text: step.body,
                url: `https://freetheai.xyz/setup/${current.slug}#step-${index + 1}`,
            })),
        };
        return [
            buildWebsiteJsonLd(),
            buildOrganizationJsonLd(),
            buildSoftwareJsonLd(),
            buildWebApiJsonLd(),
            howToJsonLd,
            buildBreadcrumbJsonLd([
                { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
                { name: "Setup", url: "https://freetheai.xyz/setup" },
                { name: current.name, url: `https://freetheai.xyz/setup/${current.slug}` },
            ]),
        ];
    }),
});

const progressFill = ref<HTMLElement | null>(null);

function updateScrollProgress(): void {
    const fill = progressFill.value;
    if (!fill) return;
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? Math.round((scrollTop / height) * 100) : 0;
    fill.style.width = `${pct}%`;
}

onMounted(() => {
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });
    updateScrollProgress();
});
onBeforeUnmount(() => {
    window.removeEventListener("scroll", updateScrollProgress);
    window.removeEventListener("resize", updateScrollProgress);
});

function copyBaseUrl(event: MouseEvent): void {
    if (!guide.value) return;
    navigator.clipboard.writeText(guide.value.baseUrl).catch((error) => {
        console.error("Failed to copy base URL", error);
    });
    const icon = (event.currentTarget as HTMLElement).querySelector(".material-symbols-outlined");
    if (icon) {
        icon.textContent = "check";
        setTimeout(() => {
            icon.textContent = "content_copy";
        }, 2000);
    }
}
</script>

<template>
    <main v-if="guide" class="setup-detail-main">
        <div class="setup-scroll-progress" aria-hidden="true">
            <span id="setup-progress-fill" ref="progressFill"></span>
        </div>
        <nav class="setup-detail-trail" aria-label="Breadcrumb">
            <router-link to="/setup">All setup guides</router-link>
            <span aria-hidden="true">&rarr;</span>
            <span>{{ CATEGORY_LABELS[guide.category] }}</span>
            <span aria-hidden="true">&rarr;</span>
            <strong>{{ guide.name }}</strong>
        </nav>

        <section class="setup-detail-hero shell">
            <span class="eyebrow">{{ CATEGORY_LABELS[guide.category] }}</span>
            <h1>{{ guide.name }}</h1>
            <p class="setup-detail-tagline">{{ guide.tagline }}</p>
            <p class="setup-detail-summary">{{ guide.summary }}</p>

            <div class="setup-detail-meta">
                <div class="setup-meta-copyable">
                    <span>Base URL</span>
                    <code>{{ guide.baseUrl }}</code>
                    <button class="copy-btn" type="button" title="Copy base URL" aria-label="Copy base URL" @click="copyBaseUrl">
                        <span class="material-symbols-outlined">content_copy</span>
                    </button>
                </div>
                <div v-if="guide.apiPath">
                    <span>API path</span>
                    <code>{{ guide.apiPath }}</code>
                </div>
                <div v-if="guide.recommendedModels.length > 0">
                    <span>Recommended models</span>
                    <code>{{ guide.recommendedModels[0] }}</code>
                </div>
            </div>

            <div v-if="compatibilityChips.length > 0" class="setup-detail-chips">
                <span v-for="chip in compatibilityChips" :key="chip.label" class="setup-detail-chip" :title="chip.label">
                    <span class="material-symbols-outlined" aria-hidden="true">check</span>
                    {{ chip.label }}
                </span>
            </div>

            <div class="setup-detail-cta">
                <CtaButton :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">Get a free key</CtaButton>
                <a v-if="guide.docsUrl" class="setup-secondary" :href="guide.docsUrl" target="_blank" rel="noreferrer">Official docs</a>
                <a v-if="guide.repository" class="setup-secondary" :href="guide.repository" target="_blank" rel="noreferrer">GitHub repo</a>
                <a v-if="guide.homepage && !guide.docsUrl" class="setup-secondary" :href="guide.homepage" target="_blank" rel="noreferrer">Visit {{ guide.name }}</a>
            </div>
        </section>

        <section class="section shell setup-detail-steps">
            <header class="setup-detail-step-head">
                <span class="eyebrow">Step by step</span>
                <h2>Connect {{ guide.name }} to FreeTheAi.</h2>
                <div class="setup-progress" aria-label="Setup progress">
                    <div class="setup-progress-track">
                        <div class="setup-progress-fill" style="width: 100%"></div>
                    </div>
                    <span class="setup-progress-text">{{ guide.steps.length }} steps</span>
                </div>
            </header>
            <ol class="setup-detail-list">
                <li v-for="(prepared, index) in preparedSteps" :key="index" :id="`step-${index + 1}`">
                    <div class="setup-detail-step">
                        <span class="setup-detail-step-num">{{ index + 1 }}</span>
                        <div class="setup-detail-step-body">
                            <h3>{{ prepared.title }}</h3>
                            <p>{{ prepared.body }}</p>
                            <div v-if="prepared.code && prepared.codeHtml" class="setup-detail-snippet docs-code-group">
                                <header class="docs-code-bar">
                                    <span class="docs-code-lang">{{ prepared.code.lang }}</span>
                                    <button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard">
                                        <span class="material-symbols-outlined">content_copy</span>
                                    </button>
                                </header>
                                <pre v-html="prepared.codeHtml" />
                            </div>
                        </div>
                    </div>
                </li>
            </ol>
        </section>

        <section v-if="guide.recommendedModels.length > 0" class="section shell setup-detail-models">
            <header class="section-head">
                <span class="eyebrow">Recommended aliases</span>
                <h2>Models that pair well with {{ guide.name }}.</h2>
            </header>
            <ul class="setup-detail-model-list">
                <li v-for="model in guide.recommendedModels" :key="model"><code>{{ model }}</code></li>
            </ul>
            <p class="setup-detail-model-foot">
                See the full live catalog at <router-link to="/models">/models</router-link>. Aliases are stable; pricing on the
                free tier stays $0.
            </p>
        </section>

        <section v-if="guide.gotchas && guide.gotchas.length > 0" class="section shell setup-detail-gotchas">
            <header class="section-head">
                <span class="eyebrow">Heads up</span>
                <h2>Common gotchas.</h2>
            </header>
            <ul>
                <li v-for="gotcha in guide.gotchas" :key="gotcha">{{ gotcha }}</li>
            </ul>
        </section>

        <section class="section shell setup-detail-foot">
            <header class="section-head">
                <span class="eyebrow">Where to next</span>
                <h2>Keep building.</h2>
            </header>
            <div class="setup-foot-links">
                <router-link class="setup-secondary" to="/setup">All setup guides</router-link>
                <router-link class="setup-secondary" to="/quickstart">Quickstart</router-link>
                <router-link class="setup-secondary" to="/docs#compatibility">Cross-compatibility docs</router-link>
                <router-link class="setup-secondary" to="/models">Model catalog</router-link>
                <a class="setup-secondary" :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">Ask in Discord</a>
            </div>
        </section>
    </main>
</template>

<style scoped>
.setup-detail-main {
    gap: 24px;
    padding: 22px 0 64px;
}
.setup-detail-trail {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    max-width: var(--shell-max-width, 1200px);
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 32px);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.78rem;
}
.setup-detail-trail a {
    color: var(--accent-text);
    text-decoration: none;
    text-shadow: var(--accent-text-glow);
}
.setup-detail-trail a:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
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
.setup-detail-trail strong {
    color: var(--text);
    font-weight: 600;
}
.setup-detail-hero {
    display: grid;
    gap: 14px;
    padding: clamp(28px, 4.6vw, 52px);
}
.setup-detail-hero h1 {
    margin: 0;
    font-size: clamp(2.4rem, 5vw, 3.5rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
}
.setup-detail-tagline {
    margin: 0;
    max-width: 64ch;
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.92rem;
    line-height: 1.55;
}
.setup-detail-summary {
    margin: 0;
    max-width: 64ch;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1.55;
}
.setup-detail-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.setup-detail-meta div {
    display: grid;
    gap: 4px;
    min-width: 0;
}
.setup-detail-meta span {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.66rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.setup-detail-meta code {
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    word-break: break-all;
}
.setup-detail-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}
.setup-detail-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border: 1px solid oklch(0.659 0.192 40.1 / 0.32);
    border-radius: var(--radius-sm);
    background: oklch(0.659 0.192 40.1 / 0.08);
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.74rem;
    text-shadow: var(--accent-text-glow);
}
.setup-detail-chip .material-symbols-outlined {
    font-size: 14px;
}
.setup-detail-cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
}
.setup-detail-cta .cta-arrow {
    opacity: 0.65;
    font-size: 0.9rem;
}
.setup-detail-steps {
    display: grid;
    gap: 18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-detail-step-head {
    display: grid;
    gap: 4px;
}
.setup-detail-step-head .eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.setup-detail-step-head h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.5rem;
    letter-spacing: -0.02em;
}
.setup-detail-list {
    display: grid;
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: setup-step;
}
.setup-detail-list > li {
    scroll-margin-top: 80px;
}
.setup-detail-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.setup-detail-step-num {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-full);
    background: var(--sk-shell-bg);
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    text-shadow: var(--accent-text-glow);
}
.setup-detail-step-body {
    flex: 1 1 auto;
    min-width: 0;
    display: grid;
    gap: 8px;
}
.setup-detail-step-body h3 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.15rem;
    letter-spacing: -0.01em;
}
.setup-detail-step-body p {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.55;
}
.setup-detail-step-body code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85em;
}
.setup-detail-snippet {
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    overflow: hidden;
}
.setup-detail-snippet header {
    padding: 6px 12px;
    border-bottom: 1px solid var(--sk-border);
    background: var(--sk-shell-bg);
}
.setup-detail-snippet header strong {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.setup-detail-snippet pre {
    margin: 0;
    padding: 14px 16px;
    overflow-x: auto;
    font-size: 0.82rem;
    line-height: 1.55;
}
.setup-detail-models {
    display: grid;
    gap: 12px;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-detail-models h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.4rem;
    letter-spacing: -0.02em;
}
.setup-detail-model-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
}
.setup-detail-model-list code {
    display: inline-block;
    padding: 5px 9px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-sm);
    background: var(--sk-inset-bg);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 0.78rem;
}
.setup-detail-model-foot {
    margin: 0;
    color: var(--muted);
    font-size: 0.86rem;
}
.setup-detail-model-foot a {
    color: var(--accent-text);
    text-decoration: underline;
    text-underline-offset: 2px;
}
.setup-detail-gotchas {
    display: grid;
    gap: 12px;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-detail-gotchas h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.35rem;
    letter-spacing: -0.02em;
}
.setup-detail-gotchas ul {
    margin: 0;
    padding: 0 0 0 20px;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.6;
}
.setup-detail-gotchas li {
    margin-bottom: 6px;
}
.setup-detail-foot {
    display: grid;
    gap: 14px;
    padding: clamp(22px, 3.8vw, 36px);
}
.setup-detail-foot h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.35rem;
    letter-spacing: -0.02em;
}
@media (prefers-reduced-motion: reduce) {
    .setup-secondary {
        transition: none;
    }
}
</style>
