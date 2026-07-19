<script lang="ts">
    import type { ProviderHealth } from "@/entities/provider";
    import { formatPercent } from "@/shared/lib/format";
    import { DitherAvatar } from "@/shared/ui";

    let {
        provider,
        isSelected,
        onselect,
        onclose,
    }: {
        provider: ProviderHealth;
        isSelected: boolean;
        onselect?: () => void;
        onclose?: () => void;
    } = $props();

    const isAffected = $derived(provider.status === "degraded" || provider.status === "down");
    const showBlast = $derived(isAffected && provider.model_count > 0);

    function handleClick(): void {
        if (isSelected) onclose?.();
        else onselect?.();
    }

    function onKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
        }
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
    class={["status-card", `is-${provider.status}`, { "is-selected": isSelected }]}
    tabindex="0"
    role="button"
    aria-label={`${provider.prefix} provider status ${provider.status}`}
    data-sound="interaction.tap"
    onclick={handleClick}
    onkeydown={onKeydown}
>
    <div class="status-card-top">
        <DitherAvatar name={provider.prefix} size={20} animate={false} class="status-card-avatar" />
        <strong>{provider.prefix}/</strong>
        {#if showBlast}
            <span class="status-card-blast">
                {provider.status === "down" ? "Affected" : "At risk"}
                <strong>{provider.model_count.toLocaleString()}</strong>
            </span>
        {:else}
            <span>{provider.status}</span>
        {/if}
    </div>
    <div class="status-card-main">
        <span>{provider.model_count.toLocaleString()}</span>
        <small>{provider.model_count === 1 ? "model" : "models"}</small>
    </div>
    <div class="status-card-meta">
        <span>30m errors</span>
        <strong>{formatPercent(provider.error_rate_30m)}</strong>
        <span>requests</span>
        <strong>{provider.requests_30m.toLocaleString()}</strong>
    </div>
</article>

<style>
    .status-card-avatar {
        flex: none;
        border-radius: 4px;
        overflow: hidden;
    }
</style>
