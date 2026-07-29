<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    interface ClientStat {
        client_name: string;
        unique_users: number;
    }

    interface HealthShape {
        clients?: ClientStat[];
    }

    let count = $state<number | null>(null);
    let interval: number | undefined;

    async function fetchActive(): Promise<void> {
        try {
            const r = await fetch("https://api.freetheai.xyz/v1/health");
            if (!r.ok) return;
            const data: HealthShape = await r.json();
            count = (data.clients ?? []).reduce((sum, c) => sum + c.unique_users, 0);
        } catch {
            /* leave previous value — transient network error */
        }
    }

    onMount(() => {
        fetchActive();
        interval = window.setInterval(fetchActive, 30000);
    });
    onDestroy(() => {
        if (interval) window.clearInterval(interval);
    });
</script>

<div class="online-now" role="status" aria-live="polite">
    <span class="online-dot"></span>
    <span class="online-text">
        {#if count !== null}
            <strong>{count.toLocaleString()}</strong>
        {:else}
            <strong class="online-loading">...</strong>
        {/if}
        builders active
    </span>
</div>

<style>
    .online-now {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        border-radius: var(--radius-full);
        background: oklch(0.65 0.15 145 / 0.08);
        border: 1px solid oklch(0.65 0.15 145 / 0.18);
        font-size: 0.82rem;
        color: var(--muted);
        transition: border-color 200ms var(--ease-out-smooth), background 200ms var(--ease-out-smooth);
    }

    .online-now:hover {
        border-color: oklch(0.7 0.15 145 / 0.3);
        background: oklch(0.65 0.15 145 / 0.12);
    }

    .online-dot {
        position: relative;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: oklch(0.72 0.17 145);
        flex-shrink: 0;
    }

    .online-dot::after {
        content: "";
        position: absolute;
        inset: -3px;
        border-radius: 50%;
        background: oklch(0.72 0.17 145 / 0.4);
        animation: online-pulse 2s var(--ease-out-smooth) infinite;
    }

    @keyframes online-pulse {
        0% { transform: scale(0.8); opacity: 0.7; }
        70% { transform: scale(2.2); opacity: 0; }
        100% { transform: scale(2.2); opacity: 0; }
    }

    .online-text {
        white-space: nowrap;
        line-height: 1;
    }

    .online-text strong {
        color: oklch(0.82 0.13 145);
        font-weight: 600;
    }

    .online-loading {
        color: var(--dim);
    }

    @media (prefers-reduced-motion: reduce) {
        .online-dot::after {
            animation: none;
        }
    }
</style>
