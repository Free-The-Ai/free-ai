<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Logo } from "@/shared/ui";

const router = useRouter();
const loaderEl = ref<HTMLElement | null>(null);
let dismissed = false;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function hide(): void {
    const el = loaderEl.value;
    if (!el) return;
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
        el.style.transition = "none";
    } else {
        const styles = getComputedStyle(document.documentElement);
        const dur = styles.getPropertyValue("--motion-duration").trim() || "200ms";
        const easing = styles.getPropertyValue("--ease-out-smooth").trim() || "ease-out";
        el.style.transition = `opacity ${dur} ${easing}`;
    }
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
}

function show(): void {
    const el = loaderEl.value;
    if (!el) return;
    if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
    }
    el.style.transition = "none";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
}

onMounted(() => {
    if (!dismissed) {
        dismissed = true;
        show();
        setTimeout(hide, 400);
    }

    router.beforeEach(() => {
        if (!dismissed) return;
        show();
        hideTimer = setTimeout(hide, 300);
    });
});
</script>

<template>
    <div ref="loaderEl" id="loader" style="position: fixed; inset: 0; z-index: 9999; background: oklch(0.168 0 0); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none">
        <Logo :width="160" class="footer-logo" />
    </div>
</template>
