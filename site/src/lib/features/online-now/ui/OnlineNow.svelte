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

<a
    class="online-now"
    href="/status"
    data-sound="interaction.tap"
    title={count !== null ? `${count.toLocaleString()} builders online now` : "Loading..."}
>
    <span class="online-dot" aria-hidden="true"></span>
    {#if count !== null}
        <strong>{count.toLocaleString()}</strong>
        <span class="sr-only"> builders online now</span>
    {:else}
        <span class="online-loading" aria-hidden="true">...</span>
        <span class="sr-only">Loading builder count</span>
    {/if}
</a>

<style>
    .online-now {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        height: var(--control-height);
        border-radius: var(--radius-full);
        background: oklch(0.65 0.15 145 / 0.08);
        border: 1px solid oklch(0.65 0.15 145 / 0.18);
        text-decoration: none;
        font-size: 0.8rem;
        color: var(--muted);
        transition:
            border-color var(--hover-dur) var(--ease-out-smooth),
            background var(--hover-dur) var(--ease-out-smooth);
    }

    .online-now:hover {
        border-color: oklch(0.7 0.15 145 / 0.3);
        background: oklch(0.65 0.15 145 / 0.12);
    }

    .online-dot {
        position: relative;
        width: 7px;
        height: 7px;
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

    .online-now strong {
        color: oklch(0.82 0.13 145);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        line-height: 1;
    }

    .online-loading {
        color: var(--dim);
        line-height: 1;
        letter-spacing: 1px;
    }

    @media (prefers-reduced-motion: reduce) {
        .online-dot::after {
            animation: none;
        }
    }
</style>
