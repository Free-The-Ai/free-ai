<script setup lang="ts">
import PolarRoot from "./PolarRoot.vue";
import RadarCanvas from "./RadarCanvas.vue";
import RadarFrame from "./RadarFrame.vue";
import type { RadarChartProps } from "@/shared/lib/dither/chart-context";

defineProps<RadarChartProps>();
defineEmits<{ selectionChange: [string | null] }>();
</script>

<template>
    <PolarRoot chart-type="radar" v-bind="$props">
        <template #back><RadarFrame /></template>
        <template #canvas><RadarCanvas /></template>
        <slot />
    </PolarRoot>
</template>
