<script lang="ts">
    import type { Snippet } from "svelte";
    import { styleToCss } from "@/shared/lib/dom";

    let {
        width,
        height,
        radius,
        circle = false,
        animate = true,
        visible = true,
        className,
        children,
    }: {
        width?: string;
        height?: string;
        radius?: number;
        circle?: boolean;
        animate?: boolean;
        visible?: boolean;
        className?: string;
        children?: Snippet;
    } = $props();

    const styleAttr = $derived(
        styleToCss({
            width,
            height,
            borderRadius: circle ? "50%" : radius !== undefined ? `${radius}px` : undefined,
        }),
    );
</script>

{#if visible}
    <div class={className ?? "kb-skeleton"}>
        <div data-animate={animate ? "" : undefined} style={styleAttr}></div>
        {@render children?.()}
    </div>
{:else}
    {@render children?.()}
{/if}
