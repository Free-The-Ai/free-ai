<script setup lang="ts">
import { computed } from "vue";
import { useChartPart } from "@/shared/lib/dither/chart-context";

type Row = Record<string, unknown>;

const props = withDefaults(
    defineProps<{
        dataKey?: string;
        tickFormatter?: (value: unknown, index: number) => string;
        tickMargin?: number;
        maxTicks?: number;
    }>(),
    { tickMargin: 8, maxTicks: 8 },
);

const ctx = useChartPart("XAxis");
const step = computed(() => Math.max(1, Math.ceil(ctx.dataLength / props.maxTicks)));
const baseY = computed(() => ctx.plot.height + props.tickMargin);

const ticks = computed(() =>
    (ctx.data as Row[])
        .map((row, i) => {
            if (i % step.value !== 0) return null;
            const raw = props.dataKey ? row[props.dataKey] : i;
            const label = props.tickFormatter ? props.tickFormatter(raw, i) : String(raw ?? "");
            return { i, x: ctx.xCenter(i), label };
        })
        .filter((t): t is { i: number; x: number; label: string } => t !== null),
);
</script>

<template>
    <svg v-if="ctx.ready" class="dk-layer dk-front">
        <g class="dk-axis" :transform="`translate(${ctx.margins.left},${ctx.margins.top})`">
            <text
                v-for="t in ticks"
                :key="t.i"
                :x="t.x"
                :y="baseY"
                text-anchor="middle"
                dominant-baseline="hanging"
            >
                {{ t.label }}
            </text>
        </g>
    </svg>
</template>
