<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";
import { usePolarPart } from "@/shared/lib/dither/chart-context";
import type { AreaVariant } from "@/shared/lib/dither/chart-types";

const props = withDefaults(defineProps<{ dataKey: string; variant?: AreaVariant }>(), {
    variant: "gradient",
});

const ctx = usePolarPart("Radar", "radar");

if (import.meta.env.DEV && !ctx.config[props.dataKey]) {
    console.warn(
        `<Radar dataKey="${props.dataKey}">: "${props.dataKey}" is not in the chart \`config\`. Add it so the series has a colour and label.`,
    );
}

onMounted(() => ctx.registerVariant(props.dataKey, props.variant));
watch(
    () => [props.dataKey, props.variant],
    () => ctx.registerVariant(props.dataKey, props.variant),
);
onBeforeUnmount(() => ctx.unregisterVariant(props.dataKey));
</script>

<template><span hidden /></template>
