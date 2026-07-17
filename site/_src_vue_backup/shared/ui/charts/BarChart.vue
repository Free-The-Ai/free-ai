<script setup lang="ts">
import BarCanvas from "./BarCanvas.vue";
import CartesianRoot from "./CartesianRoot.vue";
import type { CartesianChartProps } from "@/shared/lib/dither/chart-context";

defineProps<CartesianChartProps>();
defineEmits<{ hoverChange: [number | null]; selectionChange: [string | null] }>();
</script>

<template>
    <CartesianRoot chart-type="bar" v-bind="$props">
        <template #canvas><BarCanvas /></template>
        <slot />
    </CartesianRoot>
</template>
