<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { soundPlay } from "@/shared/lib/sound/singleton";
    import { portal } from "@/shared/lib/portal";
    import CheckmarkIcon from "./icons/CheckmarkIcon.svelte";
    import ChevronDownIcon from "./icons/ChevronDownIcon.svelte";

    export interface DropdownMenuOption {
        value: string;
        label: string;
        count?: number;
        checked: boolean;
    }

    let {
        triggerLabel,
        valueLabel,
        activeCount,
        options,
        ontoggle,
    }: {
        triggerLabel: string;
        valueLabel: string;
        activeCount: number;
        options: DropdownMenuOption[];
        ontoggle?: (value: string) => void;
    } = $props();

    const menuId = $props.id();
    let open = $state(false);
    let closing = $state(false);
    let root: HTMLElement | undefined = $state();
    let trigger: HTMLButtonElement | undefined = $state();
    let menu: HTMLElement | undefined = $state();
    let panelStyle = $state("");
    let closeTimer: number | undefined;

    function menuItems(): HTMLButtonElement[] {
        return menu ? [...menu.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]')] : [];
    }

    function updatePosition(): void {
        const triggerEl = trigger;
        if (!triggerEl) return;
        const rect = triggerEl.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const MIN_H = 200;
        let top: number;
        let maxH: number;
        let origin: string;
        if (spaceBelow >= MIN_H || spaceBelow >= spaceAbove) {
            top = rect.bottom;
            maxH = Math.max(Math.min(spaceBelow - 8, 320), MIN_H);
            origin = "top center";
        } else {
            top = Math.max(8, rect.top - Math.min(spaceAbove - 8, 320));
            maxH = Math.max(Math.min(spaceAbove - 8, 320), MIN_H);
            origin = "bottom center";
        }
        panelStyle = `left:${rect.left}px;top:${top}px;width:${rect.width}px;--max-h:${maxH}px;--origin:${origin};`;
    }

    async function openMenu(focus: "first" | "last" = "first"): Promise<void> {
        if (closeTimer) {
            window.clearTimeout(closeTimer);
            closeTimer = undefined;
        }
        if (!open) soundPlay("overlay.expand");
        closing = false;
        open = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        updatePosition();
        const items = menuItems();
        (focus === "last" ? items.at(-1) : items[0])?.focus();
    }

    function toggleOpen(): void {
        if (open) close();
        else void openMenu();
    }

    function close(restoreFocus = false): void {
        if (!open) return;
        closing = true;
        if (closeTimer) window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(() => {
            open = false;
            closing = false;
            closeTimer = undefined;
        }, 150);
        if (restoreFocus) trigger?.focus();
    }

    function onTriggerKeydown(event: KeyboardEvent): void {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            void openMenu("first");
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            void openMenu("last");
        }
    }

    function onMenuKeydown(event: KeyboardEvent): void {
        const items = menuItems();
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        let next = index;
        if (event.key === "ArrowDown") next = (index + 1) % items.length;
        else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = items.length - 1;
        else if (event.key === "Escape") {
            event.preventDefault();
            close(true);
            return;
        } else if (event.key === "Tab") {
            close();
            return;
        } else {
            return;
        }
        event.preventDefault();
        items[next]?.focus();
    }

    function onDocumentClick(event: MouseEvent): void {
        if (open && root && !root.contains(event.target as Node) && menu && !menu.contains(event.target as Node)) close();
    }

    function onToggleOption(value: string): void {
        soundPlay("interaction.toggle");
        ontoggle?.(value);
    }

    // Attaches window scroll/resize listeners for exactly as long as the menu
    // panel is in the DOM \u2014 replaces `watch(open, ...)`.
    function trackPosition(_node: Element): { destroy(): void } {
        window.addEventListener("scroll", updatePosition, { passive: true });
        window.addEventListener("resize", updatePosition, { passive: true });
        return {
            destroy() {
                window.removeEventListener("scroll", updatePosition);
                window.removeEventListener("resize", updatePosition);
            },
        };
    }

    onMount(() => document.addEventListener("click", onDocumentClick));
    onDestroy(() => {
        if (typeof document !== "undefined") document.removeEventListener("click", onDocumentClick);
        if (closeTimer) window.clearTimeout(closeTimer);
    });
</script>

<div bind:this={root} class="kb-menu-root">
    <button
        bind:this={trigger}
        type="button"
        class={["catalog-filter-trigger", { "is-active": activeCount > 0 }]}
        aria-haspopup="menu"
        aria-expanded={open}
        data-expanded={open ? "" : undefined}
        aria-controls={menuId}
        onclick={toggleOpen}
        onkeydown={onTriggerKeydown}
    >
        <span class="catalog-filter-label">{triggerLabel}</span>
        <span class="catalog-filter-value">{valueLabel}</span>
        {#if activeCount > 0}
            <span class="catalog-filter-count">{activeCount}</span>
        {/if}
        <ChevronDownIcon class="kb-menu__chevron" />
    </button>
    <div use:portal={"body"}>
        {#if open}
            <div
                bind:this={menu}
                id={menuId}
                class={["catalog-filter-content", { "is-closing": closing }]}
                style={panelStyle}
                role="menu"
                aria-label={triggerLabel}
                onkeydown={onMenuKeydown}
                use:trackPosition
            >
                {#each options as option (option.value)}
                    <button
                        type="button"
                        role="menuitemcheckbox"
                        aria-checked={option.checked}
                        class={["catalog-filter-menu-item", { "is-active": option.checked }]}
                        onclick={() => onToggleOption(option.value)}
                    >
                        <span class="catalog-filter-checkbox">
                            {#if option.checked}
                                <CheckmarkIcon />
                            {/if}
                        </span>
                        <span class="catalog-filter-option-name">{option.label}</span>
                        {#if option.count !== undefined}
                            <span class="catalog-filter-option-count">{option.count}</span>
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .kb-menu-root {
        position: relative;
        display: inline-flex;
    }
    .catalog-filter-trigger[data-expanded] :global(.kb-menu__chevron) {
        transform: rotate(180deg);
    }

    /* ── Dropdown panel (teleported to body) ──
       UI laws applied:
       - Shadows over borders: elevated element uses shadow-ring, not 1px border
       - Concentric border radius: panel = radius-sm + padding
       - Interruptible animations: CSS transitions, not keyframes
       - Subtle exit: opacity + translateY, softer/shorter than enter
       - Transition only what changes: opacity, transform only */

    .catalog-filter-content {
        position: fixed;
        z-index: 10000;
        padding: 4px;
        max-height: var(--max-h, 320px);
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        border-radius: calc(var(--radius-sm) + 4px);
        background: var(--sk-shell-bg);
        box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.06),
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 10px 15px -3px rgba(0, 0, 0, 0.2),
            0 0 6px 0px rgba(0, 0, 0, 0.15);
        transform-origin: var(--origin, top center);
        opacity: 1;
        transform: scale(1) translateY(0);
        transition-property: opacity, transform;
        transition-duration: 150ms;
        transition-timing-function: var(--ease-out-smooth);
    }

    .catalog-filter-content.is-closing {
        opacity: 0;
        transform: scale(0.97) translateY(-4px);
        transition-duration: 120ms;
        transition-timing-function: var(--ease-in-smooth);
    }

    .catalog-filter-content::-webkit-scrollbar {
        width: 5px;
    }
    .catalog-filter-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
    }

    .catalog-filter-content .catalog-filter-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        min-height: 36px;
        padding: 7px 10px;
        border: 0;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 0.78rem;
        cursor: pointer;
        transition-property: background, color;
        transition-duration: 120ms;
        transition-timing-function: var(--ease-out-smooth);
        user-select: none;
    }
    .catalog-filter-content .catalog-filter-menu-item:hover {
        background: rgba(255, 255, 255, 0.04);
    }
    .catalog-filter-content .catalog-filter-menu-item:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: -2px;
    }
    .catalog-filter-content .catalog-filter-menu-item.is-active {
        color: var(--accent-text);
        text-shadow: var(--accent-text-glow);
        background: var(--accent-muted);
    }
    .catalog-filter-content .catalog-filter-checkbox {
        flex: 0 0 16px;
        width: 16px;
        color: var(--accent);
    }
    .catalog-filter-content .catalog-filter-option-name {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .catalog-filter-content .catalog-filter-option-count {
        flex: 0 0 auto;
        color: var(--dim);
        font-variant-numeric: tabular-nums;
    }

    /* ── Trigger: scale on press (UI law #12) ── */
    .catalog-filter-trigger {
        transition-property: border-color, box-shadow, transform;
        transition-duration: 150ms;
        transition-timing-function: var(--ease-out-smooth);
    }
    .catalog-filter-trigger:active {
        scale: 0.97;
    }
    .catalog-filter-trigger :global(.kb-menu__chevron) {
        transition: transform 200ms var(--ease-out-smooth);
    }
</style>
