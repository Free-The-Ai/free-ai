<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/state";
    import { CATEGORY_LABELS, CATEGORY_ORDER, SETUP_GUIDES, setupGuidesByCategory } from "@/entities/setup-guide";
    import { siteConfig } from "@/shared/config/site";
    import { DitherButton, Logo } from "@/shared/ui";

    const currentPath = $derived(page.url.pathname as string);

    const navLinks: [string, string][] = [
        ["/home", "Home"],
        ["/docs", "Docs"],
        ["/models", "Models"],
        ["/pricing", "Pricing"],
        ["/status", "Status"],
    ];

    const setupCategories = setupGuidesByCategory();
    const setupGuideCount = SETUP_GUIDES.length;
    const isSetupActive = $derived(currentPath === "/setup" || currentPath.startsWith("/setup/"));

    let dropdownOpen = $state(false);
    let dropdownRoot: HTMLElement | undefined = $state();
    let triggerEl: HTMLButtonElement | undefined = $state();

    function toggleDropdown(): void {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown(): void {
        dropdownOpen = false;
    }

    function onDocumentClick(event: MouseEvent): void {
        if (dropdownOpen && dropdownRoot && !dropdownRoot.contains(event.target as Node)) closeDropdown();
    }

    function onDocumentKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape" && dropdownOpen) {
            closeDropdown();
            triggerEl?.focus();
        }
    }

    function onPanelFocusOut(event: FocusEvent): void {
        const panel = event.currentTarget as HTMLElement;
        const related = event.relatedTarget as Node | null;
        if (!panel.contains(related) && !dropdownRoot?.querySelector(".nav-dropdown-trigger")?.contains(related)) closeDropdown();
    }

    let themeToggleEl: HTMLButtonElement | undefined = $state();

    function onThemeToggle(): void {
        const toggle = (window as unknown as { __themeToggle?: () => string }).__themeToggle;
        if (!toggle) return;
        const scheme = toggle();
        themeToggleEl?.setAttribute("data-scheme", scheme);
    }

    onMount(() => {
        document.addEventListener("click", onDocumentClick);
        document.addEventListener("keydown", onDocumentKeydown);
    });
    onDestroy(() => {
        if (typeof document === "undefined") return;
        document.removeEventListener("click", onDocumentClick);
        document.removeEventListener("keydown", onDocumentKeydown);
    });
</script>

<header class="site-header">
    <nav class="nav" aria-label="Main navigation">
        <a class="brand" href="/home"><Logo width={160} /></a>
        <div class="nav-links">
            {#each navLinks as [href, label] (href)}
                <a {href} class={{ "is-active": currentPath === href }} aria-current={currentPath === href ? "page" : undefined}>
                    {label}
                </a>
            {/each}
            <div bind:this={dropdownRoot} class={["nav-dropdown", { "is-active": isSetupActive, "is-open": dropdownOpen }]}>
                <button
                    bind:this={triggerEl}
                    type="button"
                    class={["nav-dropdown-trigger", { "is-active": isSetupActive }]}
                    aria-haspopup="true"
                    aria-controls="setup-guides-menu"
                    aria-expanded={dropdownOpen}
                    onclick={toggleDropdown}
                >
                    Setup
                    <span class="nav-dropdown-caret" aria-hidden="true"></span>
                </button>
                <div id="setup-guides-menu" class="nav-dropdown-panel" aria-label="Setup guides" onfocusout={onPanelFocusOut}>
                    <div class="nav-dropdown-head">
                        <a href="/setup" class="nav-dropdown-head-link">
                            <strong>Setup guides</strong>
                            <span>{setupGuideCount} apps and clients</span>
                        </a>
                    </div>
                    {#each CATEGORY_ORDER as category (category)}
                        {#if setupCategories[category]?.length}
                            <div class="nav-dropdown-group">
                                <span class="nav-dropdown-group-label">{CATEGORY_LABELS[category]}</span>
                                {#each setupCategories[category] as guide (guide.slug)}
                                    <a href={`/setup/${guide.slug}`} class="nav-dropdown-item">
                                        {#if guide.logoUrl}
                                            <img src={guide.logoUrl} alt="" class="nav-dropdown-icon" width="16" height="16" loading="lazy" />
                                        {/if}
                                        <strong>{guide.name}</strong>
                                        <span>{guide.tagline}</span>
                                    </a>
                                {/each}
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
            <a href={siteConfig.socials.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <div class="nav-actions">
            <button bind:this={themeToggleEl} type="button" class="theme-toggle" aria-label="Toggle color scheme" title="Toggle theme" onclick={onThemeToggle}>
                <span class="theme-toggle-icon" aria-hidden="true">◎</span>
            </button>
            <DitherButton
                href={siteConfig.socials.discord}
                target="_blank"
                rel="noreferrer"
                color="blue"
                size="sm"
                data-sound="interaction.confirm"
            >Join Discord</DitherButton>
            <DitherButton
                href={siteConfig.socials.donate}
                target="_blank"
                rel="noreferrer"
                color="pink"
                size="sm"
                data-sound="interaction.confirm"
                aria-label="Donate to FreeTheAi on Buy Me a Coffee"
            >
                <span class="donate-button-icon" aria-hidden="true">&#9829;</span>
                Donate
            </DitherButton>
        </div>
    </nav>
</header>
