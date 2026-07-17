<script lang="ts">
    import type { Snippet } from "svelte";
    import CartesianCanvas from "./CartesianCanvas.svelte";
    import CartesianRoot from "./CartesianRoot.svelte";
    import type { CartesianChartProps } from "@/shared/lib/dither/chart-context";

    let {
        children,
        onhoverchange,
        onselectionchange,
        ...rest
    }: CartesianChartProps & {
        onhoverchange?: (index: number | null) => void;
        onselectionchange?: (key: string | null) => void;
        children?: Snippet;
    } = $props();
</script>

<CartesianRoot chartType="area" {...rest} {onhoverchange} {onselectionchange}>
    {#snippet canvas()}
        <CartesianCanvas />
    {/snippet}
    {@render children?.()}
</CartesianRoot>
