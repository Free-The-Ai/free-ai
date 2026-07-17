<script lang="ts">
    import { usePolarChart } from "@/shared/lib/dither/chart-context";
    import { polarX, polarY } from "@/shared/lib/dither/polar";

    const LEVELS = 4;
    const ctx = usePolarChart();

    const frame = $derived.by(() => {
        if (!ctx.ready || !ctx.radar) return null;
        const { axes } = ctx.radar;
        const { x: cx, y: cy } = ctx.center;
        const R = ctx.outerRadius;
        const ring = (radius: number) =>
            `${axes
                .map((ax, i) => `${i === 0 ? "M" : "L"}${polarX(cx, radius, ax.angle).toFixed(1)},${polarY(cy, radius, ax.angle).toFixed(1)}`)
                .join(" ")} Z`;
        return {
            cx,
            cy,
            rings: Array.from({ length: LEVELS }, (_, l) => ring((R * (l + 1)) / LEVELS)),
            spokes: axes.map((ax, i) => ({
                key: ax.label,
                x2: polarX(cx, R, ax.angle),
                y2: polarY(cy, R, ax.angle),
                hot: ctx.hoverIndex === i,
            })),
            labels: axes.map((ax, i) => {
                const lx = polarX(cx, R + 10, ax.angle);
                const ly = polarY(cy, R + 10, ax.angle);
                const anchor = Math.abs(Math.cos(ax.angle)) < 0.3 ? "middle" : Math.cos(ax.angle) > 0 ? "start" : "end";
                return { key: ax.label, lx, ly, anchor, hot: ctx.hoverIndex === i, label: ax.label };
            }),
        };
    });
</script>

{#if frame}
    <svg class="dk-layer dk-back">
        <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            {#each frame.rings as d, l (l)}
                <path {d} class="dk-frame-ring" />
            {/each}
            {#each frame.spokes as s (s.key)}
                <line x1={frame.cx} y1={frame.cy} x2={s.x2} y2={s.y2} class={["dk-frame-spoke", { "dk-frame-spoke--hot": s.hot }]} />
            {/each}
            {#each frame.labels as l (l.key)}
                <text x={l.lx} y={l.ly} text-anchor={l.anchor} dominant-baseline="central" class={["dk-frame-label", { "dk-frame-label--hot": l.hot }]}>
                    {l.label}
                </text>
            {/each}
        </g>
    </svg>
{/if}
