<script lang="ts">
    import type { Snippet } from "svelte";
    import PieCanvas from "./PieCanvas.svelte";
    import PolarRoot from "./PolarRoot.svelte";
    import type { PieChartProps } from "@/shared/lib/dither/chart-context";

    let {
        children,
        onselectionchange,
        ...rest
    }: PieChartProps & { onselectionchange?: (key: string | null) => void; children?: Snippet } = $props();
</script>

<PolarRoot chartType="pie" {...rest} {onselectionchange}>
    {#snippet canvas()}
        <PieCanvas />
    {/snippet}
    {@render children?.()}
</PolarRoot>
