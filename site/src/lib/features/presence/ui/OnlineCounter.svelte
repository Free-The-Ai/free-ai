<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { siteConfig } from "@/shared/config/site";

    let online = $state<number | null>(null);
    let loaded = $state(false);
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
                online = (await r.json()).online;
                loaded = true;
            }
        } catch {
        }
    }

    function start(): void {
        if (timer !== undefined) return;
        void heartbeat();
        timer = setInterval(() => void heartbeat(), 30_000);
    }

    function stop(): void {
        if (timer !== undefined) { clearInterval(timer); timer = undefined; }
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
    <span class="presence" class:loaded aria-label="{online} viewers here now">
        <span class="dot" aria-hidden="true"></span>{online} here
    </span>
{/if}

<style>
    .presence {
        opacity: 0;
        transition: opacity 500ms var(--ease-out-smooth, ease) 200ms;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
    }
    .presence.loaded {
        opacity: 1;
    }
    .dot {
        display: inline-block;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: oklch(0.72 0.1 145);
        margin-inline-end: 5px;
        vertical-align: 1px;
        opacity: 0.7;
    }
</style>
