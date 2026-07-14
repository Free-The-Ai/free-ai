<script setup lang="ts">
import { computed } from "vue";
import Area from "./Area.vue";
import AreaChart from "./AreaChart.vue";
import type { AreaVariant } from "@/shared/lib/dither/chart-types";
import type { BloomInput } from "@/shared/lib/dither/dither-paint";
import type { DitherColor } from "@/shared/lib/dither/palette";

const props = withDefaults(
    defineProps<{
        data: number[];
        color: DitherColor;
        variant?: AreaVariant;
        markerIndex?: number | null;
        hovered?: boolean;
        bloom?: BloomInput;
        bloomOnHover?: boolean;
        animate?: boolean;
    }>(),
    { variant: "gradient", markerIndex: null, hovered: false, bloom: "off", bloomOnHover: false, animate: false },
);

const rows = computed(() => props.data.map((v) => ({ v })));
const config = computed(() => ({ v: { color: props.color } }));
const zeroMargins = { top: 0, right: 0, bottom: 0, left: 0 };
</script>

<template>
    <AreaChart
        :data="rows"
        :config="config"
        :interactive="false"
        :animate="animate"
        :marker-index="markerIndex"
        :hovered="hovered"
        :bloom="bloom"
        :bloom-on-hover="bloomOnHover"
        :margins="zeroMargins"
    >
        <Area data-key="v" :variant="variant" />
    </AreaChart>
</template>
