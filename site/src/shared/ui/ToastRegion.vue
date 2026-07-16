<script setup lang="ts">
import { onMounted } from "vue";
import { toasts, closeToast, initToastManager } from "@/shared/lib/toast";

const TOAST_ICONS: Record<string, string> = {
    success: "\u2713",
    error: "\u2717",
    info: "i",
    warning: "!",
};

onMounted(initToastManager);
</script>

<template>
    <Teleport to="body">
        <ol class="kb-toast__list" aria-live="polite" aria-atomic="false">
            <li v-for="toast in toasts" :key="toast.id" :class="`kb-toast kb-toast--${toast.type}`" data-opened="">
                <div class="kb-toast__content">
                    <div class="kb-toast__icon">{{ TOAST_ICONS[toast.type] ?? "i" }}</div>
                    <div class="kb-toast__body">
                        <p v-if="toast.title" class="kb-toast__title">{{ toast.title }}</p>
                        <p v-if="toast.description" class="kb-toast__description">{{ toast.description }}</p>
                    </div>
                    <button class="kb-toast__close" type="button" aria-label="Dismiss" @click="closeToast(toast.id)">
                        &#215;
                    </button>
                </div>
            </li>
        </ol>
    </Teleport>
</template>
