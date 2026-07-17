<script setup lang="ts">
import { computed } from "vue";
import { useChartPart } from "@/shared/lib/dither/chart-context";

const props = withDefaults(
    defineProps<{ horizontal?: boolean; vertical?: boolean; strokeDasharray?: string }>(),
    { horizontal: true, vertical: false, strokeDasharray: "3 3" },
);

const ctx = useChartPart("Grid");
const hTicks = computed(() => (props.horizontal ? ctx.y.ticks(4) : []));
</script>

<template>
    <svg v-if="ctx.ready" class="dk-layer dk-back">
        <g
            class="dk-grid"
            :stroke-dasharray="strokeDasharray"
            :transform="`translate(${ctx.margins.left},${ctx.margins.top})`"
        >
            <line
                v-for="t in hTicks"
                :key="`h-${t}`"
                :x1="0"
                :x2="ctx.plot.width"
                :y1="ctx.y(t)"
                :y2="ctx.y(t)"
            />
            <template v-if="vertical">
                <line
                    v-for="(_, i) in ctx.data"
                    :key="`v-${i}`"
                    :x1="ctx.xCenter(i)"
                    :x2="ctx.xCenter(i)"
                    :y1="0"
                    :y2="ctx.plot.height"
                />
            </template>
        </g>
    </svg>
</template>
