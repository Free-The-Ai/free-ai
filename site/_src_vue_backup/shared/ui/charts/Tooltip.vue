<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { useCommonChart } from "@/shared/lib/dither/chart-context";
import { rgb } from "@/shared/lib/dither/palette";

const props = withDefaults(
    defineProps<{
        labelKey?: string;
        valueFormatter?: (value: number, name: string) => string;
        variant?: "default" | "frosted-glass";
    }>(),
    { variant: "default" },
);

const chart = useCommonChart();
const show = computed(() => chart.ready && chart.hoverIndex != null);
const index = computed(() => chart.hoverIndex ?? 0);
const heading = computed(() => chart.heading(index.value, props.labelKey));
const items = computed(() => chart.itemsAt(index.value));

// Position glides via CSS transitions on top/left (replaces framer-motion).
const posStyle = computed<CSSProperties>(() => ({
    top: `${chart.tooltipTop}px`,
    left: `${chart.tooltipLeft}px`,
    backdropFilter: props.variant === "frosted-glass" ? "blur(4px)" : undefined,
}));

function formatValue(value: number, name: string): string {
    return props.valueFormatter ? props.valueFormatter(value, name) : value.toLocaleString();
}
</script>

<template>
    <Transition name="dk-fade">
        <div v-if="show && items.length" class="dk-dom dk-tooltip" :style="posStyle">
            <div v-if="heading" class="dk-tooltip-heading">{{ heading }}</div>
            <div class="dk-tooltip-rows">
                <div
                    v-for="item in items"
                    :key="item.name"
                    class="dk-tooltip-row"
                    :style="{ opacity: item.dimmed ? 0.4 : 1 }"
                >
                    <span class="dk-swatch" :style="{ backgroundColor: rgb(item.seed.fill) }" />
                    <span class="dk-tooltip-label">{{ item.label }}</span>
                    <span class="dk-tooltip-value">{{ formatValue(item.value, item.name) }}</span>
                </div>
            </div>
        </div>
    </Transition>
</template>
