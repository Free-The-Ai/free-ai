<script setup lang="ts">
import { computed } from "vue";
import { useChartPart } from "@/shared/lib/dither/chart-context";

const props = withDefaults(
    defineProps<{ tickFormatter?: (value: number) => string; tickCount?: number; tickMargin?: number }>(),
    { tickCount: 4, tickMargin: 8 },
);

const ctx = useChartPart("YAxis");
const ticks = computed(() =>
    ctx.y.ticks(props.tickCount).map((t) => ({
        t,
        y: ctx.y(t),
        label: props.tickFormatter ? props.tickFormatter(t) : String(t),
    })),
);
</script>

<template>
    <svg v-if="ctx.ready" class="dk-layer dk-front">
        <g class="dk-axis" :transform="`translate(${ctx.margins.left},${ctx.margins.top})`">
            <text
                v-for="tk in ticks"
                :key="tk.t"
                :x="-tickMargin"
                :y="tk.y"
                text-anchor="end"
                dominant-baseline="central"
            >
                {{ tk.label }}
            </text>
        </g>
    </svg>
</template>
