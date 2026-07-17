<script lang="ts">
    import type { PaidModel, PaidModelGroup } from "@/entities/paid-plan";
    import { formatTokens, siteModelContextWindow } from "@/shared/lib/format";
    import { DropdownMenu, TextField } from "@/shared/ui";
    import type { DropdownMenuOption } from "@/shared/ui";

    interface Row extends PaidModel {
        prefix: string;
        groupLabel: string;
    }

    let { groups, activePlan }: { groups: PaidModelGroup[]; activePlan?: string } = $props();

    let query = $state("");
    let prefix = $state("all");
    let route = $state("all");
    let cost = $state("all");

    const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
    const formatCost = (value: number): string => (Number.isInteger(value) ? String(value) : String(value));

    function computeCounts<T>(rows: Row[], keyFn: (r: Row) => T, sortFn: (a: [T, number], b: [T, number]) => number): [T, number][] {
        const counts = new Map<T, number>();
        for (const row of rows) counts.set(keyFn(row), (counts.get(keyFn(row)) ?? 0) + 1);
        return [...counts.entries()].sort(sortFn);
    }

    const rows = $derived.by((): Row[] =>
        groups.flatMap((group) =>
            group.models
                .filter((model) => !activePlan || (model.plans ?? []).includes(activePlan))
                .map((model) => ({ ...model, prefix: group.id, groupLabel: group.label })),
        ),
    );

    const prefixCounts = $derived(computeCounts(rows, (r) => r.prefix, (a, b) => collator.compare(a[0] as string, b[0] as string)));
    const routeCounts = $derived(computeCounts(rows, (r) => r.route, (a, b) => collator.compare(a[0] as string, b[0] as string)));
    const costCounts = $derived(computeCounts(rows, (r) => r.unit_cost, (a, b) => (a[0] as number) - (b[0] as number)));

    const filteredRows = $derived.by(() => {
        const q = query.trim().toLowerCase();
        return rows
            .filter((row) => prefix === "all" || row.prefix === prefix)
            .filter((row) => route === "all" || row.route === route)
            .filter((row) => cost === "all" || row.unit_cost === Number(cost))
            .filter((row) => !q || row.id.toLowerCase().includes(q))
            .sort((a, b) => a.unit_cost - b.unit_cost || collator.compare(a.id, b.id));
    });

    const prefixOptions = $derived<DropdownMenuOption[]>([
        { value: "all", label: `All prefixes`, count: rows.length, checked: prefix === "all" },
        ...prefixCounts.map(([id, count]) => ({ value: id, label: `${id}/*`, count, checked: prefix === id })),
    ]);

    const routeOptions = $derived<DropdownMenuOption[]>([
        { value: "all", label: `All routes`, count: rows.length, checked: route === "all" },
        ...routeCounts.map(([name, count]) => ({ value: name, label: name, count, checked: route === name })),
    ]);

    const costOptions = $derived<DropdownMenuOption[]>([
        { value: "all", label: `All costs`, count: rows.length, checked: cost === "all" },
        ...costCounts.map(([amount, count]) => ({ value: String(amount), label: `${formatCost(amount)} unit${amount === 1 ? "" : "s"}`, count, checked: cost === String(amount) })),
    ]);

    function togglePrefix(v: string): void { prefix = prefix === v ? "all" : v; }
    function toggleRoute(v: string): void { route = route === v ? "all" : v; }
    function toggleCost(v: string): void { cost = cost === v ? "all" : v; }

    const costLabel = $derived(costOptions.find((o) => o.value === cost)?.label ?? "All costs");

    function clearFilters(): void {
        query = "";
        prefix = "all";
        route = "all";
        cost = "all";
    }

    const filtersActive = $derived(query.trim() !== "" || prefix !== "all" || route !== "all" || cost !== "all");

    const resultLabel = $derived.by(() => {
        const count = filteredRows.length;
        const plural = count === 1 ? "paid alias" : "paid aliases";
        return `${count.toLocaleString()} ${plural} across ${activePlan ? activePlan : "all plans"}`;
    });

    function copyModel(model: PaidModel, button: HTMLElement): void {
        navigator.clipboard.writeText(model.id).catch((error) => {
            console.error("Failed to copy paid model alias", error);
        });
        const icon = button.querySelector(".material-symbols-outlined");
        if (!icon) return;
        icon.textContent = "check";
        setTimeout(() => {
            icon.textContent = "content_copy";
        }, 1500);
    }

    function onQueryChange(value: string): void {
        query = value;
    }
</script>

<div class="paid-table-panel">
    <div class="catalog-toolbar">
        <div class="catalog-search-field">
            <TextField class="catalog-search-input" value={query} placeholder="Search paid aliases..." oninput={(e) => onQueryChange((e.target as HTMLInputElement).value)} />
        </div>
        <div class="catalog-filter-group" aria-label="Paid model filters">
            <DropdownMenu triggerLabel="Prefix" valueLabel={prefix === "all" ? "All prefixes" : prefix + "/*"} activeCount={prefix !== "all" ? 1 : 0} options={prefixOptions} ontoggle={togglePrefix} />
            <DropdownMenu triggerLabel="Route" valueLabel={route === "all" ? "All routes" : route} activeCount={route !== "all" ? 1 : 0} options={routeOptions} ontoggle={toggleRoute} />
            <DropdownMenu triggerLabel="Cost" valueLabel={cost === "all" ? "All costs" : costLabel} activeCount={cost !== "all" ? 1 : 0} options={costOptions} ontoggle={toggleCost} />
        </div>
    </div>

    <div class="catalog-summary" aria-live="polite">
        <span>{resultLabel}</span>
        {#if filtersActive}
            <button type="button" data-sound="interaction.subtle" onclick={clearFilters}>Clear filters</button>
        {/if}
    </div>

    <div class="paid-model-table" role="table" aria-label="Paid model unit costs">
        <div class="paid-model-row paid-model-row-head" role="row">
            <span data-label="Model">Model</span>
            <span data-label="Prefix">Prefix</span>
            <span data-label="Route">Route</span>
            <span data-label="Plan">Plan</span>
            <span data-label="Unit cost">Unit cost</span>
            <span data-label="Copy">Copy</span>
        </div>
        {#if filteredRows.length > 0}
            {#each filteredRows as model (model.id)}
                <div class="paid-model-row" role="row">
                    <span class="paid-model-name" data-label="Model">
                        <code>{model.id}</code>
                        {#if siteModelContextWindow(model) > 0 || model.max_output_tokens !== undefined || model.supports_images}
                            <span class="paid-model-meta">
                                {#if siteModelContextWindow(model) > 0}
                                    <span class="model-chip" title="Total context window">
                                        <span class="model-chip-label">Ctx</span>
                                        <strong>{formatTokens(siteModelContextWindow(model))}</strong>
                                    </span>
                                {/if}
                                {#if model.max_output_tokens !== undefined}
                                    <span class="model-chip" title="Maximum output tokens">
                                        <span class="model-chip-label">Out</span>
                                        <strong>{formatTokens(model.max_output_tokens)}</strong>
                                    </span>
                                {/if}
                                {#if model.supports_images}
                                    <span class="model-chip is-images" title="Supports image inputs or generation">
                                        <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                                        Images
                                    </span>
                                {/if}
                            </span>
                        {/if}
                    </span>
                    <span class="pricing-route-pill" data-label="Prefix">{model.prefix ?? model.id}/*</span>
                    <span class="pricing-route-pill" data-label="Route">{model.route}</span>
                    <span class="paid-model-plans" data-label="Plan">
                        {#each model.plans ?? [] as plan (plan)}
                            <span class="pricing-route-pill">{plan}</span>
                        {/each}
                    </span>
                    <strong data-label="Unit cost">{model.unit_label}</strong>
                    <button
                        class="copy-btn pricing-model-copy"
                        type="button"
                        title={`Copy ${model.id}`}
                        data-label="Copy"
                        onclick={(e) => copyModel(model, e.currentTarget as HTMLElement)}
                    >
                        <code class="sr-only">{model.id}</code>
                        <span class="material-symbols-outlined">content_copy</span>
                    </button>
                </div>
            {/each}
        {:else}
            <div class="paid-model-empty">No paid aliases match your filters.</div>
        {/if}
    </div>
</div>
