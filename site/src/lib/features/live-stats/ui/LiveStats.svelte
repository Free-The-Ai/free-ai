<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    interface HealthData {
        catalog: { model_count: number };
        total_tokens_served: { total: number; successful_requests: number };
    }

    let health = $state<HealthData | null>(null);
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
            if (r.ok) health = await r.json();
        } catch (error) {
            console.error("Failed to load live stats", error);
        }
    }

    onMount(() => {
        fetchHealth();
        interval = window.setInterval(fetchHealth, 30000);
    });
    onDestroy(() => {
        if (interval) window.clearInterval(interval);
    });

    const stats = $derived.by(() => {
        if (!health) return null;
        return {
            models: health.catalog?.model_count ?? 0,
            requests: health.total_tokens_served?.successful_requests ?? 0,
            tokens: health.total_tokens_served?.total ?? 0,
        };
    });
</script>

<div class="home-live-stats">
    <div class="home-live-metrics">
        <div class="shell stat-card">
            <div class="stat-value">{stats ? stats.models.toLocaleString() : "..."}</div>
            <div class="stat-label">active models</div>
        </div>
        <div class="shell stat-card">
            <div class="stat-value">{stats ? fmt(stats.tokens) : "..."}</div>
            <div class="stat-label">tokens served</div>
        </div>
        <div class="shell stat-card">
            <div class="stat-value">{stats ? stats.requests.toLocaleString() : "..."}</div>
            <div class="stat-label">requests</div>
        </div>
    </div>
</div>
