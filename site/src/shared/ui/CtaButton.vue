<script setup lang="ts">
import DitherButton from "./DitherButton.vue";
import type { PixelBloom, PixelColor } from "@/shared/lib/dither/pixel";

// Standard site CTA — the single source of truth for the dithered call-to-
// action look, so pages don't repeat DitherButton props. Renders the correct
// element (anchor/router-link/button) via DitherButton and appends the arrow.
withDefaults(
    defineProps<{
        href?: string;
        to?: string;
        color?: PixelColor;
        variant?: "gradient" | "dotted" | "hatched" | "solid";
        size?: "sm" | "md" | "lg";
        bloom?: PixelBloom;
        arrow?: boolean;
    }>(),
    { color: "orange", variant: "gradient", size: "lg", bloom: "low", arrow: true },
);
</script>

<template>
    <DitherButton
        :href="href"
        :to="to"
        :color="color"
        :variant="variant"
        :size="size"
        :bloom="bloom"
        data-sound="interaction.confirm"
    >
        <slot />
        <span v-if="arrow" class="cta-dither-arrow" aria-hidden="true">&rarr;</span>
    </DitherButton>
</template>

<style scoped>
.cta-dither-arrow {
    display: inline-block;
    transition: transform 150ms var(--ease-out-smooth, ease);
}
:global(.kb-dither-button:hover) .cta-dither-arrow {
    transform: translateX(3px);
}
</style>
