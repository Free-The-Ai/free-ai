<script lang="ts">
    import type { Snippet } from "svelte";
    import PolarRoot from "./PolarRoot.svelte";
    import RadarCanvas from "./RadarCanvas.svelte";
    import RadarFrame from "./RadarFrame.svelte";
    import type { RadarChartProps } from "@/shared/lib/dither/chart-context";

    let {
        children,
        onselectionchange,
        ...rest
    }: RadarChartProps & { onselectionchange?: (key: string | null) => void; children?: Snippet } = $props();
</script>

<PolarRoot chartType="radar" {...rest} {onselectionchange}>
    {#snippet back()}
        <RadarFrame />
    {/snippet}
    {#snippet canvas()}
        <RadarCanvas />
    {/snippet}
    {@render children?.()}
</PolarRoot>
