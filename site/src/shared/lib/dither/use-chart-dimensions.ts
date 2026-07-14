import { onBeforeUnmount, onMounted, reactive, ref, type Ref } from "vue";
import type { Dimensions } from "./chart-types";

/**
 * Tracks an element's CSS pixel size via ResizeObserver. Uses
 * clientWidth/clientHeight (the layout size) rather than getBoundingClientRect
 * so a parent transform (e.g. a scale animation) can't trick the chart into
 * locking its canvas to a scaled size.
 */
export function useChartDimensions(): { elRef: Ref<HTMLElement | null>; size: Dimensions } {
    const elRef = ref<HTMLElement | null>(null);
    const size = reactive<Dimensions>({ width: 0, height: 0 });
    let ro: ResizeObserver | null = null;

    const measure = () => {
        const el = elRef.value;
        if (!el) return;
        const width = Math.max(0, el.clientWidth);
        const height = Math.max(0, el.clientHeight);
        if (size.width !== width) size.width = width;
        if (size.height !== height) size.height = height;
    };

    onMounted(() => {
        if (typeof ResizeObserver === "undefined") return;
        ro = new ResizeObserver(measure);
        if (elRef.value) ro.observe(elRef.value);
        measure();
    });
    onBeforeUnmount(() => ro?.disconnect());

    return { elRef, size };
}
