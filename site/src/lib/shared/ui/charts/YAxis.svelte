<script lang="ts">
    import { useChartPart } from "@/shared/lib/dither/chart-context";

    let {
        tickFormatter,
        tickCount = 4,
        tickMargin = 8,
    }: { tickFormatter?: (value: number) => string; tickCount?: number; tickMargin?: number } = $props();

    const ctx = useChartPart("YAxis");
    const ticks = $derived(
        ctx.y.ticks(tickCount).map((t) => ({
            t,
            y: ctx.y(t),
            label: tickFormatter ? tickFormatter(t) : String(t),
        })),
    );
</script>

{#if ctx.ready}
    <svg class="dk-layer dk-front">
        <g class="dk-axis" transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            {#each ticks as tk (tk.t)}
                <text x={-tickMargin} y={tk.y} text-anchor="end" dominant-baseline="central">
                    {tk.label}
                </text>
            {/each}
        </g>
    </svg>
{/if}
