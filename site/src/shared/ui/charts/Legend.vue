<script setup lang="ts">
import { computed } from "vue";
import { useCommonChart } from "@/shared/lib/dither/chart-context";
import { rgb } from "@/shared/lib/dither/palette";

const props = withDefaults(
    defineProps<{ isClickable?: boolean; align?: "left" | "center" | "right" }>(),
    { isClickable: false, align: "right" },
);

const chart = useCommonChart();
const entries = computed(() =>
    chart.names.map((name) => {
        const emphasis = chart.selectedDataKey ?? chart.focusDataKey;
        return {
            name,
            label: chart.labelOf(name),
            swatch: rgb(chart.seedOf(name).fill),
            dimmed: emphasis !== null && emphasis !== name,
        };
    }),
);
</script>

<template>
    <div class="dk-dom dk-legend" :class="`dk-legend--${align}`">
        <button
            v-for="e in entries"
            :key="e.name"
            type="button"
            :disabled="!isClickable"
            class="dk-legend-item"
            :class="{
                'dk-legend-item--clickable': isClickable,
                'dk-legend-item--dimmed': e.dimmed,
            }"
            @click="chart.selectDataKey(chart.selectedDataKey === e.name ? null : e.name)"
            @pointerenter="chart.setFocusDataKey(e.name)"
            @pointerleave="chart.setFocusDataKey(null)"
            @focus="chart.setFocusDataKey(e.name)"
            @blur="chart.setFocusDataKey(null)"
        >
            <span class="dk-swatch" :style="{ backgroundColor: e.swatch }" />
            {{ e.label }}
        </button>
    </div>
</template>
