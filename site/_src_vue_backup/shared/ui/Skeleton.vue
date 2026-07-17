<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        width?: string;
        height?: string;
        radius?: number;
        circle?: boolean;
        animate?: boolean;
        visible?: boolean;
        className?: string;
    }>(),
    { animate: true, visible: true },
);

const style = computed(() => ({
    width: props.width,
    height: props.height,
    borderRadius: props.circle ? "50%" : props.radius !== undefined ? `${props.radius}px` : undefined,
}));
</script>

<template>
    <div v-if="visible" :class="className ?? 'kb-skeleton'">
        <div :data-animate="animate ? '' : undefined" :style="style" />
        <slot />
    </div>
    <slot v-else />
</template>
