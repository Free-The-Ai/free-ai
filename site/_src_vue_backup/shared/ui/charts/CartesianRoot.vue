<script setup lang="ts">
import { computed, provide, ref, watch } from "vue";
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
import { useChartDimensions } from "@/shared/lib/dither/use-chart-dimensions";
import "./charts.css";

type Row = Record<string, unknown>;

const props = withDefaults(
    defineProps<{
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
    }>(),
    {
        stackType: "default",
        animate: true,
        animationDuration: 900,
        replayToken: 0,
        interactive: true,
        markerIndex: null,
        hovered: false,
        bloom: "off",
        bloomOnHover: false,
        defaultSelectedDataKey: null,
    },
);

const emit = defineEmits<{ hoverChange: [number | null]; selectionChange: [string | null] }>();

const DEFAULT_MARGINS: Margins = { top: 10, right: 12, bottom: 22, left: 36 };

const { elRef, size } = useChartDimensions();
const rows = () => props.data as Row[];

const margins = computed<Margins>(() => ({ ...DEFAULT_MARGINS, ...props.margins }));
const configKeys = computed(() => Object.keys(props.config));

// Entrance replay: bump revision when data identity or replay token changes.
const revision = ref(0);
watch(
    () => [props.data, props.replayToken],
    () => {
        revision.value += 1;
    },
);

const selectedDataKey = ref<string | null>(props.defaultSelectedDataKey);
const focusDataKey = ref<string | null>(null);
const hoverIndex = ref<number | null>(null);
const cursorX = ref(0);
const isMouseInChart = ref(false);
const seriesSpecs = ref<Record<string, SeriesSpec>>({});

const entranceDone = ref(!props.animate);
watch(revision, () => {
    entranceDone.value = !props.animate;
});

const plot = computed(() => ({
    width: Math.max(0, size.width - margins.value.left - margins.value.right),
    height: Math.max(0, size.height - margins.value.top - margins.value.bottom),
}));
const ready = computed(() => plot.value.width > 0 && plot.value.height > 0);

const banded = computed(() => computeBands(rows(), configKeys.value, props.stackType));
const isBar = computed(() => props.chartType === "bar");
const xPoint = computed(() => buildXScale(props.data.length, plot.value.width));
const xBand = computed(() => buildBandScale(props.data.length, plot.value.width));
const bandwidth = computed(() => (isBar.value ? xBand.value.bandwidth() : 0));
const stacked = computed(() => props.stackType === "stacked" || props.stackType === "percent");
const yScale = computed(() => buildYScale(banded.value.max, plot.value.height));

function xCenter(i: number): number {
    return isBar.value ? (xBand.value(i) ?? 0) + xBand.value.bandwidth() / 2 : (xPoint.value(i) ?? 0);
}
function indexAtX(px: number): number {
    return isBar.value
        ? indexAtBand(px, props.data.length, plot.value.width)
        : nearestIndex(px, props.data.length, plot.value.width);
}
function barSlot(i: number, si: number, n: number): { x: number; width: number } {
    const center = xCenter(i);
    if (stacked.value) {
        const w = bandwidth.value * 0.9;
        return { x: center - w / 2, width: w };
    }
    const slot = bandwidth.value / Math.max(n, 1);
    return { x: center - bandwidth.value / 2 + si * slot + slot * 0.08, width: slot * 0.84 };
}
function seedOf(key: string) {
    return seedOfColor(props.config[key]?.color ?? "grey");
}

function registerSeries(spec: SeriesSpec): void {
    const cur = seriesSpecs.value[spec.dataKey];
    if (
        cur &&
        cur.kind === spec.kind &&
        cur.variant === spec.variant &&
        cur.strokeVariant === spec.strokeVariant
    )
        return;
    seriesSpecs.value = { ...seriesSpecs.value, [spec.dataKey]: spec };
}
function unregisterSeries(dataKey: string): void {
    if (!(dataKey in seriesSpecs.value)) return;
    const next = { ...seriesSpecs.value };
    delete next[dataKey];
    seriesSpecs.value = next;
}
function selectDataKey(key: string | null): void {
    selectedDataKey.value = key;
    emit("selectionChange", key);
}

const common: CommonChart = {
    get names() {
        return configKeys.value;
    },
    labelOf: (n) => props.config[n]?.label ?? n,
    seedOf,
    get selectedDataKey() {
        return selectedDataKey.value;
    },
    selectDataKey,
    get focusDataKey() {
        return focusDataKey.value;
    },
    setFocusDataKey: (k) => {
        focusDataKey.value = k;
    },
    get hoverIndex() {
        return hoverIndex.value;
    },
    get ready() {
        return ready.value;
    },
    get tooltipLeft() {
        return Math.max(48, Math.min(plot.value.width + margins.value.left - 48, cursorX.value));
    },
    get tooltipTop() {
        // Follow the highest hovered node so the card rides the data path, with
        // headroom so the upward-lifted card never clips the top.
        const floor = margins.value.top + 44;
        if (hoverIndex.value == null) return floor;
        let minY = Number.POSITIVE_INFINITY;
        for (const key of configKeys.value) {
            const b = banded.value.bands[key]?.[hoverIndex.value];
            if (b) minY = Math.min(minY, yScale.value(b[1]));
        }
        if (!Number.isFinite(minY)) return floor;
        return Math.max(floor, margins.value.top + minY);
    },
    heading: (i, labelKey) => (labelKey ? String(rows()[i]?.[labelKey] ?? "") : null),
    itemsAt: (i) =>
        configKeys.value.map((name) => {
            const raw = rows()[i]?.[name];
            const emphasis = selectedDataKey.value ?? focusDataKey.value;
            return {
                name,
                label: props.config[name]?.label ?? name,
                value: typeof raw === "number" ? raw : 0,
                seed: seedOf(name),
                dimmed: emphasis !== null && emphasis !== name,
            };
        }),
};

const ctx: ChartContextValue = {
    get chartType() {
        return props.chartType;
    },
    get config() {
        return props.config;
    },
    get configKeys() {
        return configKeys.value;
    },
    get data() {
        return rows();
    },
    get dataLength() {
        return props.data.length;
    },
    get stackType() {
        return props.stackType;
    },
    get margins() {
        return margins.value;
    },
    get plot() {
        return plot.value;
    },
    get ready() {
        return ready.value;
    },
    xCenter,
    get bandwidth() {
        return bandwidth.value;
    },
    indexAtX,
    barSlot,
    get y() {
        return yScale.value;
    },
    get bands() {
        return banded.value.bands;
    },
    get max() {
        return banded.value.max;
    },
    get selectedDataKey() {
        return selectedDataKey.value;
    },
    selectDataKey,
    get focusDataKey() {
        return focusDataKey.value;
    },
    setFocusDataKey: (k) => {
        focusDataKey.value = k;
    },
    get hoverIndex() {
        return hoverIndex.value;
    },
    setHoverIndex: (i) => {
        hoverIndex.value = i;
    },
    get markerIndex() {
        return props.markerIndex;
    },
    get cursorX() {
        return cursorX.value;
    },
    setCursorX: (px) => {
        cursorX.value = px;
    },
    get isMouseInChart() {
        return isMouseInChart.value;
    },
    setMouseInChart: (over) => {
        isMouseInChart.value = over;
    },
    get hovered() {
        return props.hovered;
    },
    get bloom() {
        return props.bloom;
    },
    get bloomOnHover() {
        return props.bloomOnHover;
    },
    get seriesSpecs() {
        return seriesSpecs.value;
    },
    registerSeries,
    unregisterSeries,
    get animate() {
        return props.animate;
    },
    get animationDuration() {
        return props.animationDuration;
    },
    get revision() {
        return revision.value;
    },
    get entranceDone() {
        return entranceDone.value;
    },
    markEntranceDone: () => {
        entranceDone.value = true;
    },
    seedOf,
    common,
};

provide(ChartKey, ctx);
provide(CommonKey, common);

function onMove(e: PointerEvent): void {
    const el = elRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left - margins.value.left;
    const index = indexAtX(px);
    hoverIndex.value = index;
    cursorX.value = e.clientX - rect.left;
    emit("hoverChange", index);
}
function onLeave(): void {
    isMouseInChart.value = false;
    hoverIndex.value = null;
    emit("hoverChange", null);
}
</script>

<template>
    <div
        ref="elRef"
        class="dk-root"
        @pointerenter="isMouseInChart = true"
        @pointermove="interactive ? onMove($event) : undefined"
        @pointerleave="onLeave"
    >
        <slot name="canvas" />
        <slot />
    </div>
</template>

<style scoped>
.dk-root {
    position: relative;
    height: 100%;
    width: 100%;
}
</style>
