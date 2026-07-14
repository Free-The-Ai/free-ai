<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { ChartConfig } from "@/shared/ui/charts";
import { Bar, BarChart, Tooltip, XAxis } from "@/shared/ui/charts";

interface ClientUsage {
    client_name: string;
    rank: number;
    total_requests: number;
    unique_users: number;
}

interface HealthData {
    catalog: { model_count: number };
    clients?: ClientUsage[];
    total_tokens_served: { total: number; successful_requests: number };
}

const health = ref<HealthData | null>(null);
let interval: number | undefined;

function fmt(n: number): string {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
}

async function fetchHealth(): Promise<void> {
    try {
        const r = await fetch("https://api.freetheai.xyz/v1/health");
        if (r.ok) health.value = await r.json();
    } catch (error) {
        console.error("Failed to load live stats", error);
    }
}

onMounted(() => {
    fetchHealth();
    interval = window.setInterval(fetchHealth, 30000);
});
onBeforeUnmount(() => {
    if (interval) window.clearInterval(interval);
});

const stats = computed(() => {
    if (!health.value) return null;
    return {
        clients: (health.value.clients ?? []).slice(0, 5),
        models: health.value.catalog?.model_count ?? 0,
        requests: health.value.total_tokens_served?.successful_requests ?? 0,
        tokens: health.value.total_tokens_served?.total ?? 0,
    };
});

// Top API clients by request volume — real usage from /v1/health.
const clientData = computed(() =>
    (stats.value?.clients ?? []).map((c) => ({ client: c.client_name, requests: c.total_requests })),
);
const clientConfig: ChartConfig = { requests: { label: "Requests", color: "blue" } };
const formatRequests = (value: number) => fmt(value);
const shortName = (value: unknown) => {
    const s = String(value ?? "");
    return s.length > 8 ? `${s.slice(0, 7)}…` : s;
};
</script>

<template>
    <div class="home-live-stats">
        <div class="home-live-metrics">
            <div class="shell stat-card">
                <div class="stat-value">{{ stats ? stats.models.toLocaleString() : "..." }}</div>
                <div class="stat-label">active models</div>
            </div>
            <div class="shell stat-card">
                <div class="stat-value">{{ stats ? fmt(stats.tokens) : "..." }}</div>
                <div class="stat-label">tokens served</div>
            </div>
            <div class="shell stat-card">
                <div class="stat-value">{{ stats ? stats.requests.toLocaleString() : "..." }}</div>
                <div class="stat-label">requests</div>
            </div>
        </div>
        <div v-if="stats && clientData.length > 0" class="shell home-client-chart">
            <div class="home-client-chart-head">
                <span>Top clients</span>
                <span>requests</span>
            </div>
            <div class="home-client-chart-body" aria-label="Top API clients by request volume">
                <BarChart :data="clientData" :config="clientConfig" bloom="low">
                    <XAxis data-key="client" :tick-formatter="shortName" />
                    <Bar data-key="requests" variant="gradient" />
                    <Tooltip label-key="client" :value-formatter="formatRequests" />
                </BarChart>
            </div>
        </div>
        <div v-else-if="stats" class="home-client-chart is-empty">Client mix — live soon</div>
    </div>
</template>

<style scoped>
.home-client-chart {
    width: 100%;
    box-sizing: border-box;
    margin-top: 12px;
    padding: 14px 16px 10px;
    border-radius: var(--radius);
}
.home-client-chart-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
}
.home-client-chart-head span:last-child {
    color: var(--dim);
}
.home-client-chart-body {
    position: relative;
    height: 150px;
    width: 100%;
    margin-top: 8px;
}
.home-client-chart.is-empty {
    margin-top: 12px;
    padding: 18px 16px;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.8rem;
    color: var(--dim);
    text-align: center;
}
</style>
