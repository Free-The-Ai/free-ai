import type { Action } from "svelte/action";

/** Moves the element to <body> (or a custom target selector) on mount and
 * removes it on destroy. The explicit teardown matters: outro transitions can
 * defer Svelte's own DOM removal, and a reparented node orphaned at <body>
 * would otherwise survive its owning component. Replaces Vue's
 * <Teleport to="body">. */
export const portal: Action<HTMLElement, string | undefined> = (node, target = "body") => {
    const host = (typeof document !== "undefined" ? document.querySelector<HTMLElement>(target) : null) ?? document.body;
    host.appendChild(node);
    return {
        destroy() {
            node.remove();
        },
    };
};
