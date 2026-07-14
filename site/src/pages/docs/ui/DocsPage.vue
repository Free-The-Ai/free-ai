<script setup lang="ts">
import { useSeo } from "@/shared/lib/seo";
import {
    buildOrganizationJsonLd,
    buildSoftwareJsonLd,
    buildWebsiteJsonLd,
    buildWebApiJsonLd,
    buildMachineReadableResourcesJsonLd,
    buildSignupHowToJsonLd,
    buildBreadcrumbJsonLd,
} from "@/shared/lib/jsonLd";
import { docsSnippets } from "@/shared/config/codeSnippets";
import { DitherGradient } from "@/shared/ui";
import { highlightedCode } from "@/shared/config/highlighted.generated";
import { DocsMobileNav } from "@/features/docs-navigation";
import DocsAccordion from "./DocsAccordion.vue";

const pageDescription =
    "FreeTheAi API docs for OpenAI-compatible chat completions, Anthropic-style messages, image generation, image edits, audio, model listing, signup, check-in, and key reset.";

const {
    base: baseSnippet,
    chatCurl: chatCurlSnippet,
    openAiSdk: openAISDKSnippet,
    messages: messagesSnippet,
    modelList: modelListSnippet,
    fullModelList: fullModelListSnippet,
} = docsSnippets;
const {
    base: baseSnippetHtml,
    chatCurl: chatCurlSnippetHtml,
    openAiSdk: openAISDKSnippetHtml,
    messages: messagesSnippetHtml,
    modelList: modelListSnippetHtml,
    fullModelList: fullModelListSnippetHtml,
} = highlightedCode.docs;

const endpoints: [string, string, string, string][] = [
    ["POST", "/v1/chat/completions", "OpenAI-compatible chat, streaming, tool calling, and multi-turn conversations.", "chat"],
    ["POST", "/v1/messages", "Anthropic-compatible Messages route for Claude-style clients.", "messages"],
    ["POST", "/v1/responses", "Responses-style route. Same key, same model alias.", "compatibility"],
    ["POST", "/v1/images/generations", "OpenAI-compatible image generation for supported image aliases.", "compatibility"],
    ["POST", "/v1/images/edits", "OpenAI-compatible multipart image edits for supported image aliases.", "compatibility"],
    ["GET", "/v1/images/generations/{request_id}", "Poll async EVE image generation jobs.", "compatibility"],
    ["GET", "/v1/models", "Authenticated model list for normal clients.", "models"],
    ["GET", "/v1/models/full", "Expanded catalog with context, output, and access metadata.", "models"],
    ["GET", "/v1/models/leaderboard", "Site-key model leaderboard for public widgets.", "models"],
    ["POST", "/v1/audio/speech", "Text-to-speech for supported voice aliases.", "compatibility"],
    ["POST", "/v1/audio/transcriptions", "Speech-to-text multipart uploads for supported voice aliases.", "compatibility"],
    ["GET", "/v1/health", "Public API health and catalog status.", "endpoints"],
];

useSeo({
    title: "FreeTheAi API Docs - OpenAI-Compatible Chat and Models",
    description: pageDescription,
    path: "/docs",
    jsonLd: [
        buildWebsiteJsonLd(),
        buildOrganizationJsonLd(),
        buildSoftwareJsonLd(),
        buildWebApiJsonLd(),
        buildMachineReadableResourcesJsonLd(),
        buildSignupHowToJsonLd(),
        buildBreadcrumbJsonLd([
            { name: "FreeTheAi", url: "https://freetheai.xyz/home" },
            { name: "API Docs", url: "https://freetheai.xyz/docs" },
        ]),
    ],
});

function copyStartValue(event: MouseEvent): void {
    const btn = event.currentTarget as HTMLElement;
    const text = btn.getAttribute("data-copy") ?? "";
    navigator.clipboard.writeText(text).catch(() => {
        /* clipboard permission denied — silently ignored, matches original */
    });
    const icon = btn.querySelector(".material-symbols-outlined");
    if (!icon) return;
    icon.textContent = "check";
    setTimeout(() => {
        icon.textContent = "content_copy";
    }, 1200);
}
</script>

<template>
    <main class="docs-main" data-docs-nav>
        <DocsMobileNav />
        <section class="docs-layout">
            <aside class="docs-sidebar" id="docs-section-nav" aria-label="Docs sections">
                <span class="docs-sidebar-label">On this page</span>
                <a href="#auth">Auth</a>
                <a href="#endpoints">Endpoints</a>
                <a href="#compatibility">Compatibility</a>
                <a href="#chat">Chat</a>
                <a href="#messages">Messages</a>
                <a href="#models">Models</a>
                <a href="#errors">Errors</a>
            </aside>

            <div class="docs-content">
                <section class="docs-hero shell">
                    <DitherGradient class="docs-glow" from="orange" direction="up" :opacity="0.28" />
                    <span class="eyebrow">API Docs</span>
                    <h1>One key, one base URL.</h1>
                    <p class="docs-lede">
                        OpenAI-compatible chat, Anthropic-style messages, image generation, audio, and the full model catalog.
                        Same key, same base URL.
                    </p>
                    <div class="docs-hero-meta">
                        <span class="docs-hero-stat"><strong>{{ endpoints.length }}</strong> endpoints</span>
                        <span class="docs-hero-stat"><strong>3</strong> formats</span>
                        <span class="docs-hero-stat"><strong>0¢</strong> free tier</span>
                    </div>
                </section>

                <section class="docs-section shell" id="getting-started">
                    <header class="section-head">
                        <span class="eyebrow">Getting started</span>
                        <h2>Connect in seconds.</h2>
                    </header>
                    <div class="docs-start-card">
                        <div class="docs-start-row">
                            <div class="docs-start-info">
                                <span class="docs-start-label">Base URL</span>
                                <code>https://api.freetheai.xyz/v1</code>
                            </div>
                            <button class="docs-start-copy" type="button" data-copy="https://api.freetheai.xyz/v1" aria-label="Copy base URL" @click="copyStartValue">
                                <span class="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                        <div class="docs-start-row">
                            <div class="docs-start-info">
                                <span class="docs-start-label">Auth header</span>
                                <code>Authorization: Bearer YOUR_API_KEY</code>
                            </div>
                            <button class="docs-start-copy" type="button" data-copy="Authorization: Bearer YOUR_API_KEY" aria-label="Copy auth header" @click="copyStartValue">
                                <span class="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section class="docs-section shell" id="endpoints">
                    <header class="section-head">
                        <span class="eyebrow">Endpoints</span>
                        <h2>Every route.</h2>
                    </header>
                    <div class="docs-endpoint-table" role="table" aria-label="API endpoints">
                        <div class="docs-endpoint-row docs-endpoint-head" role="row">
                            <span role="columnheader">Method</span>
                            <span role="columnheader">Path</span>
                            <span role="columnheader">Description</span>
                        </div>
                        <a v-for="([method, path, desc, anchor], i) in endpoints" :key="i" class="docs-endpoint-row" :href="`#${anchor}`" role="row">
                            <span :class="`docs-method docs-method-${method.toLowerCase()}`" role="cell">{{ method }}</span>
                            <code class="docs-path" role="cell">{{ path }}</code>
                            <span class="docs-endpoint-desc" role="cell">{{ desc }}</span>
                        </a>
                    </div>
                </section>

                <section class="docs-section shell" id="details">
                    <DocsAccordion
                        :base-snippet="baseSnippet"
                        :base-snippet-html="baseSnippetHtml"
                        :chat-curl-snippet="chatCurlSnippet"
                        :chat-curl-snippet-html="chatCurlSnippetHtml"
                        :openai-sdk-snippet="openAISDKSnippet"
                        :openai-sdk-snippet-html="openAISDKSnippetHtml"
                        :messages-snippet="messagesSnippet"
                        :messages-snippet-html="messagesSnippetHtml"
                        :model-list-snippet="modelListSnippet"
                        :model-list-snippet-html="modelListSnippetHtml"
                        :full-model-list-snippet="fullModelListSnippet"
                        :full-model-list-snippet-html="fullModelListSnippetHtml"
                        :endpoints="endpoints.map(([m, p, d]) => [m, p, d])"
                    />
                </section>
            </div>
        </section>
    </main>
</template>

<style scoped>
.docs-hero {
    display: grid;
    gap: 12px;
    padding: clamp(28px, 4.6vw, 52px);
    text-align: center;
    justify-items: center;
}
.docs-hero .eyebrow {
    color: var(--dim);
}
.docs-hero h1 {
    margin: 0;
    font-size: clamp(2.35rem, 4.7vw, 3.6rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
    text-wrap: balance;
}
.docs-lede {
    margin: 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 1.02rem;
    line-height: 1.6;
    text-wrap: pretty;
}
.docs-hero-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 14px;
    margin-top: 4px;
}
.docs-hero-stat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    color: var(--muted);
    font-size: 0.9rem;
}
.docs-hero-stat strong {
    color: var(--accent-text);
    font-family: var(--font-serif);
    font-size: 1.2rem;
    text-shadow: var(--accent-text-glow);
}
.docs-start-card {
    display: grid;
    gap: 12px;
    padding: 18px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-shell-bg);
    box-shadow: var(--sk-raised-shadow);
}
.docs-start-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border: 1px solid var(--sk-border);
    border-radius: calc(var(--radius) - 4px);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.docs-start-info {
    display: grid;
    gap: 6px;
    min-width: 0;
}
.docs-start-label {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.docs-start-info code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.92rem;
    text-shadow: var(--accent-text-glow);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.docs-start-copy {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid var(--sk-border);
    border-radius: calc(var(--radius-sm) - 2px);
    background: var(--sk-shell-bg);
    color: var(--muted);
    cursor: pointer;
    transition: transform 140ms var(--ease-out-smooth), border-color 140ms var(--ease-out-smooth), color 140ms var(--ease-out-smooth);
}
.docs-start-copy:hover {
    color: var(--text);
    border-color: oklch(0.659 0.192 40.1 / 0.42);
}
.docs-start-copy:active {
    transform: scale(0.96);
}
.docs-endpoint-table {
    display: grid;
    gap: 6px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
    overflow: hidden;
}
.docs-endpoint-row {
    display: grid;
    grid-template-columns: 72px minmax(180px, 1fr) minmax(200px, 1.4fr);
    gap: 16px;
    align-items: center;
    padding: 12px 16px;
    color: var(--text);
    text-decoration: none;
    transition: background 140ms var(--ease-out-smooth);
}
.docs-endpoint-row + .docs-endpoint-row {
    border-top: 1px solid var(--sk-border);
}
.docs-endpoint-head {
    padding: 10px 16px;
    background: var(--sk-shell-bg);
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    pointer-events: none;
}
.docs-endpoint-head span {
    font-weight: 700;
}
.docs-endpoint-row:hover {
    background: var(--sk-shell-bg);
}
.docs-endpoint-row:active {
    transform: scale(0.995);
}
.docs-method {
    justify-self: start;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}
.docs-method-get {
    background: oklch(0.72 0.15 145 / 0.15);
    color: oklch(0.72 0.15 145);
}
.docs-method-post {
    background: oklch(0.659 0.192 40.1 / 0.15);
    color: var(--accent-text);
}
.docs-path {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.docs-endpoint-desc {
    color: var(--muted);
    font-size: 0.85rem;
    line-height: 1.5;
    text-wrap: pretty;
}
@media (max-width: 760px) {
    .docs-start-row {
        border-radius: calc(var(--radius) - 2px);
    }
    .docs-start-copy {
        border-radius: calc(var(--radius) - 6px);
    }
    .docs-endpoint-row {
        grid-template-columns: 60px 1fr;
        gap: 8px 12px;
        padding: 14px;
    }
    .docs-endpoint-head {
        display: none;
    }
    .docs-endpoint-desc {
        grid-column: 1 / -1;
    }
    .docs-path {
        overflow: visible;
        text-overflow: clip;
        white-space: normal;
        word-break: break-word;
    }
}
@media (prefers-reduced-motion: reduce) {
    .docs-endpoint-card,
    .docs-endpoint-card:hover,
    .docs-endpoint-card:active,
    .docs-start-copy,
    .docs-start-copy:active {
        transition: none;
        transform: none;
    }
}
.docs-hero {
    position: relative;
    overflow: hidden;
}
.docs-glow {
    z-index: 0;
}
.docs-hero > *:not(.docs-glow) {
    position: relative;
    z-index: 1;
}
</style>
