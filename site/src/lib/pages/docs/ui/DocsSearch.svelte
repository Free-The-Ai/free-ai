<script lang="ts">
    import { onMount, tick } from "svelte";
    import { SETUP_GUIDES } from "@/entities/setup-guide";

    let { endpoints }: { endpoints: [string, string, string, string][] } = $props();

    let open = $state(false);
    let query = $state("");
    let activeIndex = $state(0);
    let inputEl: HTMLInputElement | undefined = $state();
    let restoreFocusEl: HTMLElement | null = null;

    // Static section index. Keywords widen the match surface without hiding
    // the label the user actually sees.
    const sections = [
        { label: "Auth: get a key", id: "auth", keywords: "signup checkin resetkey discord bearer token" },
        { label: "Client formats", id: "compatibility", keywords: "openai anthropic responses wire formats clients" },
        { label: "Chat completions", id: "chat", keywords: "openai chat streaming sse chunks tool calling request response" },
        { label: "Anthropic-style messages", id: "messages", keywords: "anthropic claude messages content blocks" },
        { label: "List models", id: "models", keywords: "catalog models full leaderboard metadata" },
        { label: "Images, audio, and responses", id: "other-routes", keywords: "images audio speech transcription tts stt responses eve async poll" },
        { label: "Errors and rate limits", id: "errors", keywords: "errors rate limits daily caps 401 403 429 retry" },
        { label: "Endpoint index", id: "endpoints", keywords: "routes endpoints table filter" },
    ];

    interface SearchResult {
        group: string;
        label: string;
        sub?: string;
        href: string;
    }

    const results = $derived.by((): SearchResult[] => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        const out: SearchResult[] = [];
        for (const s of sections) {
            if ((s.label + " " + s.keywords).toLowerCase().includes(q)) {
                out.push({ group: "Sections", label: s.label, href: "#" + s.id });
            }
        }
        for (const [method, path, desc, anchor] of endpoints) {
            if ((method + " " + path + " " + desc).toLowerCase().includes(q)) {
                out.push({ group: "Routes", label: method + " " + path, sub: desc, href: "#" + anchor });
            }
        }
        for (const g of SETUP_GUIDES) {
            if ((g.name + " " + g.tagline + " " + g.keywords.join(" ")).toLowerCase().includes(q)) {
                out.push({ group: "Setup guides", label: g.name, sub: g.tagline, href: "/setup/" + g.slug });
            }
        }
        return out.slice(0, 12);
    });

    async function openDialog(): Promise<void> {
        restoreFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        open = true;
        query = "";
        activeIndex = 0;
        await tick();
        inputEl?.focus();
    }

    function close(): void {
        open = false;
        restoreFocusEl?.focus();
        restoreFocusEl = null;
    }

    function go(result: SearchResult): void {
        const href = result.href;
        close();
        if (href.startsWith("#")) {
            const el = document.getElementById(href.slice(1));
            if (el) {
                history.replaceState(null, "", href);
                el.scrollIntoView({ block: "start" });
            }
        } else {
            window.location.assign(href);
        }
    }

    function onInputKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            activeIndex = Math.min(activeIndex + 1, results.length - 1);
            return;
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            return;
        }
        if (event.key === "Enter" && results[activeIndex]) {
            event.preventDefault();
            go(results[activeIndex]);
        }
    }

    onMount(() => {
        function onGlobalKeydown(event: KeyboardEvent): void {
            const target = event.target as HTMLElement | null;
            const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
            if (typing) return;
            if ((event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) || (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey))) {
                event.preventDefault();
                openDialog();
            }
        }
        window.addEventListener("keydown", onGlobalKeydown);
        return () => window.removeEventListener("keydown", onGlobalKeydown);
    });
</script>

<button class="docs-search-trigger" type="button" onclick={openDialog} aria-haspopup="dialog">
    <span class="material-symbols-outlined" aria-hidden="true">search</span>
    <span>Search docs</span>
    <kbd aria-hidden="true">/</kbd>
</button>

{#if open}
    <button type="button" class="docs-search-backdrop" onclick={close} aria-label="Close search" tabindex="-1"></button>
    <div class="docs-search" role="dialog" aria-modal="true" aria-label="Search the docs">
        <input
            bind:this={inputEl}
            bind:value={query}
            type="search"
            placeholder="Search sections, routes, and clients"
            aria-label="Search sections, routes, and clients"
            autocomplete="off"
            spellcheck="false"
            onkeydown={onInputKeydown} />
        <div class="docs-search-results">
            {#if query.trim() === ""}
                <p class="docs-search-hint">Type to search sections, the 12 routes, and {SETUP_GUIDES.length} setup guides.</p>
            {:else if results.length === 0}
                <p class="docs-search-hint">Nothing matches "{query}". Try a route path like <code>/v1/chat</code> or a client name.</p>
            {:else}
                {#each results as result, i (result.group + result.href + result.label)}
                    {#if i === 0 || results[i - 1].group !== result.group}
                        <div class="docs-search-group">{result.group}</div>
                    {/if}
                    <button
                        type="button"
                        class="docs-search-result"
                        class:active={i === activeIndex}
                        onmouseenter={() => (activeIndex = i)}
                        onclick={() => go(result)}>
                        <span class="docs-search-result-label">{result.label}</span>
                        {#if result.sub}
                            <span class="docs-search-result-sub">{result.sub}</span>
                        {/if}
                    </button>
                {/each}
            {/if}
        </div>
    </div>
{/if}

<style>
    .docs-search-trigger {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        margin-bottom: 12px;
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: transparent;
        color: var(--dim);
        font-family: var(--font-mono);
        font-size: 0.78rem;
        cursor: pointer;
        transition: border-color 150ms var(--ease-out-smooth), color 150ms var(--ease-out-smooth);
    }
    .docs-search-trigger:hover {
        border-color: var(--border-strong);
        color: var(--text);
    }
    .docs-search-trigger .material-symbols-outlined {
        font-size: 1rem;
    }
    .docs-search-trigger span {
        flex: 1;
        text-align: left;
    }
    .docs-search-trigger kbd {
        padding: 1px 7px;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.7rem;
    }
    .docs-search-backdrop {
        position: fixed;
        inset: 0;
        z-index: 90;
        border: none;
        padding: 0;
        background: oklch(0 0 0 / 0.6);
        cursor: default;
    }
    .docs-search {
        position: fixed;
        top: 14vh;
        left: 50%;
        transform: translateX(-50%);
        z-index: 91;
        display: grid;
        width: min(560px, calc(100vw - 32px));
        border: 1px solid var(--border-strong);
        border-radius: var(--radius);
        background: var(--bg);
        overflow: hidden;
    }
    .docs-search input {
        width: 100%;
        padding: 14px 16px;
        border: none;
        border-bottom: 1px solid var(--border);
        background: transparent;
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 0.9rem;
        outline: none;
    }
    .docs-search input::placeholder {
        color: var(--dim);
    }
    .docs-search-results {
        max-height: 46vh;
        overflow-y: auto;
        padding: 8px;
    }
    .docs-search-hint {
        margin: 0;
        padding: 10px 8px;
        color: var(--muted);
        font-size: 0.85rem;
        line-height: 1.6;
    }
    .docs-search-hint code {
        color: var(--text);
    }
    .docs-search-group {
        padding: 8px 8px 4px;
        color: var(--dim);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    .docs-search-result {
        display: grid;
        gap: 2px;
        width: 100%;
        padding: 8px;
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        text-align: left;
        cursor: pointer;
    }
    .docs-search-result.active {
        background: oklch(1 0 0 / 0.06);
    }
    .docs-search-result-label {
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 0.85rem;
    }
    .docs-search-result-sub {
        color: var(--dim);
        font-size: 0.78rem;
        line-height: 1.5;
    }
</style>
