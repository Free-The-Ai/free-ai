<script lang="ts">
    import type { Snippet } from "svelte";
    import DitherButton from "./DitherButton.svelte";
    import type { PixelBloom, PixelColor } from "@/shared/lib/dither/pixel";

    // Standard site CTA — the single source of truth for the dithered call-to-
    // action look, so pages don't repeat DitherButton props. Renders the correct
    // element (anchor/SvelteKit link/button) via DitherButton and appends the arrow.
    let {
        href,
        to,
        color = "orange",
        variant = "gradient",
        size = "lg",
        bloom = "low",
        arrow = true,
        children,
        ...rest
    }: {
        href?: string;
        to?: string;
        color?: PixelColor;
        variant?: "gradient" | "dotted" | "hatched" | "solid";
        size?: "sm" | "md" | "lg";
        bloom?: PixelBloom;
        arrow?: boolean;
        children?: Snippet;
        [key: string]: unknown;
    } = $props();
</script>

<DitherButton {href} {to} {color} {variant} {size} {bloom} data-sound="interaction.confirm" {...rest}>
    {@render children?.()}
    {#if arrow}
        <span class="cta-dither-arrow" aria-hidden="true">&rarr;</span>
    {/if}
</DitherButton>

<style>
    .cta-dither-arrow {
        display: inline-block;
        transition: transform 150ms var(--ease-out-smooth, ease);
    }
    :global(.kb-dither-button:hover) .cta-dither-arrow {
        transform: translateX(3px);
    }
</style>
