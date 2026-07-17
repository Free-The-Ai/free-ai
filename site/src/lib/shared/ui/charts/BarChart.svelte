<script lang="ts">
    import type { Snippet } from "svelte";
    import BarCanvas from "./BarCanvas.svelte";
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

<CartesianRoot chartType="bar" {...rest} {onhoverchange} {onselectionchange}>
    {#snippet canvas()}
        <BarCanvas />
    {/snippet}
    {@render children?.()}
</CartesianRoot>
