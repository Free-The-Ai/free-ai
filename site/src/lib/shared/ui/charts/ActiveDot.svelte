<script lang="ts">
    import { useChart, useSeries } from "@/shared/lib/dither/chart-context";
    import { rgb, type Seed } from "@/shared/lib/dither/palette";

    type DotVariant = "border" | "colored-border" | "filled";

    let { variant = "colored-border", r = 3 }: { variant?: DotVariant; r?: number } = $props();

    const ctx = useChart();
    const series = useSeries("ActiveDot");

    function dotPaint(v: DotVariant, seed: Seed) {
        switch (v) {
            case "colored-border":
                return { fill: "var(--surface, #0b0b0c)", stroke: rgb(seed.line) };
            case "filled":
                return { fill: rgb(seed.star), stroke: rgb(seed.line) };
            default:
                return { fill: "var(--surface, #0b0b0c)", stroke: rgb(seed.star, 0.8) };
        }
    }

    const active = $derived.by(() => {
        const band = ctx.bands[series.dataKey];
        if (!ctx.ready || !band || ctx.hoverIndex == null || !ctx.entranceDone) return null;
        const b = band[ctx.hoverIndex];
        if (!b) return null;
        return { cx: ctx.xCenter(ctx.hoverIndex), cy: ctx.y(b[1]) };
    });
    const paint = $derived(dotPaint(variant, series.seed));
    const halo = $derived(rgb(series.seed.line, 1, 0.18));
</script>

{#if active}
    <svg class="dk-layer dk-front">
        <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            <circle cx={active.cx} cy={active.cy} r={r + 3} fill={halo} />
            <circle cx={active.cx} cy={active.cy} {r} fill={paint.fill} stroke={paint.stroke} stroke-width="2" />
        </g>
    </svg>
{/if}
