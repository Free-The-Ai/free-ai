<script lang="ts">
    import type { Model } from "@/entities/model";
    import { modelContext, modelSupportsAudio, modelSupportsImage } from "@/entities/model";
    import { formatTokens } from "@/shared/lib/format";

    let { model, onselect }: { model: Model; onselect?: (model: Model) => void } = $props();

    const ctx = $derived(modelContext(model));
    const out = $derived(model.max_output_tokens);
    const isAudio = $derived(modelSupportsAudio(model));
    const isImage = $derived(modelSupportsImage(model));

    function onSelect(event: Event): void {
        if ((event.target as HTMLElement).closest(".model-copy")) return;
        onselect?.(model);
    }

    function onKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onselect?.(model);
        }
    }

    function onCopy(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        navigator.clipboard.writeText(model.id).catch((error) => {
            console.error("Failed to copy model alias", error);
        });
        const btn = event.currentTarget as HTMLElement;
        const icon = btn.querySelector(".material-symbols-outlined");
        if (icon) {
            icon.textContent = "check";
            setTimeout(() => {
                icon.textContent = "content_copy";
            }, 1500);
        }
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<article
    class={["model-card", { "is-gated": model.requires_seems_legit }]}
    role="button"
    tabindex="0"
    aria-haspopup="dialog"
    aria-label={`Open details for ${model.id}`}
    data-sound="interaction.tap"
    onclick={onSelect}
    onkeydown={onKeydown}
>
    <div class="model-card-top">
        <span class="model-prefix">{model.prefix}/*</span>
    </div>
    <code class="model-id">{model.id}</code>
    <div class="model-meta">
        {#if ctx > 0}
            <span class="model-chip" title="Total context window">
                <strong>{formatTokens(ctx)}</strong> ctx
            </span>
        {/if}
        {#if out !== undefined}
            <span class="model-chip" title="Maximum output tokens">
                <strong>{formatTokens(out)}</strong> out
            </span>
        {/if}
        {#if isAudio}
            <span class="model-chip is-audio" title="Supports an audio route">
                <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">graphic_eq</span>
                Audio
            </span>
        {/if}
        {#if isImage}
            <span class="model-chip is-images" title="Supports an image route">
                <span class="material-symbols-outlined model-chip-icon" aria-hidden="true">image</span>
                Image
            </span>
        {/if}
    </div>
    <button class="model-copy" title="Copy model alias" aria-label={`Copy ${model.id}`} data-sound="interaction.confirm" onclick={onCopy}>
        <span class="material-symbols-outlined">content_copy</span>
    </button>
</article>
