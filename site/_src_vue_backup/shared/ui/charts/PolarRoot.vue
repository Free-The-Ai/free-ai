<script setup lang="ts">
import { computed, provide, ref, watch } from "vue";
import { type CommonChart, CommonKey, type PolarChartContextValue, PolarKey } from "@/shared/lib/dither/chart-context";
import type { AreaVariant, ChartConfig, Margins } from "@/shared/lib/dither/chart-types";
import type { BloomInput } from "@/shared/lib/dither/dither-paint";
import { seedOfColor } from "@/shared/lib/dither/palette";
import { axisAtAngle, pieSlices, radarAxes, sliceAtAngle } from "@/shared/lib/dither/polar";
import { useChartDimensions } from "@/shared/lib/dither/use-chart-dimensions";
import "./charts.css";

type Row = Record<string, unknown>;

const props = withDefaults(
    defineProps<{
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
    }>(),
    {
        dataKey: "",
        innerRadius: 0,
        animate: true,
        animationDuration: 900,
        replayToken: 0,
        bloom: "off",
        bloomOnHover: false,
        defaultSelectedDataKey: null,
    },
);

const emit = defineEmits<{ selectionChange: [string | null] }>();

const DEFAULT_MARGINS: Margins = { top: 22, right: 14, bottom: 14, left: 14 };

const { elRef, size } = useChartDimensions();
const rows = () => props.data as Row[];

const margins = computed<Margins>(() => ({ ...DEFAULT_MARGINS, ...props.margins }));
const configKeys = computed(() => Object.keys(props.config));

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
const cursorY = ref(0);
const isMouseInChart = ref(false);
const variants = ref<Record<string, AreaVariant>>({});

const plot = computed(() => ({
    width: Math.max(0, size.width - margins.value.left - margins.value.right),
    height: Math.max(0, size.height - margins.value.top - margins.value.bottom),
}));
const ready = computed(() => plot.value.width > 0 && plot.value.height > 0);
const pad = computed(() => (props.chartType === "radar" ? 20 : 6));
const outerRadius = computed(() => Math.max(0, Math.min(plot.value.width, plot.value.height) / 2 - pad.value));
const innerRadius = computed(() => (props.chartType === "pie" ? outerRadius.value * props.innerRadius : 0));
const center = computed(() => ({ x: plot.value.width / 2, y: plot.value.height / 2 }));

const pie = computed(() =>
    props.chartType === "pie" ? pieSlices(rows(), props.dataKey, props.nameKey) : null,
);
const radar = computed(() => {
    if (props.chartType !== "radar") return null;
    let max = 0;
    for (const row of rows()) {
        for (const key of configKeys.value) {
            const v = Number(row[key]) || 0;
            if (v > max) max = v;
        }
    }
    return { axes: radarAxes(rows(), props.nameKey), max: max || 1 };
});

function seedOf(key: string) {
    return seedOfColor(props.config[key]?.color ?? "grey");
}
function variantOf(key: string): AreaVariant {
    return variants.value[key] ?? variants.value["*"] ?? "gradient";
}
function registerVariant(key: string, variant: AreaVariant): void {
    if (variants.value[key] === variant) return;
    variants.value = { ...variants.value, [key]: variant };
}
function unregisterVariant(key: string): void {
    if (!(key in variants.value)) return;
    const next = { ...variants.value };
    delete next[key];
    variants.value = next;
}
function selectDataKey(key: string | null): void {
    selectedDataKey.value = key;
    emit("selectionChange", key);
}

const common: CommonChart = {
    get names() {
        return props.chartType === "pie" && pie.value ? pie.value.map((s) => s.name) : configKeys.value;
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
        return Math.max(margins.value.top + 44, cursorY.value);
    },
    heading: (i) =>
        props.chartType === "pie"
            ? (pie.value?.[i]?.name ?? null)
            : (radar.value?.axes[i]?.label ?? null),
    itemsAt: (i) => {
        const emphasis = selectedDataKey.value ?? focusDataKey.value;
        if (props.chartType === "pie" && pie.value) {
            const s = pie.value[i];
            if (!s) return [];
            return [
                {
                    name: s.name,
                    label: props.config[s.name]?.label ?? s.name,
                    value: s.value,
                    seed: seedOf(s.name),
                    dimmed: emphasis !== null && emphasis !== s.name,
                },
            ];
        }
        return configKeys.value.map((name) => {
            const raw = rows()[i]?.[name];
            return {
                name,
                label: props.config[name]?.label ?? name,
                value: typeof raw === "number" ? raw : 0,
                seed: seedOf(name),
                dimmed: emphasis !== null && emphasis !== name,
            };
        });
    },
};

const ctx: PolarChartContextValue = {
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
    get ready() {
        return ready.value;
    },
    get plot() {
        return plot.value;
    },
    get margins() {
        return margins.value;
    },
    get center() {
        return center.value;
    },
    get outerRadius() {
        return outerRadius.value;
    },
    get innerRadius() {
        return innerRadius.value;
    },
    get animate() {
        return props.animate;
    },
    get animationDuration() {
        return props.animationDuration;
    },
    get revision() {
        return revision.value;
    },
    get bloom() {
        return props.bloom;
    },
    get bloomOnHover() {
        return props.bloomOnHover;
    },
    seedOf,
    variantOf,
    registerVariant,
    unregisterVariant,
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
    setCursor: (px, py) => {
        cursorX.value = px;
        cursorY.value = py;
    },
    get isMouseInChart() {
        return isMouseInChart.value;
    },
    setMouseInChart: (over) => {
        isMouseInChart.value = over;
    },
    get pie() {
        return pie.value;
    },
    get radar() {
        return radar.value;
    },
    common,
};

provide(PolarKey, ctx);
provide(CommonKey, common);

function onMove(e: PointerEvent): void {
    const el = elRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - rect.left - margins.value.left - center.value.x;
    const dy = e.clientY - rect.top - margins.value.top - center.value.y;
    const angle = Math.atan2(dy, dx);
    const r = Math.hypot(dx, dy);
    if (props.chartType === "pie" && pie.value) {
        const inside = r <= outerRadius.value && r >= innerRadius.value;
        const i = inside ? sliceAtAngle(pie.value, angle) : -1;
        hoverIndex.value = i >= 0 ? i : null;
    } else if (radar.value) {
        hoverIndex.value = axisAtAngle(radar.value.axes, angle);
    }
    cursorX.value = e.clientX - rect.left;
    cursorY.value = e.clientY - rect.top;
}
function onLeave(): void {
    isMouseInChart.value = false;
    hoverIndex.value = null;
}
</script>

<template>
    <div
        ref="elRef"
        class="dk-root"
        @pointerenter="isMouseInChart = true"
        @pointermove="onMove"
        @pointerleave="onLeave"
    >
        <slot name="back" />
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
