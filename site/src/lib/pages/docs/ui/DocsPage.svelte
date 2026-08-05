<script lang="ts">
    import { buildSeo } from "@/shared/lib/seo";
    import {
        buildOrganizationJsonLd,
        buildSoftwareJsonLd,
        buildWebsiteJsonLd,
        buildWebApiJsonLd,
        buildMachineReadableResourcesJsonLd,
        buildSignupHowToJsonLd,
        buildBreadcrumbJsonLd,
    } from "@/shared/lib/jsonLd";
    import { SeoHead } from "@/shared/ui";
    import { highlightedCode } from "@/shared/config/highlighted.generated";
    import { docsSnippets } from "@/shared/config/codeSnippets";
    import { DocsMobileNav } from "@/features/docs-navigation";
    import DocsAccordion from "./DocsAccordion.svelte";

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

    const seo = buildSeo({
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

<SeoHead {seo} />

<main class="docs-main" data-docs-nav>
    <DocsMobileNav />
    <section class="docs-layout">
        <aside class="docs-sidebar" id="docs-section-nav" aria-label="API reference">
            <span class="docs-sidebar-label">Reference</span>
            <a href="#auth">Auth</a>
            <a href="#endpoints">Endpoints</a>
            <a href="#compatibility">Compatibility</a>
            <a href="#chat">Chat</a>
            <a href="#messages">Messages</a>
            <a href="#models">Models</a>
            <a href="#errors">Errors</a>
            <span class="docs-sidebar-label docs-nav-label">Endpoints</span>
            {#each endpoints as [method, path, , anchor] (anchor)}
                <a class="docs-nav-op" href={`#${anchor}`}>
                    <span class={`docs-nav-method ${method.toLowerCase()}`}>{method}</span>
                    <code>{path}</code>
                </a>
            {/each}
        </aside>

        <div class="docs-content">
            <section class="docs-hero shell">
                <span class="eyebrow">API Reference</span>
                <h1>One key, one base URL.</h1>
                <p class="docs-lede">
                    OpenAI-compatible chat, Anthropic-style messages, image generation, audio, and the full model catalog.
                    Same key, same base URL.
                </p>
                <div class="docs-server-card">
                    <div class="docs-server-row">
                        <div class="docs-server-info">
                            <span class="docs-server-label">Base URL</span>
                            <code>https://api.freetheai.xyz/v1</code>
                        </div>
                        <button class="docs-server-copy" type="button" data-copy="https://api.freetheai.xyz/v1" aria-label="Copy base URL" onclick={copyStartValue}>
                            <span class="material-symbols-outlined">content_copy</span>
                        </button>
                    </div>
                    <div class="docs-server-row">
                        <div class="docs-server-info">
                            <span class="docs-server-label">Auth header</span>
                            <code>Authorization: Bearer YOUR_API_KEY</code>
                        </div>
                        <button class="docs-server-copy" type="button" data-copy="Authorization: Bearer YOUR_API_KEY" aria-label="Copy auth header" onclick={copyStartValue}>
                            <span class="material-symbols-outlined">content_copy</span>
                        </button>
                    </div>
                </div>
                <div class="docs-hero-meta">
                    <span class="docs-hero-stat"><strong>{endpoints.length}</strong> endpoints</span>
                    <span class="docs-hero-stat"><strong>3</strong> formats</span>
                    <span class="docs-hero-stat"><strong>0¢</strong> free tier</span>
                </div>
            </section>

            <section class="docs-section shell" aria-labelledby="endpoint-overview-title">
                <header class="section-head">
                    <span class="eyebrow">Endpoints</span>
                    <h2 id="endpoint-overview-title">Every route.</h2>
                </header>
                <div class="docs-endpoint-table" role="table" aria-label="API endpoints">
                    <div class="docs-endpoint-row docs-endpoint-head" role="row">
                        <span role="columnheader">Method</span>
                        <span role="columnheader">Path</span>
                        <span role="columnheader">Description</span>
                    </div>
                    {#each endpoints as [method, path, desc, anchor], i (i)}
                        <a class="docs-endpoint-row" href={`#${anchor}`} role="row">
                            <span class={`docs-method ${method.toLowerCase()}`} role="cell">{method}</span>
                            <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
                            <code class="docs-path" role="cell">{path}</code>
                            <span class="docs-endpoint-desc" role="cell">{desc}</span>
                        </a>
                    {/each}
                </div>
            </section>

            <section class="docs-section shell" id="details">
                <DocsAccordion
                    {baseSnippet}
                    {baseSnippetHtml}
                    {chatCurlSnippet}
                    {chatCurlSnippetHtml}
                    openaiSdkSnippet={openAISDKSnippet}
                    openaiSdkSnippetHtml={openAISDKSnippetHtml}
                    {messagesSnippet}
                    {messagesSnippetHtml}
                    {modelListSnippet}
                    {modelListSnippetHtml}
                    {fullModelListSnippet}
                    {fullModelListSnippetHtml}
                    endpoints={endpoints.map(([m, p, d]) => [m, p, d])}
                />
            </section>
        </div>
    </section>
</main>

<style>
.docs-hero {
    display: grid;
    gap: 14px;
    padding: clamp(24px, 3.6vw, 40px);
    justify-items: start;
    text-align: left;
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
    justify-content: flex-start;
    gap: 10px;
    margin-top: 2px;
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
.docs-server-card {
    display: grid;
    gap: 10px;
    width: 100%;
    max-width: 720px;
    padding: 14px;
    border: 1px solid var(--sk-border);
    border-radius: var(--radius);
    background: var(--sk-shell-bg);
    box-shadow: var(--sk-raised-shadow);
}
.docs-server-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border: 1px solid var(--sk-border);
    border-radius: calc(var(--radius) - 4px);
    background: var(--sk-inset-bg);
    box-shadow: var(--sk-inset-shadow);
}
.docs-server-info {
    display: grid;
    gap: 6px;
    min-width: 0;
}
.docs-server-label {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.docs-server-info code {
    color: var(--accent-text);
    font-family: var(--font-mono);
    font-size: 0.92rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.docs-server-copy {
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
.docs-server-copy:hover {
    color: var(--text);
    border-color: var(--border-strong);
}
.docs-server-copy:active {
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
    .docs-server-row {
        border-radius: calc(var(--radius) - 2px);
    }
    .docs-server-copy {
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
    .docs-server-copy,
    .docs-server-copy:active {
        transition: none;
        transform: none;
    }
}

</style>
