<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { HealthPayload, ProviderHealth, ProviderStatus } from "@/entities/provider";
import { PROVIDER_ORDER, STATUS_LABELS, STATUS_OPTIONS } from "@/entities/provider";
import { siteConfig } from "@/shared/config/site";
import { DropdownMenu, TextField } from "@/shared/ui";
import type { DropdownMenuOption } from "@/shared/ui";
import StatusCard from "./StatusCard.vue";
import ProviderPopover from "./ProviderPopover.vue";

const health = ref<HealthPayload | null>(null);
const loadedAt = ref<Date | null>(null);
const failed = ref(false);
const selectedPrefix = ref<string | null>(null);
const query = ref("");
const prefixFilters = ref<Set<string>>(new Set());
const statusFilter = ref<Set<ProviderStatus>>(new Set());
let interval: number | undefined;

function togglePrefix(prefix: string): void {
    const next = new Set(prefixFilters.value);
    if (next.has(prefix)) next.delete(prefix);
    else next.add(prefix);
    prefixFilters.value = next;
}

function toggleStatus(status: string): void {
    const key = status as ProviderStatus;
    const next = new Set(statusFilter.value);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    statusFilter.value = next;
}

async function fetchHealth(): Promise<void> {
    try {
        const response = await fetch(`${siteConfig.socials.api}/v1/health`, { cache: "no-store" });
        if (!response.ok) throw new Error(`health ${response.status}`);
        health.value = await response.json();
        loadedAt.value = new Date();
        failed.value = false;
    } catch (error) {
        console.error("Failed to load provider health", error);
        failed.value = true;
    }
}

onMounted(() => {
    fetchHealth();
    interval = window.setInterval(fetchHealth, 30000);
});
onBeforeUnmount(() => {
    if (interval) window.clearInterval(interval);
});

function openPopover(prefix: string): void {
    selectedPrefix.value = prefix;
}
function closePopover(): void {
    selectedPrefix.value = null;
}

const providers = computed(() => {
    const items = [...(health.value?.providers ?? [])];
    return items.sort((left, right) => {
        const leftIndex = PROVIDER_ORDER.indexOf(left.prefix);
        const rightIndex = PROVIDER_ORDER.indexOf(right.prefix);
        if (leftIndex !== -1 || rightIndex !== -1) {
            return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
        }
        return left.prefix.localeCompare(right.prefix);
    });
});

const prefixCounts = computed<[string, number][]>(() => {
    const m = new Map<string, number>();
    for (const { prefix } of providers.value) m.set(prefix, (m.get(prefix) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
});

const statusCounts = computed(() => {
    const counts: Record<ProviderStatus, number> = { up: 0, degraded: 0, down: 0, unknown: 0 };
    for (const p of providers.value) counts[p.status]++;
    return counts;
});

const filteredProviders = computed(() => {
    let items = providers.value;
    const q = query.value.trim().toLowerCase();
    if (q) items = items.filter((p) => p.prefix.toLowerCase().includes(q));
    if (prefixFilters.value.size > 0) items = items.filter((p) => prefixFilters.value.has(p.prefix));
    if (statusFilter.value.size > 0) items = items.filter((p) => statusFilter.value.has(p.status));
    return items;
});

const selectedProvider = computed<ProviderHealth | null>(() => {
    if (!selectedPrefix.value) return null;
    return providers.value.find((p) => p.prefix === selectedPrefix.value) ?? null;
});

const prefixButtonLabel = computed(() => {
    if (prefixFilters.value.size === 0) return "All prefixes";
    if (prefixFilters.value.size === 1) return `${[...prefixFilters.value][0]}/*`;
    return `${prefixFilters.value.size} prefixes`;
});

const statusButtonLabel = computed(() => {
    if (statusFilter.value.size === 0) return "All statuses";
    if (statusFilter.value.size === 1) return STATUS_LABELS[[...statusFilter.value][0]];
    return `${statusFilter.value.size} statuses`;
});

const total = computed(() => providers.value.length);
const healthy = computed(() => providers.value.filter((p) => p.status === "up").length);
const degraded = computed(() => providers.value.filter((p) => p.status === "degraded").length);
const down = computed(() => providers.value.filter((p) => p.status === "down").length);
const affected = computed(() => degraded.value + down.value);

const overallState = computed(() => (affected.value === 0 ? "healthy" : down.value > 0 ? "down" : "degraded"));
const stateText = computed(() =>
    affected.value === 0
        ? "All providers operational"
        : down.value > 0
          ? `${down.value.toLocaleString()} provider${down.value === 1 ? "" : "s"} down`
          : `${degraded.value.toLocaleString()} provider${degraded.value === 1 ? "" : "s"} degraded`,
);

const filtersActive = computed(() => query.value.trim() !== "" || prefixFilters.value.size > 0 || statusFilter.value.size > 0);

const resultLabel = computed(() => {
    const count = filteredProviders.value.length;
    return `${count.toLocaleString()} ${count === 1 ? "provider" : "providers"}`;
});

function clearFilters(): void {
    query.value = "";
    prefixFilters.value = new Set();
    statusFilter.value = new Set();
}

const prefixMenuOptions = computed<DropdownMenuOption[]>(() =>
    prefixCounts.value.map(([pfx, count]) => ({ value: pfx, label: `${pfx}/*`, count, checked: prefixFilters.value.has(pfx) })),
);

const statusMenuOptions = computed<DropdownMenuOption[]>(() =>
    STATUS_OPTIONS.map((status) => ({ value: status, label: STATUS_LABELS[status], count: statusCounts.value[status], checked: statusFilter.value.has(status) })),
);
</script>

<template>
    <div class="status-board">
        <div v-if="failed" class="status-alert">Health data did not load. Retrying automatically.</div>

        <template v-if="providers.length > 0">
            <div class="status-bar">
                <span :class="`status-bar-state is-${overallState}`">{{ stateText }}</span>
                <div class="status-bar-counts">
                    <span class="is-healthy-count"><strong>{{ healthy }}</strong> healthy</span>
                    <span class="is-degraded-count"><strong>{{ degraded }}</strong> degraded</span>
                    <span class="is-down-count"><strong>{{ down }}</strong> down</span>
                    <span><strong>{{ total }}</strong> total</span>
                </div>
            </div>

            <div class="catalog-toolbar">
                <div class="catalog-search-field">
                    <span class="material-symbols-outlined catalog-search-icon">search</span>
                    <TextField class="catalog-search-input" :model-value="query" placeholder="Search providers..." @update:model-value="(v) => (query = v)" />
                </div>
                <div class="catalog-filter-group" aria-label="Provider filters">
                    <DropdownMenu
                        trigger-label="Prefix"
                        :value-label="prefixButtonLabel"
                        :active-count="prefixFilters.size"
                        :options="prefixMenuOptions"
                        @toggle="togglePrefix"
                    />
                    <DropdownMenu
                        trigger-label="Status"
                        :value-label="statusButtonLabel"
                        :active-count="statusFilter.size"
                        :options="statusMenuOptions"
                        @toggle="toggleStatus"
                    />
                </div>
            </div>

            <div class="catalog-summary" aria-live="polite">
                <span>{{ resultLabel }}</span>
                <button v-if="filtersActive" type="button" data-sound="interaction.subtle" @click="clearFilters">Clear filters</button>
            </div>

            <div class="status-grid">
                <template v-if="filteredProviders.length > 0">
                    <StatusCard
                        v-for="provider in filteredProviders"
                        :key="provider.prefix"
                        :provider="provider"
                        :is-selected="selectedPrefix === provider.prefix"
                        @select="openPopover(provider.prefix)"
                        @close="closePopover"
                    />
                </template>
                <div v-else class="status-grid-empty">
                    No providers match your filters.
                    <button type="button" class="status-grid-empty-clear" data-sound="interaction.subtle" @click="clearFilters">Clear filters</button>
                </div>
            </div>
        </template>

        <div v-else class="status-grid">
            <article class="status-card is-unknown" aria-live="polite">
                <div class="status-card-top">
                    <strong>providers/</strong>
                    <span>loading</span>
                </div>
                <div class="status-card-main">
                    <span>...</span>
                    <small>models</small>
                </div>
                <div class="status-card-blast-slot" />
                <div class="status-card-meta">
                    <span>30m errors</span>
                    <strong>...</strong>
                    <span>requests</span>
                    <strong>...</strong>
                </div>
            </article>
        </div>

        <ProviderPopover v-if="selectedProvider" :provider="selectedProvider" @close="closePopover" />

        <div class="status-footnote">
            Updated {{ loadedAt ? loadedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "..." }}.
        </div>
    </div>
</template>
