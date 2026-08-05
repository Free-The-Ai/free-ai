<script lang="ts">
    import { siteConfig } from "@/shared/config/site";
    import OnlineCounter from "@/features/presence/ui/OnlineCounter.svelte";

    // `flush` matches the 404 page's original `body .site-footer { margin-top: 0 }`
    // override, scoped here instead of leaking a global selector.
    let { flush }: { flush?: boolean } = $props();

    const columns: { label: string; links: [string, string, boolean?][] }[] = [
        {
            label: "Product",
            links: [
                ["/models", "Models"],
                ["/status", "Status"],
            ],
        },
        {
            label: "Console",
            links: [
                ["/quickstart", "Quickstart"],
                ["/setup", "Setup guides"],
                ["/docs", "Docs"],
            ],
        },
        {
            label: "Resources",
            links: [
                ["/support", "Support"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
                [siteConfig.socials.donate, "Donate", true],
            ],
        },
    ];
</script>

<footer class="site-footer" style={flush ? "margin-top: 0" : undefined} aria-label="Site footer">
    <div class="footer-columns">
        {#each columns as column (column.label)}
            <nav class="footer-column" aria-label={column.label}>
                <span class="footer-column-label">{column.label}</span>
                {#each column.links as [href, label, external] (href)}
                    {#if external}
                        <a {href} target="_blank" rel="noreferrer">{label}</a>
                    {:else}
                        <a {href}>{label}</a>
                    {/if}
                {/each}
            </nav>
        {/each}
    </div>

    <div class="footer-watermark" aria-hidden="true">FreeTheAI</div>

    <p class="footer-bottom">
        © Copyright FreeTheAI 2026<span class="footer-sep" aria-hidden="true">&middot;</span>free tier stays free. paid slots are
        optional. <OnlineCounter />
    </p>
</footer>

<style>
    .footer-columns {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
        padding: 8px 0 40px;
    }
    .footer-column {
        display: grid;
        gap: 10px;
        align-content: start;
        justify-items: start;
    }
    .footer-column-label {
        margin-bottom: 6px;
        font-family: var(--font-mono);
        font-size: 0.66rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--dim);
    }
    .footer-column a {
        color: var(--muted);
        font-size: 0.82rem;
        text-decoration: none;
        transition: color 150ms var(--ease-out-smooth);
    }
    .footer-column a:hover {
        color: var(--text);
    }
    .footer-watermark {
        overflow: hidden;
        margin: 0 -8px -0.32em;
        font-family: var(--font-display);
        font-size: clamp(4rem, 16.2vw, 11.4rem);
        font-weight: 700;
        line-height: 0.92;
        letter-spacing: -0.05em;
        text-align: center;
        white-space: nowrap;
        color: oklch(1 0 0 / 0.07);
        user-select: none;
    }
    .footer-bottom {
        font-family: var(--font-mono);
    }
    @media (max-width: 40em) {
        .footer-columns {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
</style>
