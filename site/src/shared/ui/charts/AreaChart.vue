<script setup lang="ts">
import CartesianCanvas from "./CartesianCanvas.vue";
import CartesianRoot from "./CartesianRoot.vue";
import type { CartesianChartProps } from "@/shared/lib/dither/chart-context";

defineProps<CartesianChartProps>();
defineEmits<{ hoverChange: [number | null]; selectionChange: [string | null] }>();
</script>

<template>
    <CartesianRoot chart-type="area" v-bind="$props">
        <template #canvas><CartesianCanvas /></template>
        <slot />
    </CartesianRoot>
</template>
