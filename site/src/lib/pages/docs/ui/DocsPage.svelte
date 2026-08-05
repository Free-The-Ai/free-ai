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
    import { onMount } from "svelte";
    import { DocsMobileNav } from "@/features/docs-navigation";
    import DocsAccordion from "./DocsAccordion.svelte";
    import DocsSearch from "./DocsSearch.svelte";

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
        ["POST", "/v1/responses", "Responses-style route. Same key, same model alias.", "responses"],
        ["POST", "/v1/images/generations", "OpenAI-compatible image generation for supported image aliases.", "images"],
        ["POST", "/v1/images/edits", "OpenAI-compatible multipart image edits for supported image aliases.", "images"],
        ["GET", "/v1/images/generations/{request_id}", "Poll async EVE image generation jobs.", "images"],
        ["GET", "/v1/models", "Authenticated model list for normal clients.", "models"],
        ["GET", "/v1/models/full", "Expanded catalog with context, output, and access metadata.", "models"],
        ["GET", "/v1/models/leaderboard", "Site-key model leaderboard for public widgets.", "models"],
        ["POST", "/v1/audio/speech", "Text-to-speech for supported voice aliases.", "audio"],
        ["POST", "/v1/audio/transcriptions", "Speech-to-text multipart uploads for supported voice aliases.", "audio"],
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

    // The only public, unauthenticated route - safe to call from the browser.
    // Powers both the server-card status dot and the Try it out playground.
    let healthState = $state<"idle" | "loading" | "done" | "error">("idle");
    let healthBody = $state("");
    let healthError = $state("");

    async function refreshHealth(interactive: boolean): Promise<void> {
        if (interactive) healthState = "loading";
        try {
            const r = await fetch("https://api.freetheai.xyz/v1/health");
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            healthBody = JSON.stringify(await r.json(), null, 2);
            healthState = "done";
        } catch (err) {
            healthError = err instanceof Error ? err.message : String(err);
            healthState = "error";
        }
    }

    // Route filter for the endpoints table.
    let routeFilter = $state("");
    const filteredEndpoints = $derived(
        routeFilter.trim() === ""
            ? endpoints
            : endpoints.filter(([method, path, desc]) =>
                  (method + " " + path + " " + desc).toLowerCase().includes(routeFilter.trim().toLowerCase()),
              ),
    );

    // Scrollspy: the reference rail tracks which section is in view.
    let activeSection = $state("");
    onMount(() => {
        refreshHealth(false);
        const ids = new Set(
            endpoints.map(([, , , anchor]) => anchor).concat(["auth", "endpoints", "compatibility", "chat", "messages", "models", "other-routes", "responses", "images", "audio", "errors"]),
        );
        const obs = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) activeSection = entry.target.id;
                }
            },
            { rootMargin: "-15% 0px -75% 0px" },
        );
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        }
        return () => obs.disconnect();
    });

    function copyStartValue(event: MouseEvent): void {
        const btn = event.currentTarget as HTMLElement;
        const text = btn.getAttribute("data-copy") ?? "";
        navigator.clipboard.writeText(text).catch(() => {
            /* clipboard permission denied; silently ignored, matches original */
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
        <div class="docs-rail-stack">
            <DocsSearch {endpoints} />
            <aside class="docs-sidebar" id="docs-section-nav" aria-label="API reference">
            <span class="docs-sidebar-label">Reference</span>
            <a href="#auth" class={activeSection === "auth" ? "is-active" : ""}>Auth</a>
            <a href="#endpoints" class={activeSection === "endpoints" ? "is-active" : ""}>Endpoints</a>
            <a href="#compatibility" class={activeSection === "compatibility" ? "is-active" : ""}>Compatibility</a>
            <a href="#chat" class={activeSection === "chat" ? "is-active" : ""}>Chat</a>
            <a href="#messages" class={activeSection === "messages" ? "is-active" : ""}>Messages</a>
            <a href="#models" class={activeSection === "models" ? "is-active" : ""}>Models</a>
            <a href="#other-routes" class={activeSection === "other-routes" ? "is-active" : ""}>Images, audio, responses</a>
            <a href="#errors" class={activeSection === "errors" ? "is-active" : ""}>Errors</a>
            <span class="docs-sidebar-label docs-nav-label">Endpoints</span>
            {#each endpoints as [method, path, , anchor] (path)}
                <a class={activeSection === anchor ? "docs-nav-op is-active" : "docs-nav-op"} href={`#${anchor}`}>
                    <span class={`docs-nav-method ${method.toLowerCase()}`}>{method}</span>
                    <code>{path}</code>
                </a>
            {/each}
        </aside>
        </div>

        <div class="docs-content">
            <section class="docs-hero shell">
                <span class="eyebrow">API Reference</span>
                <h1>One key, one <span class="holo">base URL.</span></h1>
                <p class="docs-lede">
                    OpenAI-compatible chat, Anthropic-style messages, image generation, audio, and the full model catalog.
                    Same key, same base URL.
                </p>
                <div class="docs-server-card">
                    <div class="docs-server-head">
                        <span class="docs-server-title">Server</span>
                        <span class="docs-server-status" class:up={healthState === "done"} class:down={healthState === "error"}>
                            <span class="docs-server-dot" aria-hidden="true"></span>
                            {healthState === "done" ? "operational" : healthState === "error" ? "unavailable" : "checking…"}
                        </span>
                    </div>
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
                <div class="docs-try">
                    <div class="docs-try-head">
                        <div class="docs-try-copy">
                            <div class="docs-try-title">
                                <span class="docs-method get">GET</span>
                                <code>/v1/health</code>
                            </div>
                            <p>The only public route. No key needed. Live data, straight from the API.</p>
                        </div>
                        <button class="docs-try-btn" type="button" onclick={() => refreshHealth(true)} disabled={healthState === "loading"}>
                            {#if healthState === "loading"}Waiting…{:else}Try it out{/if}
                        </button>
                    </div>
                    {#if healthState === "done" || healthState === "error"}
                        <div class="docs-try-response" aria-live="polite"><pre>{healthState === "error" ? `Error: ${healthError}` : healthBody}</pre></div>
                    {/if}
                </div>
                <p class="docs-hero-caption">
                    {endpoints.length} endpoints across 3 formats
                </p>
            </section>

            <section class="docs-section" id="endpoints" aria-labelledby="endpoint-overview-title">
                <header class="section-head">
                    <span class="eyebrow">Endpoints</span>
                    <h2 id="endpoint-overview-title">Every route.<a class="docs-anchor" href="#endpoints" aria-label="Link to this section">#</a></h2>
                </header>
                <label class="docs-filter">
                    <span class="material-symbols-outlined" aria-hidden="true">search</span>
                    <input
                        type="search"
                        bind:value={routeFilter}
                        placeholder="Filter routes"
                        aria-label="Filter endpoints by method, path, or description"
                        onkeydown={(e) => {
                            if (e.key === "Escape") {
                                routeFilter = "";
                                e.currentTarget.blur();
                            }
                        }} />
                </label>
                {#if filteredEndpoints.length === 0}
                    <p class="docs-filter-empty">
                        No routes match "{routeFilter}".
                        <button type="button" onclick={() => (routeFilter = "")}>Clear filter</button>
                    </p>
                {/if}
                <div class="docs-endpoint-table" role="table" aria-label="API endpoints">
                    <div class="docs-endpoint-row docs-endpoint-head" role="row">
                        <span role="columnheader">Method</span>
                        <span role="columnheader">Path</span>
                        <span role="columnheader">Description</span>
                    </div>
                    {#each filteredEndpoints as [method, path, desc, anchor] (path)}
                        <a class="docs-endpoint-row" href={`#${anchor}`} role="row">
                            <span class={`docs-method ${method.toLowerCase()}`} role="cell">{method}</span>
                            <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
                            <code class="docs-path" role="cell">{path}</code>
                            <span class="docs-endpoint-desc" role="cell">{desc}</span>
                        </a>
                    {/each}
                </div>
            </section>

            <section class="docs-section" id="details">
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
                />
            </section>
        </div>
    </section>
</main>

<style>
.docs-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: clamp(24px, 3.6vw, 40px);
    justify-items: start;
    text-align: left;
}
.docs-hero > * {
    min-width: 0;
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
.docs-hero h1 .holo {
    background-image: linear-gradient(90deg, oklch(0.74 0.13 265), oklch(0.8 0.14 195), oklch(0.86 0.12 145), oklch(0.82 0.13 100));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}
.docs-lede {
    margin: 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 1.02rem;
    line-height: 1.6;
    text-wrap: pretty;
}
.docs-hero-caption {
    margin: 0;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.01em;
}
.docs-server-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
}
.docs-server-title {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.docs-server-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
}
.docs-server-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--dim);
    transition: background 200ms var(--ease-out-smooth);
}
.docs-server-status.up .docs-server-dot {
    background: oklch(0.72 0.16 150);
}
.docs-server-status.down .docs-server-dot {
    background: oklch(0.6 0.19 25);
}
.docs-server-card {
    display: grid;
    width: 100%;
    max-width: 720px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    overflow: hidden;
}
.docs-server-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    background: transparent;
}
.docs-server-row + .docs-server-row {
    border-top: 1px solid var(--border);
}
.docs-server-info {
    display: grid;
    gap: 6px;
    min-width: 0;
}
.docs-server-label {
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.72rem;
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
    border: 1px solid var(--border);
    border-radius: calc(var(--radius-sm) - 2px);
    background: transparent;
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
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
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
    border-top: 1px solid var(--border);
}
.docs-endpoint-head {
    padding: 10px 16px;
    background: transparent;
    color: var(--dim);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    pointer-events: none;
}
.docs-endpoint-head span {
    font-weight: 700;
}
.docs-endpoint-row:hover {
    background: oklch(1 0 0 / 0.03);
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

.docs-filter {
    display: flex;
    align-items: center;
    gap: 10px;
    width: min(420px, 100%);
    margin-bottom: 12px;
    padding: 9px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--dim);
    transition: border-color 150ms var(--ease-out-smooth);
}
.docs-filter:focus-within {
    border-color: var(--border-strong);
}
.docs-filter .material-symbols-outlined {
    font-size: 1.05rem;
}
.docs-filter input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 0.82rem;
    outline: none;
}
.docs-filter input::placeholder {
    color: var(--dim);
}
.docs-filter-empty {
    margin: 0 0 12px;
    color: var(--muted);
    font-size: 0.9rem;
}
#details {
    padding: 0;
}
.docs-filter-empty button {
    border: none;
    background: none;
    padding: 0;
    color: var(--text);
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>
