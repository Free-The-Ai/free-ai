<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, watch } from "vue";
import { type SeriesContextValue, SeriesKey, useChartPart } from "@/shared/lib/dither/chart-context";
import type { AreaVariant, StrokeVariant } from "@/shared/lib/dither/chart-types";

const props = withDefaults(
    defineProps<{
        dataKey: string;
        variant?: AreaVariant;
        strokeVariant?: StrokeVariant;
        isClickable?: boolean;
    }>(),
    { variant: "gradient", strokeVariant: "solid", isClickable: false },
);

const ctx = useChartPart("Bar", "bar");

if (import.meta.env.DEV && !ctx.config[props.dataKey]) {
    console.warn(
        `<Bar dataKey="${props.dataKey}">: "${props.dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`,
    );
}

onMounted(() =>
    ctx.registerSeries({ dataKey: props.dataKey, kind: "bar", variant: props.variant, strokeVariant: props.strokeVariant }),
);
watch(
    () => [props.dataKey, props.variant, props.strokeVariant],
    () =>
        ctx.registerSeries({ dataKey: props.dataKey, kind: "bar", variant: props.variant, strokeVariant: props.strokeVariant }),
);
onBeforeUnmount(() => ctx.unregisterSeries(props.dataKey));

const series: SeriesContextValue = {
    get dataKey() {
        return props.dataKey;
    },
    get seed() {
        return ctx.seedOf(props.dataKey);
    },
    get dimmed() {
        return ctx.selectedDataKey !== null && ctx.selectedDataKey !== props.dataKey;
    },
};
provide(SeriesKey, series);

const rects = computed(() => {
    const band = ctx.bands[props.dataKey];
    if (!props.isClickable || !ctx.ready || !band) return [];
    const si = ctx.configKeys.indexOf(props.dataKey);
    const n = ctx.configKeys.length;
    return band.map((b, i) => {
        const slot = ctx.barSlot(i, si, n);
        const top = ctx.y(b[1]);
        const base = ctx.y(b[0]);
        return { i, x: slot.x, y: Math.min(top, base), width: slot.width, height: Math.abs(base - top) };
    });
});

function onClick(): void {
    ctx.selectDataKey(ctx.selectedDataKey === props.dataKey ? null : props.dataKey);
}
</script>

<template>
    <svg v-if="rects.length" class="dk-layer dk-front">
        <g :transform="`translate(${ctx.margins.left},${ctx.margins.top})`">
            <rect
                v-for="r in rects"
                :key="r.i"
                :x="r.x"
                :y="r.y"
                :width="r.width"
                :height="r.height"
                fill="transparent"
                class="dk-hit"
                @click="onClick"
            />
        </g>
    </svg>
    <slot />
</template>
