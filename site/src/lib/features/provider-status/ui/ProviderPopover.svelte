<script lang="ts">
    import type { ProviderHealth } from "@/entities/provider";
    import { formatPercent } from "@/shared/lib/format";
    import { Drawer, DitherAvatar } from "@/shared/ui";

    let { provider, onclose }: { provider: ProviderHealth; onclose?: () => void } = $props();

    let open = $state(true);
    const isAffected = $derived(provider.status === "degraded" || provider.status === "down");

    function setOpen(value: boolean): void {
        open = value;
        if (!value) onclose?.();
    }

    function formatTimestamp(iso: string | null | undefined): string {
        if (!iso) return "never";
        try {
            return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch {
            return "unknown";
        }
    }
</script>

<Drawer bind:open={() => open, setOpen} label={`${provider.prefix} provider status`} popupClass={`provider-popover is-${provider.status}`}>
    <div class="popover-status-strip"></div>

    <div class="popover-header">
        <DitherAvatar name={provider.prefix} size={44} animate={false} class="popover-avatar" />
        <div class="popover-header-text">
            <h3 class="popover-heading">{provider.prefix}/</h3>
            <p class="popover-sub">
                Status: <strong>{provider.status}</strong> &middot;
                {provider.model_count.toLocaleString()} {provider.model_count === 1 ? "model" : "models"}
                {#if isAffected}{provider.status === "down" ? " — affected" : " — at risk"}{/if}
            </p>
        </div>
    </div>

    <div class="popover-body">
        <dl class="detail-section">
            <h4 class="detail-section-title">Reliability</h4>
            <dt>60m error rate</dt>
            <dd class:zero={provider.error_rate_60m === 0}>{formatPercent(provider.error_rate_60m)}</dd>
            <dt>30m errors</dt>
            <dd>{provider.errors_30m.toLocaleString()}</dd>
            <dt>60m errors</dt>
            <dd>{provider.errors_60m.toLocaleString()}</dd>
        </dl>
        <dl class="detail-section">
            <h4 class="detail-section-title">Throughput</h4>
            <dt>60m requests</dt>
            <dd>{provider.requests_60m.toLocaleString()}</dd>
            <dt>30m successes</dt>
            <dd>{provider.successes_30m.toLocaleString()}</dd>
            <dt>60m successes</dt>
            <dd>{provider.successes_60m.toLocaleString()}</dd>
        </dl>
        <dl class="detail-section">
            <h4 class="detail-section-title">Activity</h4>
            <dt>Last success</dt>
            <dd>{formatTimestamp(provider.last_success_at)}</dd>
            <dt>Last error</dt>
            <dd class:zero={!provider.last_error_at}>{formatTimestamp(provider.last_error_at)}</dd>
        </dl>
        {#if provider.model_count > 0}
            <a class="catalog-link" href={`/models?prefix=${provider.prefix}`}>
                View all in model catalog <span class="catalog-link-arrow">&rarr;</span>
            </a>
        {/if}
    </div>
</Drawer>
