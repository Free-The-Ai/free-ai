import type { Action } from "svelte/action";

/** Moves the element to <body> (or a custom target selector) on mount.
 * Svelte removes the node from wherever it currently lives when the owning
 * block unmounts, so no teardown is needed here. Replaces Vue's
 * <Teleport to="body">. */
export const portal: Action<HTMLElement, string | undefined> = (node, target = "body") => {
    const host = (typeof document !== "undefined" ? document.querySelector<HTMLElement>(target) : null) ?? document.body;
    host.appendChild(node);
};
