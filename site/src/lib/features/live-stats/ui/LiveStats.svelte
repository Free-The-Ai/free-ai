<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import modelsJson from "@/entities/model/models.json";
    import { NumberFlow } from "@/shared/ui";

    interface HealthData {
        catalog?: { model_count?: number };
        clients?: { client_name: string; unique_users: number }[];
    }

    const rows = Array.isArray(modelsJson) ? modelsJson : (modelsJson as { data: { prefix?: string }[] }).data;
    const providerCount = new Set(rows.map((m) => m.prefix).filter(Boolean)).size;

    let health = $state<HealthData | null>(null);
    let interval: number | undefined;

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

    const models = $derived(health?.catalog?.model_count ?? null);
    const visitors = $derived(health ? (health.clients ?? []).reduce((sum, c) => sum + c.unique_users, 0) : null);
</script>

<div class="stats-bar">
    <div class="stat">
        <div class="stat-value"><NumberFlow value={models !== null ? models.toLocaleString() : "…"} /></div>
        <div class="stat-label">Models</div>
    </div>
    <div class="stat">
        <div class="stat-value"><NumberFlow value={String(providerCount)} /></div>
        <div class="stat-label">Providers</div>
    </div>
    <div class="stat">
        <div class="stat-value">3</div>
        <div class="stat-label">Formats</div>
    </div>
    <div class="stat">
        <div class="stat-value"><NumberFlow value={visitors !== null ? visitors.toLocaleString() : "…"} /></div>
        <div class="stat-label">Visitors in the last 10 minutes</div>
    </div>
</div>

<style>
    .stats-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
    }
    .stat {
        padding: clamp(18px, 3vw, 30px) clamp(14px, 2.4vw, 28px);
    }
    .stat + .stat {
        border-inline-start: 1px solid var(--border);
    }
    .stat-value {
        font-family: var(--font-display);
        font-size: clamp(1.9rem, 3.4vw, 2.9rem);
        font-weight: 500;
        line-height: 1;
        letter-spacing: -0.02em;
        color: var(--text);
        font-variant-numeric: tabular-nums;
    }
    .stat-label {
        margin-top: 8px;
        font-family: var(--font-mono);
        font-size: 0.7rem;
        line-height: 1.35;
        color: var(--muted);
    }
    @media (max-width: 40em) {
        .stats-bar {
            grid-template-columns: repeat(2, 1fr);
        }
        .stat:nth-child(3) {
            border-inline-start: 0;
        }
        .stat:nth-child(n + 3) {
            border-top: 1px solid var(--border);
        }
    }
</style>
