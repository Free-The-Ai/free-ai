<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { siteConfig } from "@/shared/config/site";

    let online = $state<number | null>(null);
    let timer: ReturnType<typeof setInterval> | undefined;
    let heartbeatAbort: AbortController | undefined;

    const clientId = (() => {
        const key = "fta:presence-id";
        try {
            const existing = localStorage.getItem(key);
            if (existing) return existing;
            const bytes = crypto.getRandomValues(new Uint8Array(16));
            const id = btoa(String.fromCharCode(...bytes))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");
            localStorage.setItem(key, id);
            return id;
        } catch {
            return crypto.getRandomValues(new Uint8Array(16)).join("");
        }
    })();

    async function heartbeat(): Promise<void> {
        if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
        heartbeatAbort?.abort();
        heartbeatAbort = new AbortController();
        try {
            const r = await fetch(`${siteConfig.socials.api}/v1/presence`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                signal: heartbeatAbort.signal,
                body: JSON.stringify({ client_id: clientId }),
            });
            if (r.ok) {
                const data = await r.json();
                online = data.online;
            }
        } catch {
            // Stay silent; the badge hides on failure.
        }
    }

    function start(): void {
        if (timer !== undefined) return;
        void heartbeat();
        timer = setInterval(() => void heartbeat(), 30_000);
    }

    function stop(): void {
        if (timer !== undefined) {
            clearInterval(timer);
            timer = undefined;
        }
    }

    function onVisibility(): void {
        if (typeof document !== "undefined" && document.visibilityState === "visible") start();
        else stop();
    }

    onMount(() => {
        if (typeof window === "undefined") return;
        document.addEventListener("visibilitychange", onVisibility);
        start();
    });

    onDestroy(() => {
        stop();
        heartbeatAbort?.abort();
        if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
    });
</script>

{#if online !== null}
    <span class="online-counter" aria-label="{online} people online" title="People viewing FreeTheAi right now">
        <span class="online-dot" aria-hidden="true"></span>
        <span class="online-count" aria-hidden="true">{online}</span>
        <span class="online-label">online</span>
    </span>
{/if}

<style>
    .online-counter {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--dim);
        font-size: 0.75rem;
        font-variant-numeric: tabular-nums;
    }
    .online-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: oklch(0.72 0.15 145);
        box-shadow: 0 0 6px oklch(0.72 0.15 145 / 0.5);
    }
    .online-count {
        color: var(--muted);
        font-weight: 500;
    }
    .online-label {
        color: var(--dim);
    }
</style>
