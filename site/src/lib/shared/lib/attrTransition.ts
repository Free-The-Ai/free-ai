import type { TransitionConfig } from "svelte/transition";

/** Toggles a data-starting-style/data-ending-style attribute pair so CSS in
 * app/styles/global.css drives the actual enter/exit animation, then waits
 * for the longest computed transition-duration before Svelte finalizes the
 * in/out transition. Optionally runs `onEnter`/`onLeave` side effects (e.g.
 * motionApply) before reading the computed duration. Replaces Vue's
 * <Transition> @enter/@leave JS hooks. */
export function attrTransition(onEnter?: (el: HTMLElement) => void, onLeave?: (el: HTMLElement) => void) {
    return (node: HTMLElement, _params: unknown, { direction }: { direction: "in" | "out" | "both" }): TransitionConfig => {
        if (direction === "in") {
            node.setAttribute("data-starting-style", "");
            onEnter?.(node);
            requestAnimationFrame(() => requestAnimationFrame(() => node.removeAttribute("data-starting-style")));
        } else {
            node.setAttribute("data-ending-style", "");
            onLeave?.(node);
        }
        const computed = getComputedStyle(node);
        const toMs = (v: string) => parseFloat(v) * (v.trim().endsWith("ms") ? 1 : 1000);
        const durations = computed.transitionDuration.split(",").map(toMs);
        const delays = computed.transitionDelay.split(",").map(toMs);
        const duration = Math.max(0, ...durations.map((d, i) => d + (delays[i] ?? 0))) || 200;
        return { duration };
    };
}
