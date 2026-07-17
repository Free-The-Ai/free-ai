<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, watch } from "vue";
import { type SeriesContextValue, SeriesKey, useChartPart } from "@/shared/lib/dither/chart-context";
import type { AreaVariant, SeriesKind, StrokeVariant } from "@/shared/lib/dither/chart-types";

const props = withDefaults(
    defineProps<{
        part: string;
        kind: SeriesKind;
        dataKey: string;
        variant?: AreaVariant;
        strokeVariant?: StrokeVariant;
        isClickable?: boolean;
    }>(),
    { variant: "gradient", strokeVariant: "solid", isClickable: false },
);

const ctx = useChartPart(props.part, props.kind === "line" ? "line" : "area");

if (import.meta.env.DEV && !ctx.config[props.dataKey]) {
    console.warn(
        `<${props.part} dataKey="${props.dataKey}">: "${props.dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`,
    );
}

onMounted(() =>
    ctx.registerSeries({
        dataKey: props.dataKey,
        kind: props.kind,
        variant: props.variant,
        strokeVariant: props.strokeVariant,
    }),
);
watch(
    () => [props.dataKey, props.kind, props.variant, props.strokeVariant],
    () =>
        ctx.registerSeries({
            dataKey: props.dataKey,
            kind: props.kind,
            variant: props.variant,
            strokeVariant: props.strokeVariant,
        }),
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
        const emphasis = ctx.selectedDataKey ?? ctx.focusDataKey;
        return emphasis !== null && emphasis !== props.dataKey;
    },
};
provide(SeriesKey, series);

// Transparent hit polygon tracing the series' own band, so clicking selects it.
const hitPath = computed<string | null>(() => {
    if (!props.isClickable || !ctx.ready) return null;
    const band = ctx.bands[props.dataKey];
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
    ctx.selectDataKey(ctx.selectedDataKey === props.dataKey ? null : props.dataKey);
}
</script>

<template>
    <svg v-if="hitPath" class="dk-layer dk-front">
        <g :transform="`translate(${ctx.margins.left},${ctx.margins.top})`">
            <path :d="hitPath" fill="transparent" class="dk-hit" @click="onClick" />
        </g>
    </svg>
    <slot />
</template>
