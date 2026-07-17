<script setup lang="ts">
import { computed, ref } from "vue";
import type { PaidModel, PaidModelGroup } from "@/entities/paid-plan";
import { formatTokens, siteModelContextWindow } from "@/shared/lib/format";
import { DropdownMenu, TextField } from "@/shared/ui";
import type { DropdownMenuOption } from "@/shared/ui";

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

const prefixOptions = computed<DropdownMenuOption[]>(() => [
    { value: "all", label: `All prefixes`, count: rows.value.length, checked: prefix.value === "all" },
    ...prefixCounts.value.map(([id, count]) => ({ value: id, label: `${id}/*`, count, checked: prefix.value === id })),
]);

const routeOptions = computed<DropdownMenuOption[]>(() => [
    { value: "all", label: `All routes`, count: rows.value.length, checked: route.value === "all" },
    ...routeCounts.value.map(([name, count]) => ({ value: name, label: name, count, checked: route.value === name })),
]);

const costOptions = computed<DropdownMenuOption[]>(() => [
    { value: "all", label: `All costs`, count: rows.value.length, checked: cost.value === "all" },
    ...costCounts.value.map(([amount, count]) => ({ value: String(amount), label: `${formatCost(amount)} unit${amount === 1 ? "" : "s"}`, count, checked: cost.value === String(amount) })),
]);

function togglePrefix(v: string): void { prefix.value = prefix.value === v ? "all" : v; }
function toggleRoute(v: string): void { route.value = route.value === v ? "all" : v; }
function toggleCost(v: string): void { cost.value = cost.value === v ? "all" : v; }

const costLabel = computed(() => costOptions.value.find((o) => o.value === cost.value)?.label ?? "All costs");

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
                <TextField class="catalog-search-input" :model-value="query" placeholder="Search paid aliases..." @update:model-value="(v) => (query = v)" />
            </div>
            <div class="catalog-filter-group" aria-label="Paid model filters">
                <DropdownMenu trigger-label="Prefix" :value-label="prefix === 'all' ? 'All prefixes' : prefix + '/*'" :active-count="prefix !== 'all' ? 1 : 0" :options="prefixOptions" @toggle="togglePrefix" />
                <DropdownMenu trigger-label="Route" :value-label="route === 'all' ? 'All routes' : route" :active-count="route !== 'all' ? 1 : 0" :options="routeOptions" @toggle="toggleRoute" />
                <DropdownMenu trigger-label="Cost" :value-label="cost === 'all' ? 'All costs' : costLabel" :active-count="cost !== 'all' ? 1 : 0" :options="costOptions" @toggle="toggleCost" />
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
