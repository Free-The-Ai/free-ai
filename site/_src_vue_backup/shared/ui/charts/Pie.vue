<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { usePolarPart } from "@/shared/lib/dither/chart-context";
import type { AreaVariant } from "@/shared/lib/dither/chart-types";

const props = withDefaults(defineProps<{ variant?: AreaVariant }>(), { variant: "gradient" });

const ctx = usePolarPart("Pie", "pie");
onMounted(() => ctx.registerVariant("*", props.variant));
watch(
    () => props.variant,
    (v) => ctx.registerVariant("*", v),
);
onBeforeUnmount(() => ctx.unregisterVariant("*"));
</script>

<template><span hidden /></template>
