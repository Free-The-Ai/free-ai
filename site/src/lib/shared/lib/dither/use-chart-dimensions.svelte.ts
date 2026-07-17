import type { Action } from "svelte/action";
import type { Dimensions } from "./chart-types";

/**
 * Tracks an element's CSS pixel size via ResizeObserver. Uses
 * clientWidth/clientHeight (the layout size) rather than getBoundingClientRect
 * so a parent transform (e.g. a scale animation) can't trick the chart into
 * locking its canvas to a scaled size.
 *
 * Returns a reactive `size` object and a Svelte action (`use:resize`) to
 * attach to the measured element — the action's mount/destroy lifecycle
 * replaces the previous onMounted/onBeforeUnmount pair.
 */
export function useChartDimensions(): { size: Dimensions; resize: Action<HTMLElement> } {
    const size = $state<Dimensions>({ width: 0, height: 0 });

    const resize: Action<HTMLElement> = (node) => {
        if (typeof ResizeObserver === "undefined") return;
        const measure = () => {
            const width = Math.max(0, node.clientWidth);
            const height = Math.max(0, node.clientHeight);
            if (size.width !== width) size.width = width;
            if (size.height !== height) size.height = height;
        };
        const ro = new ResizeObserver(measure);
        ro.observe(node);
        measure();
        return {
            destroy() {
                ro.disconnect();
            },
        };
    };

    return { size, resize };
}
