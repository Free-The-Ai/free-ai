<script lang="ts">
    import type { Snippet } from "svelte";
    import { onDestroy, setContext } from "svelte";
    import { type SeriesContextValue, SeriesKey, useChartPart } from "@/shared/lib/dither/chart-context";
    import type { AreaVariant, StrokeVariant } from "@/shared/lib/dither/chart-types";
    import { watchDeps } from "@/shared/lib/watchDeps";

    let {
        dataKey,
        variant = "gradient",
        strokeVariant = "solid",
        isClickable = false,
        children,
    }: {
        dataKey: string;
        variant?: AreaVariant;
        strokeVariant?: StrokeVariant;
        isClickable?: boolean;
        children?: Snippet;
    } = $props();

    const ctx = useChartPart("Bar", "bar");

    // svelte-ignore state_referenced_locally
    if (import.meta.env.DEV && !ctx.config[dataKey]) {
        console.warn(
            `<Bar dataKey="${dataKey}">: "${dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`,
        );
    }

    const syncRegistration = watchDeps(() => {
        ctx.registerSeries({ dataKey, kind: "bar", variant, strokeVariant });
    });
    onDestroy(() => ctx.unregisterSeries(dataKey));

    const series: SeriesContextValue = {
        get dataKey() {
            return dataKey;
        },
        get seed() {
            return ctx.seedOf(dataKey);
        },
        get dimmed() {
            return ctx.selectedDataKey !== null && ctx.selectedDataKey !== dataKey;
        },
    };
    setContext(SeriesKey, series);

    const rects = $derived.by(() => {
        const band = ctx.bands[dataKey];
        if (!isClickable || !ctx.ready || !band) return [];
        const si = ctx.configKeys.indexOf(dataKey);
        const n = ctx.configKeys.length;
        return band.map((b, i) => {
            const slot = ctx.barSlot(i, si, n);
            const top = ctx.y(b[1]);
            const base = ctx.y(b[0]);
            return { i, x: slot.x, y: Math.min(top, base), width: slot.width, height: Math.abs(base - top) };
        });
    });

    function onClick(): void {
        ctx.selectDataKey(ctx.selectedDataKey === dataKey ? null : dataKey);
    }
</script>

<span hidden use:syncRegistration={[dataKey, variant, strokeVariant]}></span>
{#if rects.length}
    <svg class="dk-layer dk-front">
        <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            {#each rects as r (r.i)}
                <rect x={r.x} y={r.y} width={r.width} height={r.height} fill="transparent" class="dk-hit" onclick={onClick} role="presentation" />
            {/each}
        </g>
    </svg>
{/if}
{@render children?.()}
