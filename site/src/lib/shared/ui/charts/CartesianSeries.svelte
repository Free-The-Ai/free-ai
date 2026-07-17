<script lang="ts">
    import type { Snippet } from "svelte";
    import { type SeriesContextValue, SeriesKey, useChartPart } from "@/shared/lib/dither/chart-context";
    import type { AreaVariant, SeriesKind, StrokeVariant } from "@/shared/lib/dither/chart-types";
    import { watchDeps } from "@/shared/lib/watchDeps";
    import { onDestroy, setContext } from "svelte";

    let {
        part,
        kind,
        dataKey,
        variant = "gradient",
        strokeVariant = "solid",
        isClickable = false,
        children,
    }: {
        part: string;
        kind: SeriesKind;
        dataKey: string;
        variant?: AreaVariant;
        strokeVariant?: StrokeVariant;
        isClickable?: boolean;
        children?: Snippet;
    } = $props();

    const ctx = useChartPart(part, kind === "line" ? "line" : "area");

    if (import.meta.env.DEV && !ctx.config[dataKey]) {
        console.warn(
            `<${part} dataKey="${dataKey}">: "${dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`,
        );
    }

    const syncRegistration = watchDeps(() => {
        ctx.registerSeries({ dataKey, kind, variant, strokeVariant });
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
            const emphasis = ctx.selectedDataKey ?? ctx.focusDataKey;
            return emphasis !== null && emphasis !== dataKey;
        },
    };
    setContext(SeriesKey, series);

    // Transparent hit polygon tracing the series' own band, so clicking selects it.
    const hitPath = $derived.by((): string | null => {
        if (!isClickable || !ctx.ready) return null;
        const band = ctx.bands[dataKey];
        if (!band) return null;
        const parts: string[] = [];
        band.forEach((b, i) => {
            parts.push(`${i === 0 ? "M" : "L"}${ctx.xCenter(i)},${ctx.y(b[1])}`);
        });
        for (let i = band.length - 1; i >= 0; i -= 1) {
            parts.push(`L${ctx.xCenter(i)},${ctx.y(band[i][0])}`);
        }
        return `${parts.join(" ")} Z`;
    });

    function onClick(): void {
        ctx.selectDataKey(ctx.selectedDataKey === dataKey ? null : dataKey);
    }
</script>

<span hidden use:syncRegistration={[dataKey, kind, variant, strokeVariant]}></span>
{#if hitPath}
    <svg class="dk-layer dk-front">
        <g transform={`translate(${ctx.margins.left},${ctx.margins.top})`}>
            <path d={hitPath} fill="transparent" class="dk-hit" onclick={onClick} role="presentation" />
        </g>
    </svg>
{/if}
{@render children?.()}
