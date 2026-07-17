<script setup lang="ts">
import { soundPlay, soundEnabled } from "@/shared/lib/sound/singleton";

const props = withDefaults(
    defineProps<{
        modelValue?: string;
        label?: string;
        description?: string;
        error?: string;
        multiline?: boolean;
        sound?: boolean;
        placeholder?: string;
        name?: string;
        disabled?: boolean;
        required?: boolean;
        id?: string;
    }>(),
    { modelValue: "", sound: true },
);

const emit = defineEmits<{ "update:modelValue": [string] }>();

const TYPING_THROTTLE_MS = 120;
let lastTypingSound = 0;

function onInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    emit("update:modelValue", value);
    if (props.sound && soundEnabled()) {
        const now = Date.now();
        if (now - lastTypingSound >= TYPING_THROTTLE_MS) {
            lastTypingSound = now;
            soundPlay("interaction.typing");
        }
    }
}
</script>

<template>
    <div class="kb-text-field" :data-invalid="error ? '' : undefined">
        <label v-if="label" class="kb-text-field__label">{{ label }}</label>
        <textarea
            v-if="multiline"
            class="kb-text-field__textarea"
            :placeholder="placeholder"
            :value="modelValue"
            :disabled="disabled"
            :required="required"
            :id="id"
            :data-invalid="error ? '' : undefined"
            @input="onInput"
        />
        <input
            v-else
            class="kb-text-field__input"
            type="text"
            :placeholder="placeholder"
            :value="modelValue"
            :disabled="disabled"
            :required="required"
            :id="id"
            :name="name"
            :data-invalid="error ? '' : undefined"
            @input="onInput"
        />
        <p v-if="description" class="kb-text-field__description">{{ description }}</p>
        <p v-if="error" class="kb-text-field__error">{{ error }}</p>
    </div>
</template>
