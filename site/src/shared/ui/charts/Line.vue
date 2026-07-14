<script setup lang="ts">
import CartesianSeries from "./CartesianSeries.vue";
import type { AreaVariant, StrokeVariant } from "@/shared/lib/dither/chart-types";

defineProps<{
    dataKey: string;
    variant?: AreaVariant;
    strokeVariant?: StrokeVariant;
    isClickable?: boolean;
}>();
</script>

<template>
    <CartesianSeries part="Line" kind="line" v-bind="$props"><slot /></CartesianSeries>
</template>
