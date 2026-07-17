<script lang="ts">
    import { useChartPart } from "@/shared/lib/dither/chart-context";

    let {
        horizontal = true,
        vertical = false,
        strokeDasharray = "3 3",
    }: { horizontal?: boolean; vertical?: boolean; strokeDasharray?: string } = $props();

    const ctx = useChartPart("Grid");
    const hTicks = $derived(horizontal ? ctx.y.ticks(4) : []);
</script>

{#if ctx.ready}
    <svg class="dk-layer dk-back">
        <g class="dk-grid" stroke-dasharray={strokeDasharray} transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            {#each hTicks as t (t)}
                <line x1={0} x2={ctx.plot.width} y1={ctx.y(t)} y2={ctx.y(t)} />
            {/each}
            {#if vertical}
                {#each ctx.data as _, i (i)}
                    <line x1={ctx.xCenter(i)} x2={ctx.xCenter(i)} y1={0} y2={ctx.plot.height} />
                {/each}
            {/if}
        </g>
    </svg>
{/if}
