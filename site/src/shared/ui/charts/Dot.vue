<script setup lang="ts">
import { computed } from "vue";
import { useChart, useSeries } from "@/shared/lib/dither/chart-context";
import { rgb, type Seed } from "@/shared/lib/dither/palette";

type DotVariant = "border" | "colored-border" | "filled";

const props = withDefaults(defineProps<{ variant?: DotVariant; r?: number }>(), {
    variant: "border",
    r: 2,
});

const ctx = useChart();
const series = useSeries("Dot");

function dotPaint(variant: DotVariant, seed: Seed) {
    switch (variant) {
        case "colored-border":
            return { fill: "var(--surface, #0b0b0c)", stroke: rgb(seed.line), "stroke-width": 1.5 };
        case "filled":
            return { fill: rgb(seed.star), stroke: rgb(seed.line), "stroke-width": 1 };
        default:
            return { fill: "var(--surface, #0b0b0c)", stroke: rgb(seed.star, 0.8), "stroke-width": 1 };
    }
}

const paint = computed(() => dotPaint(props.variant, series.seed));
const points = computed(() => {
    const band = ctx.bands[series.dataKey];
    if (!ctx.ready || !band) return [];
    return band.map((b, i) => ({ i, cx: ctx.xCenter(i), cy: ctx.y(b[1]) }));
});
</script>

<template>
    <svg v-if="points.length" class="dk-layer dk-front">
        <g
            :transform="`translate(${ctx.margins.left},${ctx.margins.top})`"
            :style="{ opacity: ctx.entranceDone ? 1 : 0, transition: 'opacity 300ms ease' }"
        >
            <circle v-for="p in points" :key="p.i" v-bind="paint" :cx="p.cx" :cy="p.cy" :r="r" />
        </g>
    </svg>
</template>
