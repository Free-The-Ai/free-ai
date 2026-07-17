import type { Action } from "svelte/action";

/** Runs `onChange` once on mount and again whenever any entry in the `deps`
 * array (the action's parameter) changes by reference — the Svelte-action
 * equivalent of Vue's `watch(() => [...deps], fn, { immediate: true })`,
 * without reaching for `$effect`. */
export function watchDeps(onChange: (deps: readonly unknown[]) => void): Action<Element, readonly unknown[]> {
    return (_node, initial) => {
        let prev = initial;
        onChange(prev);
        return {
            update(next) {
                const changed = next.length !== prev.length || next.some((v, i) => v !== prev[i]);
                prev = next;
                if (changed) onChange(next);
            },
        };
    };
}
