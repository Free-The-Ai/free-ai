<script lang="ts">
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";
    import {
        type ChartContextValue,
        ChartKey,
        type CommonChart,
        CommonKey,
    } from "@/shared/lib/dither/chart-context";
    import type { ChartType, Margins, SeriesSpec } from "@/shared/lib/dither/chart-types";
    import type { BloomInput } from "@/shared/lib/dither/dither-paint";
    import { seedOfColor } from "@/shared/lib/dither/palette";
    import {
        buildBandScale,
        buildXScale,
        buildYScale,
        computeBands,
        indexAtBand,
        nearestIndex,
    } from "@/shared/lib/dither/scales";
    import { useChartDimensions } from "@/shared/lib/dither/use-chart-dimensions.svelte";
    import { watchDeps } from "@/shared/lib/watchDeps";
    import "./charts.css";

    type Row = Record<string, unknown>;

    let {
        chartType,
        data,
        config,
        stackType = "default",
        margins: marginsProp,
        animate = true,
        animationDuration = 900,
        replayToken = 0,
        interactive = true,
        markerIndex = null,
        hovered = false,
        bloom = "off",
        bloomOnHover = false,
        defaultSelectedDataKey = null,
        onhoverchange,
        onselectionchange,
        canvas,
        children,
    }: {
        chartType: ChartType;
        data: object[];
        config: Record<string, { label?: string; color: import("@/shared/lib/dither/palette").DitherColor }>;
        stackType?: "default" | "stacked" | "percent";
        margins?: Partial<Margins>;
        animate?: boolean;
        animationDuration?: number;
        replayToken?: number;
        interactive?: boolean;
        markerIndex?: number | null;
        hovered?: boolean;
        bloom?: BloomInput;
        bloomOnHover?: boolean;
        defaultSelectedDataKey?: string | null;
        onhoverchange?: (index: number | null) => void;
        onselectionchange?: (key: string | null) => void;
        canvas?: Snippet;
        children?: Snippet;
    } = $props();

    const DEFAULT_MARGINS: Margins = { top: 10, right: 12, bottom: 22, left: 36 };

    const { size, resize } = useChartDimensions();
    let elRef: HTMLDivElement | undefined = $state();
    const rows = () => data as Row[];

    const margins = $derived<Margins>({ ...DEFAULT_MARGINS, ...marginsProp });
    const configKeys = $derived(Object.keys(config));

    // Entrance replay: bump revision when data identity or replay token changes.
    let revision = $state(0);
    const bumpRevision = watchDeps(() => {
        revision += 1;
    });

    // svelte-ignore state_referenced_locally
    let selectedDataKey = $state<string | null>(defaultSelectedDataKey);
    let focusDataKey = $state<string | null>(null);
    let hoverIndex = $state<number | null>(null);
    let cursorX = $state(0);
    let isMouseInChart = $state(false);
    let seriesSpecs = $state<Record<string, SeriesSpec>>({});

    // svelte-ignore state_referenced_locally
    let entranceDone = $state(!animate);
    const resetEntrance = watchDeps(() => {
        entranceDone = !animate;
    });

    const plot = $derived({
        width: Math.max(0, size.width - margins.left - margins.right),
        height: Math.max(0, size.height - margins.top - margins.bottom),
    });
    const ready = $derived(plot.width > 0 && plot.height > 0);

    const banded = $derived(computeBands(rows(), configKeys, stackType));
    const isBar = $derived(chartType === "bar");
    const xPoint = $derived(buildXScale(data.length, plot.width));
    const xBand = $derived(buildBandScale(data.length, plot.width));
    const bandwidth = $derived(isBar ? xBand.bandwidth() : 0);
    const stacked = $derived(stackType === "stacked" || stackType === "percent");
    const yScale = $derived(buildYScale(banded.max, plot.height));

    function xCenter(i: number): number {
        return isBar ? (xBand(i) ?? 0) + xBand.bandwidth() / 2 : (xPoint(i) ?? 0);
    }
    function indexAtX(px: number): number {
        return isBar ? indexAtBand(px, data.length, plot.width) : nearestIndex(px, data.length, plot.width);
    }
    function barSlot(i: number, si: number, n: number): { x: number; width: number } {
        const center = xCenter(i);
        if (stacked) {
            const w = bandwidth * 0.9;
            return { x: center - w / 2, width: w };
        }
        const slot = bandwidth / Math.max(n, 1);
        return { x: center - bandwidth / 2 + si * slot + slot * 0.08, width: slot * 0.84 };
    }
    function seedOf(key: string) {
        return seedOfColor(config[key]?.color ?? "grey");
    }

    function registerSeries(spec: SeriesSpec): void {
        const cur = seriesSpecs[spec.dataKey];
        if (cur && cur.kind === spec.kind && cur.variant === spec.variant && cur.strokeVariant === spec.strokeVariant) return;
        seriesSpecs = { ...seriesSpecs, [spec.dataKey]: spec };
    }
    function unregisterSeries(dataKey: string): void {
        if (!(dataKey in seriesSpecs)) return;
        const next = { ...seriesSpecs };
        delete next[dataKey];
        seriesSpecs = next;
    }
    function selectDataKey(key: string | null): void {
        selectedDataKey = key;
        onselectionchange?.(key);
    }

    const common: CommonChart = {
        get names() {
            return configKeys;
        },
        labelOf: (n) => config[n]?.label ?? n,
        seedOf,
        get selectedDataKey() {
            return selectedDataKey;
        },
        selectDataKey,
        get focusDataKey() {
            return focusDataKey;
        },
        setFocusDataKey: (k) => {
            focusDataKey = k;
        },
        get hoverIndex() {
            return hoverIndex;
        },
        get ready() {
            return ready;
        },
        get tooltipLeft() {
            return Math.max(48, Math.min(plot.width + margins.left - 48, cursorX));
        },
        get tooltipTop() {
            // Follow the highest hovered node so the card rides the data path, with
            // headroom so the upward-lifted card never clips the top.
            const floor = margins.top + 44;
            if (hoverIndex == null) return floor;
            let minY = Number.POSITIVE_INFINITY;
            for (const key of configKeys) {
                const b = banded.bands[key]?.[hoverIndex];
                if (b) minY = Math.min(minY, yScale(b[1]));
            }
            if (!Number.isFinite(minY)) return floor;
            return Math.max(floor, margins.top + minY);
        },
        heading: (i, labelKey) => (labelKey ? String(rows()[i]?.[labelKey] ?? "") : null),
        itemsAt: (i) =>
            configKeys.map((name) => {
                const raw = rows()[i]?.[name];
                const emphasis = selectedDataKey ?? focusDataKey;
                return {
                    name,
                    label: config[name]?.label ?? name,
                    value: typeof raw === "number" ? raw : 0,
                    seed: seedOf(name),
                    dimmed: emphasis !== null && emphasis !== name,
                };
            }),
    };

    const ctx: ChartContextValue = {
        get chartType() {
            return chartType;
        },
        get config() {
            return config;
        },
        get configKeys() {
            return configKeys;
        },
        get data() {
            return rows();
        },
        get dataLength() {
            return data.length;
        },
        get stackType() {
            return stackType;
        },
        get margins() {
            return margins;
        },
        get plot() {
            return plot;
        },
        get ready() {
            return ready;
        },
        xCenter,
        get bandwidth() {
            return bandwidth;
        },
        indexAtX,
        barSlot,
        get y() {
            return yScale;
        },
        get bands() {
            return banded.bands;
        },
        get max() {
            return banded.max;
        },
        get selectedDataKey() {
            return selectedDataKey;
        },
        selectDataKey,
        get focusDataKey() {
            return focusDataKey;
        },
        setFocusDataKey: (k) => {
            focusDataKey = k;
        },
        get hoverIndex() {
            return hoverIndex;
        },
        setHoverIndex: (i) => {
            hoverIndex = i;
        },
        get markerIndex() {
            return markerIndex;
        },
        get cursorX() {
            return cursorX;
        },
        setCursorX: (px) => {
            cursorX = px;
        },
        get isMouseInChart() {
            return isMouseInChart;
        },
        setMouseInChart: (over) => {
            isMouseInChart = over;
        },
        get hovered() {
            return hovered;
        },
        get bloom() {
            return bloom;
        },
        get bloomOnHover() {
            return bloomOnHover;
        },
        get seriesSpecs() {
            return seriesSpecs;
        },
        registerSeries,
        unregisterSeries,
        get animate() {
            return animate;
        },
        get animationDuration() {
            return animationDuration;
        },
        get revision() {
            return revision;
        },
        get entranceDone() {
            return entranceDone;
        },
        markEntranceDone: () => {
            entranceDone = true;
        },
        seedOf,
        common,
    };

    setContext(ChartKey, ctx);
    setContext(CommonKey, common);

    function onMove(e: PointerEvent): void {
        const el = elRef;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = e.clientX - rect.left - margins.left;
        const index = indexAtX(px);
        hoverIndex = index;
        cursorX = e.clientX - rect.left;
        onhoverchange?.(index);
    }
    function onLeave(): void {
        isMouseInChart = false;
        hoverIndex = null;
        onhoverchange?.(null);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={elRef}
    use:resize
    use:bumpRevision={[data, replayToken]}
    use:resetEntrance={[revision]}
    class="dk-root"
    onpointerenter={() => (isMouseInChart = true)}
    onpointermove={interactive ? onMove : undefined}
    onpointerleave={onLeave}
>
    {@render canvas?.()}
    {@render children?.()}
</div>

<style>
    .dk-root {
        position: relative;
        height: 100%;
        width: 100%;
    }
</style>
