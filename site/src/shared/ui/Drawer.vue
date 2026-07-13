<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { lockBodyScroll, unlockBodyScroll, disconnectPointerDrag, setAppModalOpen } from "@/shared/lib/dom";
import { motionApply, motionFor } from "@/shared/lib/motion";

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        label: string;
        title?: string;
        popupClass?: string;
        /** Selects the CSS class family already defined in app/styles/global.css. */
        variant?: "responsive" | "nav";
    }>(),
    { variant: "responsive" },
);

const emit = defineEmits<{ "update:modelValue": [boolean] }>();
const titleId = useId();
const popupEl = ref<HTMLElement | null>(null);
const dragY = ref(0);
let dragging = false;
let startY = 0;
let boundMove: ((e: PointerEvent) => void) | null = null;
let boundUp: ((e: PointerEvent) => void) | null = null;
let previousFocus: HTMLElement | null = null;
let ownsScrollLock = false;
let ownsModal = false;

const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(): HTMLElement[] {
    return popupEl.value
        ? [...popupEl.value.querySelectorAll<HTMLElement>(focusableSelector)].filter((element) => !element.hidden)
        : [];
}

function close(): void {
    emit("update:modelValue", false);
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableElements();
    if (focusable.length === 0) {
        event.preventDefault();
        popupEl.value?.focus();
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function onHandlePointerDown(event: PointerEvent): void {
    dragging = true;
    startY = event.clientY;
    boundMove = onHandlePointerMove;
    boundUp = onHandlePointerUp;
    document.addEventListener("pointermove", boundMove, { passive: false });
    document.addEventListener("pointerup", boundUp, { passive: false });
    document.addEventListener("pointercancel", boundUp, { passive: false });
}

function onHandlePointerMove(event: PointerEvent): void {
    if (!dragging) return;
    event.preventDefault();
    dragY.value = Math.max(0, event.clientY - startY);
}

function onHandlePointerUp(): void {
    dragging = false;
    disconnectPointerDrag(boundMove, boundUp);
    boundMove = boundUp = null;
    const popup = popupEl.value;
    if (popup && dragY.value > popup.offsetHeight * 0.3) close();
    dragY.value = 0;
}

function onPopupEnter(el: Element, done: () => void): void {
    const popup = el as HTMLElement;
    popup.setAttribute("data-starting-style", "");
    if (popup.offsetHeight) motionApply(popup, motionFor("panel", "enter", { size: popup.offsetHeight }));
    requestAnimationFrame(() => requestAnimationFrame(() => popup.removeAttribute("data-starting-style")));
    const onEnd = () => {
        popup.removeEventListener("transitionend", onEnd);
        done();
    };
    popup.addEventListener("transitionend", onEnd);
}

function onPopupLeave(el: Element, done: () => void): void {
    const popup = el as HTMLElement;
    popup.setAttribute("data-ending-style", "");
    const onEnd = () => {
        popup.removeEventListener("transitionend", onEnd);
        done();
    };
    popup.addEventListener("transitionend", onEnd);
}

function onBackdropEnter(el: Element): void {
    (el as HTMLElement).setAttribute("data-starting-style", "");
    requestAnimationFrame(() => (el as HTMLElement).removeAttribute("data-starting-style"));
}

function onBackdropLeave(el: Element): void {
    (el as HTMLElement).setAttribute("data-ending-style", "");
}

watch(
    () => props.modelValue,
    async (isOpen) => {
        if (typeof document === "undefined") return;
        if (isOpen) {
            previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            lockBodyScroll("scroll-locked");
            ownsScrollLock = true;
            setAppModalOpen(true);
            ownsModal = true;
            await nextTick();
            (focusableElements()[0] ?? popupEl.value)?.focus();
        } else {
            if (ownsScrollLock) unlockBodyScroll("scroll-locked");
            if (ownsModal) setAppModalOpen(false);
            ownsScrollLock = ownsModal = false;
            previousFocus?.focus();
            previousFocus = null;
        }
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (ownsScrollLock) unlockBodyScroll("scroll-locked");
    if (ownsModal) setAppModalOpen(false);
    previousFocus?.focus();
    disconnectPointerDrag(boundMove, boundUp);
});
</script>

<template>
    <Teleport to="body">
        <Transition @enter="onBackdropEnter" @leave="onBackdropLeave">
            <div
                v-if="modelValue"
                :class="`${variant}-drawer-backdrop`"
                data-sound="overlay.close"
                @click="close"
            />
        </Transition>
        <div v-if="modelValue" :class="`${variant}-drawer-viewport`" @keydown="onKeydown">
            <Transition @enter="onPopupEnter" @leave="onPopupLeave">
                <div
                    v-if="modelValue"
                    ref="popupEl"
                    :class="[`${variant}-drawer-popup`, popupClass]"
                    role="dialog"
                    aria-modal="true"
                    :aria-label="title ? undefined : label"
                    :aria-labelledby="title ? titleId : undefined"
                    tabindex="-1"
                    :style="dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined"
                >
                    <div :class="`${variant}-drawer-handle`" aria-hidden="true" @pointerdown="onHandlePointerDown" />
                    <h2 v-if="title" :id="titleId" class="responsive-drawer-title">{{ title }}</h2>
                    <div :class="`${variant}-drawer-content`">
                        <slot />
                    </div>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>
