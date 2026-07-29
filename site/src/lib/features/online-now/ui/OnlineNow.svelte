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
    <span class="online-count">
        {#if count !== null}
            {count.toLocaleString()}
        {:else}
            <span class="online-loading" aria-hidden="true">&middot;&middot;&middot;</span>
        {/if}
    </span>
    <span class="sr-only">builders online now</span>
</a>

<style>
    .online-now {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: var(--control-height);
        padding: 0 12px;
        border: 1px solid var(--sk-border);
        border-radius: var(--radius);
        background: var(--sk-inset-bg);
        box-shadow: var(--sk-inset-shadow);
        text-decoration: none;
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--muted);
        transition:
            border-color var(--hover-dur) var(--ease-out-smooth),
            color var(--hover-dur) var(--ease-out-smooth),
            background var(--hover-dur) var(--ease-out-smooth);
    }

    .online-now:hover {
        border-color: var(--border-strong);
        color: var(--text);
    }

    .online-dot {
        position: relative;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: oklch(0.72 0.15 145);
        flex-shrink: 0;
    }

    .online-dot::after {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: oklch(0.72 0.15 145 / 0.35);
        animation: online-pulse 2.4s var(--ease-out-smooth) infinite;
    }

    @keyframes online-pulse {
        0% { transform: scale(0.9); opacity: 0.5; }
        60% { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1.6); opacity: 0; }
    }

    .online-count {
        font-variant-numeric: tabular-nums;
        line-height: 1;
    }

    .online-loading {
        color: var(--dim);
        letter-spacing: 1px;
    }

    @media (prefers-reduced-motion: reduce) {
        .online-dot::after {
            animation: none;
            opacity: 0.3;
        }
    }
</style>
