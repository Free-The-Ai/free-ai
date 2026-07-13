<script setup lang="ts">
import { computed, ref } from "vue";
import type { PaidModel, PaidModelGroup } from "@/entities/paid-plan";
import { formatTokens, siteModelContextWindow } from "@/shared/lib/format";
import { Select, TextField } from "@/shared/ui";
import type { SelectOption } from "@/shared/ui";

interface Row extends PaidModel {
    prefix: string;
    groupLabel: string;
}

const props = defineProps<{ groups: PaidModelGroup[]; activePlan?: string }>();

const query = ref("");
const prefix = ref("all");
const route = ref("all");
const cost = ref("all");

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const formatCost = (value: number): string => (Number.isInteger(value) ? String(value) : String(value));

function computeCounts<T>(rows: Row[], keyFn: (r: Row) => T, sortFn: (a: [T, number], b: [T, number]) => number): [T, number][] {
    const counts = new Map<T, number>();
    for (const row of rows) counts.set(keyFn(row), (counts.get(keyFn(row)) ?? 0) + 1);
    return [...counts.entries()].sort(sortFn);
}

const rows = computed<Row[]>(() =>
    props.groups.flatMap((group) =>
        group.models
            .filter((model) => !props.activePlan || (model.plans ?? []).includes(props.activePlan))
            .map((model) => ({ ...model, prefix: group.id, groupLabel: group.label })),
    ),
);

const prefixCounts = computed(() => computeCounts(rows.value, (r) => r.prefix, (a, b) => collator.compare(a[0] as string, b[0] as string)));
const routeCounts = computed(() => computeCounts(rows.value, (r) => r.route, (a, b) => collator.compare(a[0] as string, b[0] as string)));
const costCounts = computed(() => computeCounts(rows.value, (r) => r.unit_cost, (a, b) => (a[0] as number) - (b[0] as number)));

const filteredRows = computed(() => {
    const q = query.value.trim().toLowerCase();
    return rows.value
        .filter((row) => prefix.value === "all" || row.prefix === prefix.value)
        .filter((row) => route.value === "all" || row.route === route.value)
        .filter((row) => cost.value === "all" || row.unit_cost === Number(cost.value))
        .filter((row) => !q || row.id.toLowerCase().includes(q))
        .sort((a, b) => a.unit_cost - b.unit_cost || collator.compare(a.id, b.id));
});

const prefixOptions = computed<SelectOption[]>(() => [
    { value: "all", label: `All prefixes · ${rows.value.length}` },
    ...prefixCounts.value.map(([id, count]) => ({ value: id, label: `${id}/* · ${count}` })),
]);

const routeOptions = computed<SelectOption[]>(() => [
    { value: "all", label: `All routes · ${rows.value.length}` },
    ...routeCounts.value.map(([name, count]) => ({ value: name, label: `${name} · ${count}` })),
]);

const costOptions = computed<SelectOption[]>(() => [
    { value: "all", label: `All costs · ${rows.value.length}` },
    ...costCounts.value.map(([amount, count]) => ({ value: String(amount), label: `${formatCost(amount)} unit${amount === 1 ? "" : "s"} · ${count}` })),
]);

function clearFilters(): void {
    query.value = "";
    prefix.value = "all";
    route.value = "all";
    cost.value = "all";
}

const filtersActive = computed(() => query.value.trim() !== "" || prefix.value !== "all" || route.value !== "all" || cost.value !== "all");

const resultLabel = computed(() => {
    const count = filteredRows.value.length;
    const plural = count === 1 ? "paid alias" : "paid aliases";
    return `${count.toLocaleString()} ${plural} across ${props.activePlan ? props.activePlan : "all plans"}`;
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
</script>

<template>
    <div class="paid-table-panel">
        <div class="catalog-toolbar">
            <div class="catalog-search-field">
                <span class="material-symbols-outlined catalog-search-icon">search</span>
                <TextField class="catalog-search-input" :model-value="query" placeholder="Search paid aliases..." @update:model-value="(v) => (query = v)" />
            </div>
            <div class="catalog-filter-group" aria-label="Paid model filters">
                <Select class-name="catalog-filter-trigger" label="Prefix" :options="prefixOptions" :model-value="prefix" @update:model-value="(v) => (prefix = v || 'all')" placeholder="All prefixes" />
                <Select class-name="catalog-filter-trigger" label="Route" :options="routeOptions" :model-value="route" @update:model-value="(v) => (route = v || 'all')" placeholder="All routes" />
                <Select class-name="catalog-filter-trigger" label="Cost" :options="costOptions" :model-value="cost" @update:model-value="(v) => (cost = v || 'all')" placeholder="All costs" />
            </div>
        </div>

        <div class="catalog-summary" aria-live="polite">
            <span>{{ resultLabel }}</span>
            <button v-if="filtersActive" type="button" data-sound="interaction.subtle" @click="clearFilters">Clear filters</button>
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
            <template v-if="filteredRows.length > 0">
                <div v-for="model in filteredRows" :key="model.id" class="paid-model-row" role="row">
                    <span class="paid-model-name" data-label="Model">
                        <code>{{ model.id }}</code>
                        <span v-if="siteModelContextWindow(model) > 0 || model.max_output_tokens !== undefined || model.supports_images" class="paid-model-meta">
                            <span v-if="siteModelContextWindow(model) > 0" class="model-chip" title="Total context window">
                                <span class="model-chip-label">Ctx</span>
                                <strong>{{ formatTokens(siteModelContextWindow(model)) }}</strong>
                            </span>
                            <span v-if="model.max_output_tokens !== undefined" class="model-chip" title="Maximum output tokens">
                                <span class="model-chip-label">Out</span>
                                <strong>{{ formatTokens(model.max_output_tokens) }}</strong>
                            </span>
                            <span v-if="model.supports_images" class="model-chip is-images" title="Supports image inputs or generation">
                                <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                                Images
                            </span>
                        </span>
                    </span>
                    <span class="pricing-route-pill" data-label="Prefix">{{ model.prefix ?? model.id }}/*</span>
                    <span class="pricing-route-pill" data-label="Route">{{ model.route }}</span>
                    <span class="paid-model-plans" data-label="Plan">
                        <span v-for="plan in model.plans ?? []" :key="plan" class="pricing-route-pill">{{ plan }}</span>
                    </span>
                    <strong data-label="Unit cost">{{ model.unit_label }}</strong>
                    <button
                        class="copy-btn pricing-model-copy"
                        type="button"
                        :title="`Copy ${model.id}`"
                        data-label="Copy"
                        @click="(e) => copyModel(model, e.currentTarget as HTMLElement)"
                    >
                        <code class="sr-only">{{ model.id }}</code>
                        <span class="material-symbols-outlined">content_copy</span>
                    </button>
                </div>
            </template>
            <div v-else class="paid-model-empty">No paid aliases match your filters.</div>
        </div>
    </div>
</template>
