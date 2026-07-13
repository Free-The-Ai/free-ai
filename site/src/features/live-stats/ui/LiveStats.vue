<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

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
        clients: (health.value.clients ?? []).slice(0, 4),
        models: health.value.catalog?.model_count ?? 0,
        requests: health.value.total_tokens_served?.successful_requests ?? 0,
        tokens: health.value.total_tokens_served?.total ?? 0,
    };
});
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
        <div v-if="stats" class="home-client-strip" aria-label="Top API clients">
            <template v-if="stats.clients.length > 0">
                <div v-for="client in stats.clients" :key="client.client_name" class="home-client-chip">
                    <span>{{ client.client_name }}</span>
                    <strong>{{ fmt(client.total_requests) }}</strong>
                </div>
            </template>
            <div v-else class="home-client-chip">
                <span>client mix</span>
                <strong>live soon</strong>
            </div>
        </div>
    </div>
</template>
