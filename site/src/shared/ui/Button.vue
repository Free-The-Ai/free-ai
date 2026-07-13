<script setup lang="ts">
import { soundPlay } from "@/shared/lib/sound/singleton";
import type { SoundRole } from "@/shared/lib/sound/types";

const props = withDefaults(
    defineProps<{
        variant?: "primary" | "ghost" | "danger";
        size?: "sm" | "md" | "lg";
        sound?: SoundRole | false;
        volume?: number;
        disabled?: boolean;
        type?: "button" | "submit" | "reset";
    }>(),
    { variant: "ghost", size: "md", type: "button" },
);

const emit = defineEmits<{ click: [MouseEvent] }>();

function onClick(event: MouseEvent): void {
    if (props.sound !== false) soundPlay(props.sound ?? "interaction.tap", { volume: props.volume });
    emit("click", event);
}
</script>

<template>
    <button
        class="kb-button"
        :type="type"
        :data-variant="variant"
        :data-size="size === 'md' ? undefined : size"
        :disabled="disabled"
        @click="onClick"
    >
        <slot />
    </button>
</template>
