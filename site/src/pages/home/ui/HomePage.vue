<script setup lang="ts">
import { useSeo } from "@/shared/lib/seo";
import { siteConfig } from "@/shared/config/site";
import { highlightedCode } from "@/shared/config/highlighted.generated";
import { Logo } from "@/shared/ui";
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

const snippetHtml = highlightedCode.home;

const pageTitle = "FreeTheAi (Free The AI) - Free OpenAI-Compatible AI API";
const pageDescription =
    "FreeTheAi, also searched as Free The AI, is a free OpenAI-compatible AI API with 80+ active models, Discord key signup, streaming chat, tool calling, and Anthropic-style messages. No credit card or billing.";

useSeo({
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
</script>

<template>
    <main>
        <section class="home-hero">
            <div class="home-hero-grid">
                <div class="home-hero-copy">
                    <h1 class="home-hero-logo">
                        <Logo :width="520" label="FreeTheAi" class="home-hero-logo-svg" />
                        <span class="sr-only">FreeTheAi — free OpenAI-compatible API</span>
                    </h1>
                    <p class="home-hero-lead">OpenAI-compatible AI API with 80+ active models. One Discord key, one base URL, zero billing.</p>
                    <div class="home-hero-cta">
                        <a class="primary-button" :href="siteConfig.socials.discord" target="_blank" rel="noreferrer" data-sound="interaction.confirm">
                            <span>Get a free API key</span>
                            <span class="hero-cta-arrow">&rarr;</span>
                        </a>
                        <router-link class="secondary-button" to="/docs" data-sound="interaction.tap">Read docs</router-link>
                    </div>
                    <div class="home-hero-links">
                        <router-link to="/models" class="hero-link">Browse Models</router-link>
                        <router-link to="/pricing" class="hero-link">Pricing</router-link>
                    </div>
                    <div class="home-hero-stats">
                        <LiveStats />
                    </div>
                </div>
                <div class="home-hero-demo">
                    <div class="code-card home-code-card">
                        <div class="card-head">
                            <div class="dot-row"><span></span><span></span><span></span></div>
                            <div class="card-label">Try it</div>
                        </div>
                        <div class="docs-code-group">
                            <div class="shiki-wrapper" v-html="snippetHtml" />
                            <button class="copy-btn" type="button" aria-label="Copy code">
                                <span class="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                    </div>
                    <a :href="siteConfig.socials.discord" target="_blank" rel="noreferrer" class="home-discord-link">
                        Join Discord <span class="home-discord-link-arrow">&rarr;</span>
                    </a>
                </div>
            </div>
        </section>

        <section class="section shell home-paths" aria-labelledby="home-paths-title">
            <div>
                <span class="home-paths-eyebrow">Popular setup paths</span>
                <h2 id="home-paths-title">Pick the client you are actually using.</h2>
                <p>FreeTheAi works as a custom OpenAI-compatible API across roleplay frontends, coding agents, and regular SDK apps.</p>
            </div>
            <div class="home-path-grid stagger-children">
                <router-link to="/roleplay-api">
                    <strong>Roleplay API</strong>
                    <span>SillyTavern, Janitor AI, Chub AI, RisuAI.</span>
                </router-link>
                <router-link to="/coding-agent-api">
                    <strong>Coding agent API</strong>
                    <span>OpenCode, Cline, Roo Code, Kilo Code, Zed.</span>
                </router-link>
                <router-link to="/openai-compatible-api">
                    <strong>OpenAI-compatible API</strong>
                    <span>Python, JavaScript, bots, and custom clients.</span>
                </router-link>
            </div>
        </section>

        <section class="home-content">
            <div class="rhythm stagger-children">
                <div class="beat whisper">
                    <h2 class="beat-heading">What Is FreeTheAi?</h2>
                    <p class="beat-prose">
                        FreeTheAi is a <strong>free AI API gateway</strong> with 80+ active models behind a single
                        OpenAI-compatible endpoint. No credit card, no billing, no daily caps — just a free Discord key and a
                        base URL that works with any OpenAI SDK. No prompt storage, no card required. Optional paid slots exist
                        for builders who need separate higher-power models. Built to <strong>free the AI</strong> for
                        developers, students, and builders.
                    </p>
                </div>

                <div class="beat">
                    <h2 class="beat-heading">What Can You Build?</h2>
                    <div class="diptych">
                        <div class="diptych-panel">
                            <h3 class="diptych-label">API features</h3>
                            <p>Streaming chat, tool calling and structured outputs, and Anthropic messages - all OpenAI-compatible.</p>
                        </div>
                        <div class="diptych-panel">
                            <h3 class="diptych-label">Use cases</h3>
                            <p>
                                Chatbots, coding agents, content pipelines, and multi-model orchestrations. Students prototype,
                                developers ship, researchers evaluate — all against one free endpoint.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="beat shout">
                    <h2 class="beat-heading">Getting Started</h2>
                    <ol class="steps">
                        <li>Join the <a :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">FreeTheAi Discord</a></li>
                        <li>Run <code>/signup</code> and complete the modal with your use case, bot answer, and human challenge</li>
                        <li>Run <code>/checkin</code> with your API key once per UTC day before using the free API</li>
                        <li>Set <code>FREETHEAI_API_KEY</code> in your environment</li>
                        <li>Point any OpenAI SDK at <code>https://api.freetheai.xyz/v1</code></li>
                        <li>Browse the <router-link to="/docs">API docs</router-link> for endpoint-specific examples</li>
                    </ol>
                    <div class="cta-wrap">
                        <a class="primary-button" :href="siteConfig.socials.discord" target="_blank" rel="noreferrer">
                            Get your free API key
                            <span class="cta-arrow">&rarr;</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <section class="section shell home-support">
            <div class="home-support-card">
                <span class="home-support-eyebrow">Community funded</span>
                <h2>Keep the free tier alive.</h2>
                <p>
                    If FreeTheAi saves you a subscription or unblocks a project, a small donation helps cover servers and keeps
                    more free capacity online.
                </p>
                <div class="home-support-cta">
                    <a class="primary-button home-support-button" :href="siteConfig.socials.donate" target="_blank" rel="noreferrer">
                        <span aria-hidden="true">&#9825;</span>
                        <span>Donate</span>
                    </a>
                    <a class="home-support-link" :href="siteConfig.socials.github" target="_blank" rel="noreferrer">Star the repo</a>
                </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
.home-hero {
    position: relative;
    overflow: hidden;
    padding: 80px 16px 48px;
    text-align: center;
}
.home-hero-grid {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
    align-items: start;
}
.home-hero-copy {
    display: grid;
    justify-items: center;
}
.home-hero-logo {
    position: relative;
    margin: 0;
}
.home-hero-logo .home-hero-logo-svg {
    display: block;
    margin: 0 auto;
    max-width: 100%;
}
.home-hero-lead {
    color: var(--muted);
    font-size: 1.15rem;
    margin: 20px auto 0;
    line-height: 1.6;
    max-width: 480px;
    text-wrap: pretty;
}
.home-hero-cta {
    margin-top: 40px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}
.secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--control-height);
    padding: var(--control-padding);
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    transition: border-color 160ms var(--ease-out-smooth), background 160ms var(--ease-out-smooth), color 160ms var(--ease-out-smooth);
}
.secondary-button:hover {
    border-color: var(--border-strong);
    background: var(--control-bg);
}
.hero-cta-arrow {
    opacity: 0.6;
    font-size: 0.85rem;
    margin-left: 4px;
}
.home-hero-links {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    justify-content: center;
}
.home-hero-demo {
    display: grid;
    justify-items: center;
    gap: 16px;
}
.home-code-card {
    text-align: left;
    width: 100%;
    max-width: 540px;
}
.home-hero-stats {
    margin-top: 40px;
    width: 100%;
    max-width: 540px;
}
.home-discord-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--accent-text);
    text-shadow: var(--accent-text-glow);
    font-size: 0.85rem;
    text-decoration: none;
    font-weight: 500;
}
.home-discord-link-arrow {
    font-size: 1rem;
}
@media (min-width: 980px) {
    .home-hero {
        padding-top: 100px;
        text-align: left;
    }
    .home-hero-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 64px;
        align-items: center;
    }
    .home-hero-copy,
    .home-hero-demo {
        justify-items: start;
    }
    .home-hero-cta,
    .home-hero-links,
    .home-hero-logo .home-hero-logo-svg {
        justify-content: flex-start;
        margin-left: 0;
    }
    .home-hero-lead {
        margin-left: 0;
    }
    .home-hero-stats {
        max-width: none;
    }
}
.home-support {
    margin-top: 8px;
}
.home-support-card {
    position: relative;
    display: grid;
    gap: 12px;
    padding: clamp(22px, 3.4vw, 32px);
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    overflow: hidden;
}
.home-support-card::before {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: linear-gradient(180deg, oklch(0.75 0.173 353.8), oklch(0.659 0.192 40.1));
    pointer-events: none;
}
.home-support-eyebrow {
    position: relative;
    z-index: 1;
    color: oklch(0.803 0.128 354.3);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-shadow: 0 0 8px oklch(0.75 0.173 353.8 / 0.24);
}
.home-support-card h2 {
    position: relative;
    z-index: 1;
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.7rem, 3.4vw, 2.4rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
}
.home-support-card p {
    position: relative;
    z-index: 1;
    margin: 0;
    max-width: 64ch;
    color: var(--muted);
    font-size: 0.98rem;
    line-height: 1.6;
    text-wrap: pretty;
}
.home-support-cta {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    margin-top: 6px;
}
.home-support-button {
    border-color: oklch(0.75 0.173 353.8 / 0.55);
    background: oklch(0.75 0.173 353.8 / 0.1);
    color: oklch(0.916 0 0);
    text-shadow: 0 0 10px oklch(0.75 0.173 353.8 / 0.32);
    transition: border-color 160ms var(--ease-out-smooth), background 160ms var(--ease-out-smooth), color 160ms var(--ease-out-smooth);
}
.home-support-button:hover {
    border-color: oklch(0.75 0.173 353.8 / 0.82);
    background: oklch(0.75 0.173 353.8 / 0.16);
    color: oklch(0.952 0 0);
}
.home-support-link {
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.86rem;
    text-decoration: none;
    border-bottom: 1px solid var(--sk-border);
    padding-bottom: 2px;
    transition: color 160ms var(--ease-out-smooth), border-color 160ms var(--ease-out-smooth);
}
.home-support-link:hover {
    color: oklch(0.803 0.128 354.3);
    border-color: oklch(0.75 0.173 353.8 / 0.45);
}
.home-paths {
    display: grid;
    gap: 18px;
    width: min(820px, 100%);
    margin: 58px auto 0;
    padding: clamp(22px, 3.8vw, 36px);
}
.home-paths h2 {
    margin: 4px 0 0;
    font-family: var(--font-serif);
    font-size: clamp(1.4rem, 2.8vw, 2rem);
    letter-spacing: -0.02em;
}
.home-paths p {
    max-width: 58ch;
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.55;
    text-wrap: pretty;
}
.home-paths-eyebrow {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.home-path-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}
.home-path-grid a {
    display: grid;
    gap: 8px;
    min-height: 128px;
    padding: 18px 20px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--text);
    text-decoration: none;
    transition: border-color 160ms var(--ease-out-smooth), transform 160ms var(--ease-out-smooth);
}
.home-path-grid a:hover {
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}
.home-path-grid a:active {
    transform: scale(var(--press-scale));
}
.home-path-grid strong {
    color: var(--accent-text);
    font-family: var(--font-serif);
    font-size: 1.12rem;
    letter-spacing: -0.01em;
    text-shadow: var(--accent-text-glow);
}
.home-path-grid span {
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.5;
}
@media (hover: hover) and (pointer: fine) {
    .home-path-grid a:hover {
        transform: translateY(-2px);
    }
}
@media (prefers-reduced-motion: reduce) {
    .home-path-grid a,
    .home-path-grid a:hover,
    .home-path-grid a:active,
    .hero-link,
    .home-support-button,
    .home-support-link {
        transition: none;
        transform: none;
    }
}
@media (max-width: 820px) {
    .home-path-grid {
        grid-template-columns: 1fr;
    }
    .home-path-grid a {
        min-height: 0;
    }
}
.home-content {
    max-width: 720px;
    margin: 80px auto 0;
    padding: 0 24px 80px;
    position: relative;
    z-index: 1;
}
.rhythm {
    display: grid;
    gap: 48px;
}
.beat-heading {
    margin: 0 0 16px;
    color: var(--text);
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-weight: 600;
}
.whisper {
    padding: 20px 20px 20px 20px;
    border-left: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius);
}
.beat-prose {
    margin: 0;
    color: var(--muted);
    font-size: 1.05rem;
    line-height: 1.8;
}
.beat-prose strong {
    color: var(--text);
}
.diptych {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.diptych-panel {
    padding: 20px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.diptych-label {
    margin: 0 0 10px;
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}
.diptych-panel p {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.65;
    text-wrap: pretty;
}
.shout {
    padding: 24px 24px 24px 28px;
    border: 1px solid var(--sk-border);
    border-left: 2px solid var(--accent);
    border-radius: 0 var(--radius) var(--radius) 0;
    background: var(--sk-shell-bg);
    box-shadow: var(--sk-raised-shadow);
}
.shout .beat-heading {
    margin-bottom: 16px;
}
.steps {
    margin: 0 0 24px;
    padding-left: 24px;
    color: var(--muted);
    line-height: 2;
}
.steps a {
    color: var(--accent-text);
    text-underline-offset: 3px;
}
.steps code {
    color: var(--accent-text);
    background: var(--accent-muted);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
}
.cta-wrap {
    margin-top: 28px;
}
.cta-arrow {
    opacity: 0.6;
    font-size: 0.85rem;
    margin-left: 4px;
}
.hero-link {
    color: var(--muted);
    font-size: 0.9rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 120ms var(--ease-out-smooth);
}
@media (hover: hover) and (pointer: fine) {
    .hero-link:hover {
        color: var(--text);
    }
}
@media (max-width: 640px) {
    .diptych {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    .shout {
        padding: 20px 16px 20px 20px;
    }
    .whisper {
        padding-left: 14px;
    }
    .rhythm {
        gap: 40px;
    }
}
</style>
