<script setup lang="ts">
import { soundPlay } from "@/shared/lib/sound/singleton";
import type { SoundRole } from "@/shared/lib/sound/types";
import ChevronDownIcon from "./icons/ChevronDownIcon.vue";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

const props = withDefaults(
    defineProps<{
        label?: string;
        placeholder?: string;
        options: SelectOption[];
        modelValue?: string;
        className?: string;
        disabled?: boolean;
        name?: string;
        sound?: SoundRole | false;
        volume?: number;
    }>(),
    { placeholder: "Select..." },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();

function onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (props.sound !== false) soundPlay(props.sound ?? "interaction.subtle", { volume: props.volume });
    emit("update:modelValue", value);
}
</script>

<template>
    <label :class="['kb-select__trigger', 'kb-native-select', className]">
        <span class="kb-select__trigger-label">
            <span v-if="label" class="kb-select__label-text">{{ label }}</span>
            <span class="kb-select__value-text">
                {{ options.find((o) => o.value === modelValue)?.label ?? placeholder }}
            </span>
        </span>
        <ChevronDownIcon class="kb-select__icon" />
        <select
            class="kb-native-select__control"
            :value="modelValue"
            :disabled="disabled"
            :name="name"
            @change="onChange"
        >
            <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
                {{ option.label }}
            </option>
        </select>
    </label>
</template>

<style scoped>
/* Native <select> laid over the existing kb-select__trigger visual shell:
   real OS picker for accessibility, zero extra popup/positioning JS. */
.kb-native-select {
    position: relative;
    cursor: pointer;
}

.kb-native-select__control {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    appearance: none;
    border: none;
    background: transparent;
}

.kb-native-select:focus-within {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
}
</style>
