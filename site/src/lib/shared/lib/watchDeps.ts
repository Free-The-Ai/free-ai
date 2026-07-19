import type { Action } from "svelte/action";

type Cleanup = () => void;

/** Runs `onChange` once on mount and again whenever any entry in the `deps`
 * array (the action's parameter) changes by reference — the Svelte-action
 * equivalent of Vue's `watch(() => [...deps], fn, { immediate: true })`,
 * without reaching for `$effect`.
 *
 * `onChange` may return a cleanup function (like Vue's `onCleanup` /
 * `watchEffect`): it runs before the next `onChange` and, crucially, on
 * destroy. Without the destroy path a long-lived resource started inside
 * `onChange` (e.g. a `requestAnimationFrame` loop that reads reactive context)
 * would leak past unmount and keep reading now-destroyed `$derived` values,
 * which Svelte reports as `derived_inert` every frame. */
export function watchDeps(onChange: (deps: readonly unknown[]) => Cleanup | void): Action<Element, readonly unknown[]> {
    return (_node, initial) => {
        let prev = initial;
        let cleanup = onChange(prev) as Cleanup | undefined;
        return {
            update(next) {
                const changed = next.length !== prev.length || next.some((v, i) => v !== prev[i]);
                prev = next;
                if (changed) {
                    cleanup?.();
                    cleanup = onChange(next) as Cleanup | undefined;
                }
            },
            destroy() {
                cleanup?.();
            },
        };
    };
}
