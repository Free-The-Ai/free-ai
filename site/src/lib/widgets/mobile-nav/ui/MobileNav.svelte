<script lang="ts">
    import { page } from "$app/state";
    import { siteConfig } from "@/shared/config/site";
    import { CtaButton, Drawer } from "@/shared/ui";

    const currentPath = $derived(page.url.pathname);

    const ICONS: Record<string, string> = {
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .6-1.4l7-6a2 2 0 0 1 2.8 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" /></svg>',
        models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>',
            status: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-3l-2.5 5-4.5-10-3.5 7H2" /></svg>',
    };

    const TABS: [string, string, string][] = [
        ["/home", "Home", "home"],
        ["/models", "Models", "models"],
        ["/status", "Status", "status"],
    ];

    const MORE: [string, string, boolean, string][] = [
        ["/docs", "Docs", false, "description"],
        ["/setup", "Setup", false, "settings"],
        ["/roleplay-api", "Roleplay API", false, "theater_comedy"],
        ["/coding-agent-api", "Coding API", false, "code"],
        ["/privacy", "Privacy", false, "shield"],
        ["/terms", "Terms", false, "gavel"],
        [siteConfig.socials.github, "Repo", true, "code"],
        [siteConfig.socials.discord, "Join Discord", true, "chat"],
        [siteConfig.socials.donate, "Donate", true, "favorite"],
    ];

    let moreOpen = $state(false);

    function closeMore(): void {
        moreOpen = false;
    }

    // Open only — never toggle. A touch tap synthesizes a second "ghost" click on
    // this same button ~300ms later (compat mouse events target the touchstart
    // element), and a toggle would flip the sheet shut the instant it opened.
    // The button sits under the backdrop once open, so it can't close it anyway;
    // dismissal is via the backdrop, drag handle, or a menu link.
    function openMore(): void {
        moreOpen = true;
    }
</script>

<div class="mobile-nav">
    <nav class="bottom-tab-bar" aria-label="Mobile navigation">
        {#each TABS as [href, label, icon] (href)}
            <a
                {href}
                class={["bottom-tab", { "is-active": currentPath === href }]}
                aria-current={currentPath === href ? "page" : undefined}
                data-sound={currentPath === href ? "interaction.subtle" : "interaction.tap"}
            >
                <span class="bottom-tab-icon">{@html ICONS[icon]}</span>
                <span class="bottom-tab-label">{label}</span>
            </a>
        {/each}
        <button
            type="button"
            class={["bottom-tab", { "is-active": moreOpen }]}
            aria-label="More navigation"
            aria-expanded={moreOpen}
            aria-controls="mobile-more-menu"
            data-sound={moreOpen ? "overlay.close" : "overlay.open"}
            onclick={openMore}
        >
            <span class="bottom-tab-icon menu-morph" class:open={moreOpen} aria-hidden="true">
                <span class="menu-morph-line"></span>
                <span class="menu-morph-line"></span>
                <span class="menu-morph-line"></span>
            </span>
            <span class="bottom-tab-label">More</span>
        </button>
    </nav>

    <Drawer variant="nav" label="More navigation" bind:open={moreOpen} popupClass="more-sheet">
        <div id="mobile-more-menu" class="more-menu">
            <div class="more-menu-head">
                <span class="more-menu-title">More</span>
                <CtaButton href={siteConfig.socials.discord} target="_blank" rel="noreferrer" size="sm" onclick={closeMore}>Get a free key</CtaButton>
            </div>
            <nav class="more-menu-links" aria-label="More navigation">
                {#each MORE as [href, label, external, icon], index (href)}
                    {#if index === 6}
                        <div class="more-menu-divider" aria-hidden="true"></div>
                    {/if}
                    {#if external}
                        <a
                            {href}
                            class={["more-menu-link", { "is-active": currentPath === href }]}
                            target="_blank"
                            rel="noreferrer"
                            onclick={closeMore}
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">{icon}</span>
                            <span>{label}</span>
                        </a>
                    {:else}
                        <a
                            {href}
                            class={["more-menu-link", { "is-active": currentPath === href }]}
                            onclick={closeMore}
                        >
                            <span class="material-symbols-outlined" aria-hidden="true">{icon}</span>
                            <span>{label}</span>
                        </a>
                    {/if}
                {/each}
            </nav>
        </div>
    </Drawer>
</div>
