<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { HealthPayload, ProviderHealth, ProviderStatus } from "@/entities/provider";
    import { PROVIDER_ORDER, STATUS_LABELS, STATUS_OPTIONS } from "@/entities/provider";
    import { siteConfig } from "@/shared/config/site";
    import { DropdownMenu, TextField } from "@/shared/ui";
    import type { DropdownMenuOption } from "@/shared/ui";
    import StatusCard from "./StatusCard.svelte";
    import ProviderPopover from "./ProviderPopover.svelte";
    import StatusOverview from "./StatusOverview.svelte";

    let health = $state<HealthPayload | null>(null);
    let loadedAt = $state<Date | null>(null);
    let failed = $state(false);
    let selectedPrefix = $state<string | null>(null);
    let query = $state("");
    let prefixFilters = $state<Set<string>>(new Set());
    let statusFilter = $state<Set<ProviderStatus>>(new Set());
    let interval: number | undefined;

    function togglePrefix(prefix: string): void {
        const next = new Set(prefixFilters);
        if (next.has(prefix)) next.delete(prefix);
        else next.add(prefix);
        prefixFilters = next;
    }

    function toggleStatus(status: string): void {
        const key = status as ProviderStatus;
        const next = new Set(statusFilter);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        statusFilter = next;
    }

    async function fetchHealth(): Promise<void> {
        try {
            const response = await fetch(`${siteConfig.socials.api}/v1/health`, { cache: "no-store" });
            if (!response.ok) throw new Error(`health ${response.status}`);
            health = await response.json();
            loadedAt = new Date();
            failed = false;
        } catch (error) {
            console.error("Failed to load provider health", error);
            failed = true;
        }
    }

    onMount(() => {
        fetchHealth();
        interval = window.setInterval(fetchHealth, 30000);
    });
    onDestroy(() => {
        if (interval) window.clearInterval(interval);
    });

    function openPopover(prefix: string): void {
        selectedPrefix = prefix;
    }
    function closePopover(): void {
        selectedPrefix = null;
    }

    const providers = $derived.by(() => {
        const items = [...(health?.providers ?? [])];
        return items.sort((left, right) => {
            const leftIndex = PROVIDER_ORDER.indexOf(left.prefix);
            const rightIndex = PROVIDER_ORDER.indexOf(right.prefix);
            if (leftIndex !== -1 || rightIndex !== -1) {
                return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
            }
            return left.prefix.localeCompare(right.prefix);
        });
    });

    const prefixCounts = $derived.by((): [string, number][] => {
        const m = new Map<string, number>();
        for (const { prefix } of providers) m.set(prefix, (m.get(prefix) ?? 0) + 1);
        return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    });

    const statusCounts = $derived.by(() => {
        const counts: Record<ProviderStatus, number> = { up: 0, degraded: 0, down: 0, unknown: 0 };
        for (const p of providers) counts[p.status]++;
        return counts;
    });

    const filteredProviders = $derived.by(() => {
        let items = providers;
        const q = query.trim().toLowerCase();
        if (q) items = items.filter((p) => p.prefix.toLowerCase().includes(q));
        if (prefixFilters.size > 0) items = items.filter((p) => prefixFilters.has(p.prefix));
        if (statusFilter.size > 0) items = items.filter((p) => statusFilter.has(p.status));
        return items;
    });

    const selectedProvider = $derived.by((): ProviderHealth | null => {
        if (!selectedPrefix) return null;
        return providers.find((p) => p.prefix === selectedPrefix) ?? null;
    });

    const prefixButtonLabel = $derived.by(() => {
        if (prefixFilters.size === 0) return "All prefixes";
        if (prefixFilters.size === 1) return `${[...prefixFilters][0]}/*`;
        return `${prefixFilters.size} prefixes`;
    });

    const statusButtonLabel = $derived.by(() => {
        if (statusFilter.size === 0) return "All statuses";
        if (statusFilter.size === 1) return STATUS_LABELS[[...statusFilter][0]];
        return `${statusFilter.size} statuses`;
    });

    const total = $derived(providers.length);
    const healthy = $derived(providers.filter((p) => p.status === "up").length);
    const degraded = $derived(providers.filter((p) => p.status === "degraded").length);
    const down = $derived(providers.filter((p) => p.status === "down").length);
    const affected = $derived(degraded + down);

    const overallState = $derived(affected === 0 ? "healthy" : down > 0 ? "down" : "degraded");
    const stateText = $derived(
        affected === 0
            ? "All providers operational"
            : down > 0
              ? `${down.toLocaleString()} provider${down === 1 ? "" : "s"} down`
              : `${degraded.toLocaleString()} provider${degraded === 1 ? "" : "s"} degraded`,
    );

    const filtersActive = $derived(query.trim() !== "" || prefixFilters.size > 0 || statusFilter.size > 0);

    const resultLabel = $derived.by(() => {
        const count = filteredProviders.length;
        return `${count.toLocaleString()} ${count === 1 ? "provider" : "providers"}`;
    });

    function clearFilters(): void {
        query = "";
        prefixFilters = new Set();
        statusFilter = new Set();
    }

    const prefixMenuOptions = $derived<DropdownMenuOption[]>(
        prefixCounts.map(([pfx, count]) => ({ value: pfx, label: `${pfx}/*`, count, checked: prefixFilters.has(pfx) })),
    );

    const statusMenuOptions = $derived<DropdownMenuOption[]>(
        STATUS_OPTIONS.map((status) => ({ value: status, label: STATUS_LABELS[status], count: statusCounts[status], checked: statusFilter.has(status) })),
    );

    function onQueryChange(value: string): void {
        query = value;
    }
</script>

<div class="status-board">
    {#if failed}
        <div class="status-alert">Health data did not load. Retrying automatically.</div>
    {/if}

    {#if providers.length > 0}
        <div class="status-bar">
            <span class={`status-bar-state is-${overallState}`}>{stateText}</span>
            <div class="status-bar-counts">
                <span class="is-healthy-count"><strong>{healthy}</strong> healthy</span>
                <span class="is-degraded-count"><strong>{degraded}</strong> degraded</span>
                <span class="is-down-count"><strong>{down}</strong> down</span>
                <span><strong>{total}</strong> total</span>
            </div>
        </div>

        <StatusOverview {providers} />

        <div class="catalog-toolbar">
            <div class="catalog-search-field">
                <TextField class="catalog-search-input" value={query} placeholder="Search providers..." oninput={(e) => onQueryChange((e.target as HTMLInputElement).value)} />
            </div>
            <div class="catalog-filter-group" aria-label="Provider filters">
                <DropdownMenu
                    triggerLabel="Prefix"
                    valueLabel={prefixButtonLabel}
                    activeCount={prefixFilters.size}
                    options={prefixMenuOptions}
                    ontoggle={togglePrefix}
                />
                <DropdownMenu
                    triggerLabel="Status"
                    valueLabel={statusButtonLabel}
                    activeCount={statusFilter.size}
                    options={statusMenuOptions}
                    ontoggle={toggleStatus}
                />
            </div>
        </div>

        <div class="catalog-summary" aria-live="polite">
            <span>{resultLabel}</span>
            {#if filtersActive}
                <button type="button" data-sound="interaction.subtle" onclick={clearFilters}>Clear filters</button>
            {/if}
        </div>

        <div class="status-grid">
            {#if filteredProviders.length > 0}
                {#each filteredProviders as provider (provider.prefix)}
                    <StatusCard
                        {provider}
                        isSelected={selectedPrefix === provider.prefix}
                        onselect={() => openPopover(provider.prefix)}
                        onclose={closePopover}
                    />
                {/each}
            {:else}
                <div class="status-grid-empty">
                    No providers match your filters.
                    <button type="button" class="status-grid-empty-clear" data-sound="interaction.subtle" onclick={clearFilters}>Clear filters</button>
                </div>
            {/if}
        </div>
    {:else}
        <div class="status-grid">
            <article class="status-card is-unknown" aria-live="polite">
                <div class="status-card-top">
                    <strong>providers/</strong>
                    <span>loading</span>
                </div>
                <div class="status-card-main">
                    <span>...</span>
                    <small>models</small>
                </div>
                <div class="status-card-blast-slot"></div>
                <div class="status-card-meta">
                    <span>30m errors</span>
                    <strong>...</strong>
                    <span>requests</span>
                    <strong>...</strong>
                </div>
            </article>
        </div>
    {/if}


    {#if selectedProvider}
        <ProviderPopover provider={selectedProvider} onclose={closePopover} />
    {/if}

    <div class="status-footnote">
        Updated {loadedAt ? loadedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "..."}.
    </div>
</div>
