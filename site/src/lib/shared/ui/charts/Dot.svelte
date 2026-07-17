<script lang="ts">
    import { useChart, useSeries } from "@/shared/lib/dither/chart-context";
    import { rgb, type Seed } from "@/shared/lib/dither/palette";
    import { styleToCss } from "@/shared/lib/dom";

    type DotVariant = "border" | "colored-border" | "filled";

    let { variant = "border", r = 2 }: { variant?: DotVariant; r?: number } = $props();

    const ctx = useChart();
    const series = useSeries("Dot");

    function dotPaint(v: DotVariant, seed: Seed) {
        switch (v) {
            case "colored-border":
                return { fill: "var(--surface, #0b0b0c)", stroke: rgb(seed.line), "stroke-width": 1.5 };
            case "filled":
                return { fill: rgb(seed.star), stroke: rgb(seed.line), "stroke-width": 1 };
            default:
                return { fill: "var(--surface, #0b0b0c)", stroke: rgb(seed.star, 0.8), "stroke-width": 1 };
        }
    }

    const paint = $derived(dotPaint(variant, series.seed));
    const points = $derived.by(() => {
        const band = ctx.bands[series.dataKey];
        if (!ctx.ready || !band) return [];
        return band.map((b, i) => ({ i, cx: ctx.xCenter(i), cy: ctx.y(b[1]) }));
    });
    const groupStyle = $derived(styleToCss({ opacity: ctx.entranceDone ? 1 : 0, transition: "opacity 300ms ease" }));
</script>

{#if points.length}
    <svg class="dk-layer dk-front">
        <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`} style={groupStyle}>
            {#each points as p (p.i)}
                <circle cx={p.cx} cy={p.cy} {r} fill={paint.fill} stroke={paint.stroke} stroke-width={paint["stroke-width"]} />
            {/each}
        </g>
    </svg>
{/if}
