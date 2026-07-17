<script lang="ts">
    import { useChartPart } from "@/shared/lib/dither/chart-context";

    type Row = Record<string, unknown>;

    let {
        dataKey,
        tickFormatter,
        tickMargin = 8,
        maxTicks = 8,
    }: {
        dataKey?: string;
        tickFormatter?: (value: unknown, index: number) => string;
        tickMargin?: number;
        maxTicks?: number;
    } = $props();

    const ctx = useChartPart("XAxis");
    const step = $derived(Math.max(1, Math.ceil(ctx.dataLength / maxTicks)));
    const baseY = $derived(ctx.plot.height + tickMargin);

    const ticks = $derived(
        (ctx.data as Row[])
            .map((row, i) => {
                if (i % step !== 0) return null;
                const raw = dataKey ? row[dataKey] : i;
                const label = tickFormatter ? tickFormatter(raw, i) : String(raw ?? "");
                return { i, x: ctx.xCenter(i), label };
            })
            .filter((t): t is { i: number; x: number; label: string } => t !== null),
    );
</script>

{#if ctx.ready}
    <svg class="dk-layer dk-front">
        <g class="dk-axis" transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            {#each ticks as t (t.i)}
                <text x={t.x} y={baseY} text-anchor="middle" dominant-baseline="hanging">
                    {t.label}
                </text>
            {/each}
        </g>
    </svg>
{/if}
