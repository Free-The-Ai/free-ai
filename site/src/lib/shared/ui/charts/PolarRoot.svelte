<script lang="ts">
    import { setContext } from "svelte";
    import type { Snippet } from "svelte";
    import { type CommonChart, CommonKey, type PolarChartContextValue, PolarKey } from "@/shared/lib/dither/chart-context";
    import type { AreaVariant, ChartConfig, Margins } from "@/shared/lib/dither/chart-types";
    import type { BloomInput } from "@/shared/lib/dither/dither-paint";
    import { seedOfColor } from "@/shared/lib/dither/palette";
    import { axisAtAngle, pieSlices, radarAxes, sliceAtAngle } from "@/shared/lib/dither/polar";
    import { useChartDimensions } from "@/shared/lib/dither/use-chart-dimensions.svelte";
    import { watchDeps } from "@/shared/lib/watchDeps";
    import "./charts.css";

    type Row = Record<string, unknown>;

    let {
        chartType,
        data,
        config,
        dataKey = "",
        nameKey,
        innerRadius: innerRadiusProp = 0,
        margins: marginsProp,
        animate = true,
        animationDuration = 900,
        replayToken = 0,
        bloom = "off",
        bloomOnHover = false,
        defaultSelectedDataKey = null,
        onselectionchange,
        back,
        canvas,
        children,
    }: {
        chartType: "pie" | "radar";
        data: object[];
        config: ChartConfig;
        dataKey?: string;
        nameKey: string;
        innerRadius?: number;
        margins?: Partial<Margins>;
        animate?: boolean;
        animationDuration?: number;
        replayToken?: number;
        bloom?: BloomInput;
        bloomOnHover?: boolean;
        defaultSelectedDataKey?: string | null;
        onselectionchange?: (key: string | null) => void;
        back?: Snippet;
        canvas?: Snippet;
        children?: Snippet;
    } = $props();

    const DEFAULT_MARGINS: Margins = { top: 22, right: 14, bottom: 14, left: 14 };

    const { size, resize } = useChartDimensions();
    let elRef: HTMLDivElement | undefined = $state();
    const rows = () => data as Row[];

    const margins = $derived<Margins>({ ...DEFAULT_MARGINS, ...marginsProp });
    const configKeys = $derived(Object.keys(config));

    let revision = $state(0);
    const bumpRevision = watchDeps(() => {
        revision += 1;
    });

    let selectedDataKey = $state<string | null>(defaultSelectedDataKey);
    let focusDataKey = $state<string | null>(null);
    let hoverIndex = $state<number | null>(null);
    let cursorX = $state(0);
    let cursorY = $state(0);
    let isMouseInChart = $state(false);
    let variants = $state<Record<string, AreaVariant>>({});

    const plot = $derived({
        width: Math.max(0, size.width - margins.left - margins.right),
        height: Math.max(0, size.height - margins.top - margins.bottom),
    });
    const ready = $derived(plot.width > 0 && plot.height > 0);
    const pad = $derived(chartType === "radar" ? 20 : 6);
    const outerRadius = $derived(Math.max(0, Math.min(plot.width, plot.height) / 2 - pad));
    const innerRadius = $derived(chartType === "pie" ? outerRadius * innerRadiusProp : 0);
    const center = $derived({ x: plot.width / 2, y: plot.height / 2 });

    const pie = $derived(chartType === "pie" ? pieSlices(rows(), dataKey, nameKey) : null);
    const radar = $derived.by(() => {
        if (chartType !== "radar") return null;
        let max = 0;
        for (const row of rows()) {
            for (const key of configKeys) {
                const v = Number(row[key]) || 0;
                if (v > max) max = v;
            }
        }
        return { axes: radarAxes(rows(), nameKey), max: max || 1 };
    });

    function seedOf(key: string) {
        return seedOfColor(config[key]?.color ?? "grey");
    }
    function variantOf(key: string): AreaVariant {
        return variants[key] ?? variants["*"] ?? "gradient";
    }
    function registerVariant(key: string, variant: AreaVariant): void {
        if (variants[key] === variant) return;
        variants = { ...variants, [key]: variant };
    }
    function unregisterVariant(key: string): void {
        if (!(key in variants)) return;
        const next = { ...variants };
        delete next[key];
        variants = next;
    }
    function selectDataKey(key: string | null): void {
        selectedDataKey = key;
        onselectionchange?.(key);
    }

    const common: CommonChart = {
        get names() {
            return chartType === "pie" && pie ? pie.map((s) => s.name) : configKeys;
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
            return Math.max(margins.top + 44, cursorY);
        },
        heading: (i) => (chartType === "pie" ? (pie?.[i]?.name ?? null) : (radar?.axes[i]?.label ?? null)),
        itemsAt: (i) => {
            const emphasis = selectedDataKey ?? focusDataKey;
            if (chartType === "pie" && pie) {
                const s = pie[i];
                if (!s) return [];
                return [
                    {
                        name: s.name,
                        label: config[s.name]?.label ?? s.name,
                        value: s.value,
                        seed: seedOf(s.name),
                        dimmed: emphasis !== null && emphasis !== s.name,
                    },
                ];
            }
            return configKeys.map((name) => {
                const raw = rows()[i]?.[name];
                return {
                    name,
                    label: config[name]?.label ?? name,
                    value: typeof raw === "number" ? raw : 0,
                    seed: seedOf(name),
                    dimmed: emphasis !== null && emphasis !== name,
                };
            });
        },
    };

    const ctx: PolarChartContextValue = {
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
        get ready() {
            return ready;
        },
        get plot() {
            return plot;
        },
        get margins() {
            return margins;
        },
        get center() {
            return center;
        },
        get outerRadius() {
            return outerRadius;
        },
        get innerRadius() {
            return innerRadius;
        },
        get animate() {
            return animate;
        },
        get animationDuration() {
            return animationDuration;
        },
        get revision() {
            return revision;
        },
        get bloom() {
            return bloom;
        },
        get bloomOnHover() {
            return bloomOnHover;
        },
        seedOf,
        variantOf,
        registerVariant,
        unregisterVariant,
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
        setCursor: (px, py) => {
            cursorX = px;
            cursorY = py;
        },
        get isMouseInChart() {
            return isMouseInChart;
        },
        setMouseInChart: (over) => {
            isMouseInChart = over;
        },
        get pie() {
            return pie;
        },
        get radar() {
            return radar;
        },
        common,
    };

    setContext(PolarKey, ctx);
    setContext(CommonKey, common);

    function onMove(e: PointerEvent): void {
        const el = elRef;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - rect.left - margins.left - center.x;
        const dy = e.clientY - rect.top - margins.top - center.y;
        const angle = Math.atan2(dy, dx);
        const r = Math.hypot(dx, dy);
        if (chartType === "pie" && pie) {
            const inside = r <= outerRadius && r >= innerRadius;
            const i = inside ? sliceAtAngle(pie, angle) : -1;
            hoverIndex = i >= 0 ? i : null;
        } else if (radar) {
            hoverIndex = axisAtAngle(radar.axes, angle);
        }
        cursorX = e.clientX - rect.left;
        cursorY = e.clientY - rect.top;
    }
    function onLeave(): void {
        isMouseInChart = false;
        hoverIndex = null;
    }
</script>

<div
    bind:this={elRef}
    use:resize
    use:bumpRevision={[data, replayToken]}
    class="dk-root"
    onpointerenter={() => (isMouseInChart = true)}
    onpointermove={onMove}
    onpointerleave={onLeave}
>
    {@render back?.()}
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
