// Inject keys, context value types, and boundary-guard composables for the
// dither chart engine. The reactive controllers that build these values live in
// the root components (CartesianRoot.vue / PolarRoot.vue) — Vue's natural home
// for provided state — so this module stays framework-glue only.

import { type InjectionKey, inject } from "vue";
import type { ScaleLinear } from "d3-scale";
import type {
    AreaVariant,
    ChartConfig,
    ChartType,
    Margins,
    SeriesSpec,
    StackType,
    TooltipItem,
} from "./chart-types";
import type { BloomInput } from "./dither-paint";
import type { Seed } from "./palette";
import type { PieSlice, RadarAxis } from "./polar";

type Row = Record<string, unknown>;

/** The minimal surface shared by every chart family, so <Legend> and <Tooltip>
 * work identically under a cartesian, bar, or polar root. */
export type CommonChart = {
    names: string[];
    labelOf: (name: string) => string;
    seedOf: (name: string) => Seed;
    selectedDataKey: string | null;
    selectDataKey: (key: string | null) => void;
    focusDataKey: string | null;
    setFocusDataKey: (key: string | null) => void;
    hoverIndex: number | null;
    heading: (index: number, labelKey?: string) => string | null;
    itemsAt: (index: number) => TooltipItem[];
    ready: boolean;
    tooltipLeft: number;
    tooltipTop: number;
};

export type ChartContextValue = {
    chartType: ChartType;
    config: ChartConfig;
    configKeys: string[];
    data: Row[];
    dataLength: number;
    stackType: StackType;
    margins: Margins;
    plot: { width: number; height: number };
    ready: boolean;
    xCenter: (index: number) => number;
    bandwidth: number;
    indexAtX: (px: number) => number;
    barSlot: (index: number, seriesIndex: number, seriesCount: number) => { x: number; width: number };
    y: ScaleLinear<number, number>;
    bands: Record<string, [number, number][]>;
    max: number;
    selectedDataKey: string | null;
    selectDataKey: (key: string | null) => void;
    focusDataKey: string | null;
    setFocusDataKey: (key: string | null) => void;
    hoverIndex: number | null;
    setHoverIndex: (index: number | null) => void;
    markerIndex: number | null;
    cursorX: number;
    setCursorX: (px: number) => void;
    isMouseInChart: boolean;
    setMouseInChart: (over: boolean) => void;
    hovered: boolean;
    bloom: BloomInput;
    bloomOnHover: boolean;
    seriesSpecs: Record<string, SeriesSpec>;
    registerSeries: (spec: SeriesSpec) => void;
    unregisterSeries: (dataKey: string) => void;
    animate: boolean;
    animationDuration: number;
    revision: number;
    entranceDone: boolean;
    markEntranceDone: () => void;
    seedOf: (key: string) => Seed;
    common: CommonChart;
};

export type PolarChartContextValue = {
    chartType: ChartType;
    config: ChartConfig;
    configKeys: string[];
    data: Row[];
    dataLength: number;
    ready: boolean;
    plot: { width: number; height: number };
    margins: Margins;
    center: { x: number; y: number };
    outerRadius: number;
    innerRadius: number;
    animate: boolean;
    animationDuration: number;
    revision: number;
    bloom: BloomInput;
    bloomOnHover: boolean;
    seedOf: (key: string) => Seed;
    variantOf: (key: string) => AreaVariant;
    registerVariant: (key: string, variant: AreaVariant) => void;
    unregisterVariant: (key: string) => void;
    selectedDataKey: string | null;
    selectDataKey: (key: string | null) => void;
    focusDataKey: string | null;
    setFocusDataKey: (key: string | null) => void;
    hoverIndex: number | null;
    setHoverIndex: (i: number | null) => void;
    setCursor: (px: number, py: number) => void;
    isMouseInChart: boolean;
    setMouseInChart: (over: boolean) => void;
    pie: PieSlice[] | null;
    radar: { axes: RadarAxis[]; max: number } | null;
    common: CommonChart;
};

export type SeriesContextValue = { dataKey: string; seed: Seed; dimmed: boolean };

// Root component prop shapes. `data: object[]` (not Record<string,unknown>[]):
// interfaces lack an index signature, so interface-typed rows wouldn't satisfy
// the record type — internal layers cast rows to Row for keyed reads.
export type CartesianChartProps = {
    data: object[];
    config: ChartConfig;
    stackType?: StackType;
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
};

export type PieChartProps = {
    data: object[];
    config: ChartConfig;
    dataKey: string;
    nameKey: string;
    innerRadius?: number;
    margins?: Partial<Margins>;
    animate?: boolean;
    animationDuration?: number;
    replayToken?: number;
    bloom?: BloomInput;
    bloomOnHover?: boolean;
    defaultSelectedDataKey?: string | null;
};

export type RadarChartProps = {
    data: object[];
    config: ChartConfig;
    nameKey: string;
    margins?: Partial<Margins>;
    animate?: boolean;
    animationDuration?: number;
    replayToken?: number;
    bloom?: BloomInput;
    bloomOnHover?: boolean;
    defaultSelectedDataKey?: string | null;
};

export const ChartKey: InjectionKey<ChartContextValue> = Symbol("dk-chart");
export const CommonKey: InjectionKey<CommonChart> = Symbol("dk-common");
export const SeriesKey: InjectionKey<SeriesContextValue> = Symbol("dk-series");
export const PolarKey: InjectionKey<PolarChartContextValue> = Symbol("dk-polar");

const ROOT_OF: Record<ChartType, string> = {
    area: "<AreaChart>",
    bar: "<BarChart>",
    line: "<LineChart>",
    pie: "<PieChart>",
    radar: "<RadarChart>",
};

/** Generic accessor for internal layers (canvas/overlay) under any cartesian root. */
export function useChart(): ChartContextValue {
    const ctx = inject(ChartKey, null);
    if (!ctx) throw new Error("Chart parts must be used within a chart root (e.g. <AreaChart>).");
    return ctx;
}

/** Boundary guard for a composable cartesian part. Throws when used outside a
 * root, or inside the wrong chart type. `kind` omitted = works under any root. */
export function useChartPart(part: string, kind?: ChartType | ChartType[]): ChartContextValue {
    const ctx = inject(ChartKey, null);
    if (!ctx) {
        const where = kind ? ROOT_OF[Array.isArray(kind) ? kind[0] : kind] : "a chart root";
        throw new Error(`<${part}> must be used within ${where}.`);
    }
    if (kind) {
        const allowed = Array.isArray(kind) ? kind : [kind];
        if (!allowed.includes(ctx.chartType)) {
            throw new Error(
                `<${part}> is not valid inside ${ROOT_OF[ctx.chartType]} — it belongs in ${allowed
                    .map((k) => ROOT_OF[k])
                    .join(" or ")}.`,
            );
        }
    }
    return ctx;
}

export function useCommonChart(): CommonChart {
    const ctx = inject(CommonKey, null);
    if (!ctx) throw new Error("<Legend> / <Tooltip> must be used within a chart root.");
    return ctx;
}

/** Boundary guard for series-scoped markers (<Dot>, <ActiveDot>). */
export function useSeries(part: string): SeriesContextValue {
    const ctx = inject(SeriesKey, null);
    if (!ctx) throw new Error(`<${part}> must be rendered inside a series (e.g. <Area>).`);
    return ctx;
}

export function usePolarChart(): PolarChartContextValue {
    const ctx = inject(PolarKey, null);
    if (!ctx) throw new Error("Polar chart parts must be used within a polar chart root.");
    return ctx;
}

/** Boundary guard for polar parts (<Pie>, <Radar>). */
export function usePolarPart(part: string, kind: "pie" | "radar"): PolarChartContextValue {
    const ctx = inject(PolarKey, null);
    if (!ctx) throw new Error(`<${part}> must be used within ${ROOT_OF[kind]}.`);
    if (ctx.chartType !== kind) {
        throw new Error(
            `<${part}> is not valid inside ${ROOT_OF[ctx.chartType]} — it belongs in ${ROOT_OF[kind]}.`,
        );
    }
    return ctx;
}
