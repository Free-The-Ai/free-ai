<script setup lang="ts">
import PieCanvas from "./PieCanvas.vue";
import PolarRoot from "./PolarRoot.vue";
import type { PieChartProps } from "@/shared/lib/dither/chart-context";

defineProps<PieChartProps>();
defineEmits<{ selectionChange: [string | null] }>();
</script>

<template>
    <PolarRoot chart-type="pie" v-bind="$props">
        <template #canvas><PieCanvas /></template>
        <slot />
    </PolarRoot>
</template>
