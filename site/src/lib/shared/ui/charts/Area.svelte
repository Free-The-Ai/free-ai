<script lang="ts">
    import type { Snippet } from "svelte";
    import CartesianSeries from "./CartesianSeries.svelte";
    import type { AreaVariant, StrokeVariant } from "@/shared/lib/dither/chart-types";

    let {
        dataKey,
        variant,
        strokeVariant,
        isClickable,
        children,
    }: {
        dataKey: string;
        variant?: AreaVariant;
        strokeVariant?: StrokeVariant;
        isClickable?: boolean;
        children?: Snippet;
    } = $props();
</script>

<CartesianSeries part="Area" kind="area" {dataKey} {variant} {strokeVariant} {isClickable}>
    {@render children?.()}
</CartesianSeries>
