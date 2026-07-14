<script setup lang="ts">
import { ref } from "vue";
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { CtaButton } from "@/shared/ui";
import { highlightedCode } from "@/shared/config/highlighted.generated";
import { buildWebsiteJsonLd, buildOrganizationJsonLd, buildSoftwareJsonLd, buildWebApiJsonLd, buildSignupHowToJsonLd, buildBreadcrumbJsonLd } from "@/shared/lib/jsonLd";

const pageDescription =
    "FreeTheAi quickstart: get a free API key from Discord, unlock it for the day with /checkin, then point the OpenAI Python or JavaScript SDK at https://api.freetheai.xyz/v1 and ship your first chat completion in minutes.";

const quickstartHowToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Send your first FreeTheAi chat completion",
    description: "Get a key in Discord, unlock it daily with /checkin, install the OpenAI SDK, point base_url at FreeTheAi, and send a chat completion.",
    totalTime: "PT5M",
    supply: [{ "@type": "HowToSupply", name: "FreeTheAi API key from Discord /signup" }],
    tool: [
        { "@type": "HowToTool", name: "OpenAI Python SDK" },
        { "@type": "HowToTool", name: "OpenAI Node.js SDK" },
    ],
    step: [
        {
            "@type": "HowToStep",
            name: "Get a free key",
            text: "Join discord.gg/secrets, run /signup, and complete the human challenge to receive a FreeTheAi API key.",
            url: "https://freetheai.xyz/quickstart#step-key",
        },
        {
            "@type": "HowToStep",
            name: "Unlock today with /checkin",
            text: "Run /checkin in Discord once per UTC day and solve the lightweight human challenge so the API stops returning daily_checkin_required.",
            url: "https://freetheai.xyz/quickstart#step-checkin",
        },
        {
            "@type": "HowToStep",
            name: "Send your first request",
            text: "Install the OpenAI SDK, point base_url at https://api.freetheai.xyz/v1, and call chat.completions.create.",
            url: "https://freetheai.xyz/quickstart#step-request",
        },
    ],
};

useSeo({
    title: "FreeTheAi Quickstart - Free OpenAI-Compatible API in Minutes",
    description: pageDescription,
    path: "/quickstart",
    jsonLd: [
        buildWebsiteJsonLd(),
        buildOrganizationJsonLd(),
        buildSoftwareJsonLd(),
        buildWebApiJsonLd(),
        buildSignupHowToJsonLd(),
        quickstartHowToJsonLd,
        buildBreadcrumbJsonLd([
            { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
            { name: "Quickstart", url: "https://freetheai.xyz/quickstart" },
        ]),
    ],
});

const highlightedPython = highlightedCode.quickstart.python;
const highlightedJs = highlightedCode.quickstart.javascript;
const highlightedCurl = highlightedCode.quickstart.curl;

const TABS = ["python", "node", "curl"] as const;
type TabKey = (typeof TABS)[number];
const TAB_LABELS: Record<TabKey, string> = { python: "Python", node: "Node.js", curl: "curl" };
const activeTab = ref<TabKey>("python");
const tabRefs: Partial<Record<TabKey, HTMLButtonElement>> = {};

function setTabRef(key: TabKey, el: Element | null): void {
    if (el) tabRefs[key] = el as HTMLButtonElement;
}

function onTabKeydown(event: KeyboardEvent): void {
    const idx = TABS.indexOf(activeTab.value);
    let next = idx;
    if (event.key === "ArrowRight") next = (idx + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (idx - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    activeTab.value = TABS[next];
    tabRefs[TABS[next]]?.focus();
}
</script>

<template>
    <main class="quickstart-main">
        <section class="quickstart-card shell">
            <header class="quickstart-head">
                <span class="eyebrow">Quickstart</span>
                <h1>Free AI API, ready in minutes.</h1>
                <p class="quickstart-lede">
                    Sign up in Discord, unlock your key with <code>/checkin</code>, point the OpenAI SDK at FreeTheAi, send a
                    chat completion.
                </p>
            </header>

            <div class="quickstart-flow">
                <div class="quickstart-step" id="step-key">
                    <span class="quickstart-step-num">1</span>
                    <div class="quickstart-step-body">
                        <strong>Get a free key.</strong>
                        <span>
                            Join <a :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">discord.gg/secrets</a>,
                            run <code>/signup</code>, and complete the modal. Lost it? Use <code>/resetkey</code>.
                        </span>
                    </div>
                </div>
                <div class="quickstart-step" id="step-checkin">
                    <span class="quickstart-step-num">2</span>
                    <div class="quickstart-step-body">
                        <strong>Unlock today.</strong>
                        <span>
                            Run <code>/checkin</code> once per UTC day and solve the human challenge. Until then, the API
                            returns <code>403 daily_checkin_required</code>.
                        </span>
                    </div>
                </div>
                <div class="quickstart-step" id="step-request">
                    <span class="quickstart-step-num">3</span>
                    <div class="quickstart-step-body">
                        <strong>Send a request.</strong>
                        <span>
                            Install the OpenAI SDK, set <code>base_url</code> to <code>https://api.freetheai.xyz/v1</code>, and
                            pick any alias from the model catalog.
                        </span>
                    </div>
                </div>
            </div>

            <div class="quickstart-tabs">
                <div class="quickstart-tab-list" role="tablist" @keydown="onTabKeydown">
                    <button
                        v-for="tab in TABS"
                        :key="tab"
                        :ref="(el) => setTabRef(tab, el as Element | null)"
                        type="button"
                        :class="['quickstart-tab', { 'is-active': activeTab === tab }]"
                        role="tab"
                        :aria-selected="activeTab === tab"
                        :tabindex="activeTab === tab ? 0 : -1"
                        @click="activeTab = tab"
                    >
                        {{ TAB_LABELS[tab] }}
                    </button>
                </div>
                <div v-show="activeTab === 'python'" class="quickstart-tab-panel is-active" role="tabpanel" tabindex="0">
                    <div class="quickstart-snippet">
                        <button class="copy-btn" type="button" aria-label="Copy Python example"><span class="material-symbols-outlined">content_copy</span></button>
                        <pre v-html="highlightedPython" />
                    </div>
                </div>
                <div v-show="activeTab === 'node'" class="quickstart-tab-panel is-active" role="tabpanel" tabindex="0">
                    <div class="quickstart-snippet">
                        <button class="copy-btn" type="button" aria-label="Copy JavaScript example"><span class="material-symbols-outlined">content_copy</span></button>
                        <pre v-html="highlightedJs" />
                    </div>
                </div>
                <div v-show="activeTab === 'curl'" class="quickstart-tab-panel is-active" role="tabpanel" tabindex="0">
                    <div class="quickstart-snippet">
                        <button class="copy-btn" type="button" aria-label="Copy curl example"><span class="material-symbols-outlined">content_copy</span></button>
                        <pre v-html="highlightedCurl" />
                    </div>
                </div>
            </div>

            <div class="quickstart-cta-row">
                <CtaButton :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">Get a free key</CtaButton>
                <router-link class="quickstart-secondary" to="/models">Browse 80+ active models</router-link>
            </div>
        </section>

        <section class="quickstart-next shell">
            <header class="section-head">
                <span class="eyebrow">Next stops</span>
                <h2>Where to go next.</h2>
            </header>
            <div class="quickstart-link-grid">
                <router-link class="quickstart-link" to="/setup">
                    <strong>Setup guides</strong>
                    <span>OpenCode, Cline, Roo Code, Zed, SillyTavern, Janitor AI, Chub, and more.</span>
                </router-link>
                <router-link class="quickstart-link" to="/docs">
                    <strong>Full API docs</strong>
                    <span>Chat completions, Anthropic messages, models, images, errors, rate limits.</span>
                </router-link>
                <router-link class="quickstart-link" to="/models">
                    <strong>Model catalog</strong>
                    <span>Live searchable aliases with provider prefixes and copyable IDs.</span>
                </router-link>
                <router-link class="quickstart-link" to="/pricing">
                    <strong>Pricing</strong>
                    <span>The free tier stays free. Optional paid slots start at $8/month.</span>
                </router-link>
                <router-link class="quickstart-link" to="/status">
                    <strong>Status</strong>
                    <span>Live provider health by alias prefix.</span>
                </router-link>
            </div>
        </section>
    </main>
</template>

<style scoped>
.quickstart-main {
    padding: 22px 0 64px;
}
.quickstart-card {
    display: grid;
    gap: 26px;
    padding: clamp(24px, 4.2vw, 42px);
}
.quickstart-head {
    display: grid;
    gap: 14px;
}
.quickstart-head h1 {
    margin: 0;
    font-size: clamp(2.2rem, 4.6vw, 3.4rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
    text-wrap: balance;
}
.quickstart-lede {
    margin: 0;
    max-width: 56ch;
    color: var(--muted);
    font-size: 1rem;
    line-height: 1.55;
    text-wrap: pretty;
}
.quickstart-cta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}
.quickstart-cta-row .cta-arrow {
    opacity: 0.65;
    font-size: 0.9rem;
}
.quickstart-secondary {
    color: var(--muted);
    font-size: 0.92rem;
    text-decoration: none;
    border-bottom: 1px solid var(--sk-border);
    padding-bottom: 2px;
    transition: color 150ms var(--ease-out-smooth), border-color 150ms var(--ease-out-smooth);
}
.quickstart-secondary:hover {
    color: var(--accent-text);
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}
.quickstart-flow {
    display: grid;
    gap: 18px;
    padding-left: 6px;
}
.quickstart-step {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding-left: 6px;
}
.quickstart-step:not(:last-child)::before {
    content: "";
    position: absolute;
    top: 36px;
    left: 21px;
    width: 1px;
    height: calc(100% + 4px);
    background: var(--sk-border);
}
.quickstart-step .quickstart-step-num {
    position: relative;
    z-index: 1;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius-full);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    text-shadow: var(--accent-text-glow);
}
.quickstart-step-body {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 10px;
    padding-top: 5px;
    color: var(--muted);
    line-height: 1.55;
    text-wrap: pretty;
}
.quickstart-step-body strong {
    color: var(--text);
    font-weight: 600;
}
.quickstart-step-body a {
    color: var(--accent-text);
    text-underline-offset: 2px;
}
.quickstart-step-body code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.85em;
}
.quickstart-tabs {
    display: grid;
    gap: 10px;
}
.quickstart-tab-list {
    display: flex;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--sk-border);
    border-radius: calc(var(--radius) - 4px);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    width: fit-content;
}
.quickstart-tab {
    padding: 8px 14px;
    border: none;
    border-radius: calc(var(--radius) - 8px);
    background: transparent;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    cursor: pointer;
    transition: color 140ms var(--ease-out-smooth), background 140ms var(--ease-out-smooth), transform 140ms var(--ease-out-smooth);
}
.quickstart-tab.is-active {
    background: var(--sk-shell-bg);
    color: var(--accent-text);
    box-shadow: var(--sk-raised-shadow);
}
.quickstart-tab:hover:not(.is-active) {
    color: var(--text);
}
.quickstart-tab:active {
    transform: scale(0.96);
}
.quickstart-tab-panel {
    display: none;
    outline: none;
}
.quickstart-tab-panel.is-active {
    display: block;
}
.quickstart-snippet {
    position: relative;
    border: 1px solid var(--sk-border);
    border-radius: calc(var(--radius) - 4px);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    overflow: hidden;
}
.quickstart-snippet:hover .copy-btn,
.quickstart-snippet .copy-btn:focus-visible {
    opacity: 1;
}
.quickstart-snippet .copy-btn {
    top: 8px;
    right: 8px;
    border-radius: calc(var(--radius-sm) - 2px);
    transition: transform 140ms var(--ease-out-smooth), opacity 140ms var(--ease-out-smooth);
}
.quickstart-snippet .copy-btn:active {
    transform: scale(0.96);
}
.quickstart-snippet :deep(pre) {
    margin: 0;
    padding: 14px 16px;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.55;
}
.quickstart-next {
    display: grid;
    gap: 18px;
    padding: clamp(22px, 3.8vw, 36px);
}
.quickstart-next .section-head {
    display: grid;
    gap: 6px;
}
.quickstart-next h2 {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.5rem;
    letter-spacing: -0.02em;
    text-wrap: balance;
}
.quickstart-next .eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.quickstart-link-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}
.quickstart-link {
    display: grid;
    gap: 6px;
    padding: 16px 18px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--text);
    text-decoration: none;
    transition: border-color 150ms var(--ease-out-smooth), transform 150ms var(--ease-out-smooth);
}
.quickstart-link:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.42);
    transform: translateY(-1px);
}
.quickstart-link:active {
    transform: scale(0.98);
}
.quickstart-link strong {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--accent-text);
    text-shadow: var(--accent-text-glow);
}
.quickstart-link span {
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.5;
}
@media (max-width: 640px) {
    .quickstart-tab-list {
        width: 100%;
        border-radius: calc(var(--radius) - 2px);
    }
    .quickstart-tab {
        flex: 1 1 auto;
        border-radius: calc(var(--radius) - 6px);
    }
    .quickstart-snippet {
        border-radius: calc(var(--radius) - 2px);
    }
    .quickstart-link-grid {
        grid-template-columns: 1fr;
    }
}
@media (prefers-reduced-motion: reduce) {
    .quickstart-secondary,
    .quickstart-tab,
    .quickstart-link,
    .quickstart-link:hover,
    .quickstart-link:active,
    .quickstart-snippet .copy-btn,
    .quickstart-snippet .copy-btn:active {
        transition: none;
        transform: none;
    }
}
@media (hover: none) and (pointer: coarse) {
    .quickstart-snippet .copy-btn {
        opacity: 1;
    }
}
</style>
