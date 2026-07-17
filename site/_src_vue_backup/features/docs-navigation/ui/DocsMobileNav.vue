<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { disconnectPointerDrag, lockBodyScroll, unlockBodyScroll } from "@/shared/lib/dom";
import { motionApply, motionFor } from "@/shared/lib/motion";

const SECTIONS = [
    { id: "auth", label: "Auth" },
    { id: "endpoints", label: "Endpoints" },
    { id: "chat", label: "Chat" },
    { id: "messages", label: "Messages" },
    { id: "models", label: "Models" },
    { id: "errors", label: "Errors" },
];

const open = ref(false);
const activeId = ref("");
const dragY = ref(0);
const sheetEl = ref<HTMLElement | null>(null);

let dragging = false;
let startY = 0;
let boundMove: ((e: PointerEvent) => void) | null = null;
let boundUp: ((e: PointerEvent) => void) | null = null;
let observer: IntersectionObserver | null = null;

function close(): void {
    open.value = false;
    unlockBodyScroll("docs-toc-open");
}

function toggle(): void {
    if (open.value) close();
    else {
        open.value = true;
        lockBodyScroll("docs-toc-open");
    }
}

function onSheetMounted(el: Element | null): void {
    sheetEl.value = el as HTMLElement | null;
    if (sheetEl.value) motionApply(sheetEl.value, motionFor("panel", "enter", { size: sheetEl.value.offsetHeight }));
}

function onDragStart(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest("button:not(.docs-mobile-toc__handle), a")) return;
    event.preventDefault();
    dragging = true;
    startY = event.clientY;
    boundMove = onDragMove;
    boundUp = onDragEnd;
    document.addEventListener("pointermove", boundMove, { passive: false });
    document.addEventListener("pointerup", boundUp, { passive: false });
    document.addEventListener("pointercancel", boundUp, { passive: false });
}

function onDragMove(event: PointerEvent): void {
    if (!dragging) return;
    event.preventDefault();
    dragY.value = Math.max(0, event.clientY - startY);
}

function onDragEnd(): void {
    if (!dragging) return;
    dragging = false;
    disconnectPointerDrag(boundMove, boundUp);
    boundMove = boundUp = null;
    const sheet = sheetEl.value;
    if (!sheet) {
        dragY.value = 0;
        return;
    }
    if (dragY.value > sheet.offsetHeight * 0.3) close();
    dragY.value = 0;
}

function scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (!el) return;
    close();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }), 50);
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") close();
}

onMounted(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) activeId.value = entry.target.id;
            }
        },
        { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) observer.observe(el);
    }
});

onBeforeUnmount(() => {
    observer?.disconnect();
    if (open.value) unlockBodyScroll("docs-toc-open");
    disconnectPointerDrag(boundMove, boundUp);
});
</script>

<template>
    <div class="docs-mobile-toc" @keydown="onKeydown">
        <button type="button" class="docs-mobile-toc__trigger" :aria-expanded="open" aria-label="Table of contents" @click="toggle">
            <span class="material-symbols-outlined">toc</span>
        </button>

        <template v-if="open">
            <div class="docs-mobile-toc__overlay" data-sound="overlay.close" @click="close" />
            <div
                class="docs-mobile-toc__sheet"
                :ref="(el) => onSheetMounted(el as Element | null)"
                :style="dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none', touchAction: 'none' } : undefined"
                @pointerdown="onDragStart"
            >
                <div class="docs-mobile-toc__handle" />
                <div class="docs-mobile-toc__label">On this page</div>
                <nav class="docs-mobile-toc__links">
                    <button
                        v-for="section in SECTIONS"
                        :key="section.id"
                        type="button"
                        :class="['docs-mobile-toc__link', { 'is-active': activeId === section.id }]"
                        @click="scrollTo(section.id)"
                    >
                        {{ section.label }}
                    </button>
                </nav>
            </div>
        </template>
    </div>
</template>
