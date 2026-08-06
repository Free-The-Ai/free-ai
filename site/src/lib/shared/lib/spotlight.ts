// Port of Skiper UI's mouse-follow mechanic (skiper61): tracks the pointer
// inside an element and exposes its position as CSS custom properties that a
// ::before spotlight gradient reads. Pointer events only; no state churn.
export function spotlight(node: HTMLElement): { destroy(): void } {
    function move(event: PointerEvent): void {
        const bounds = node.getBoundingClientRect();
        node.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
        node.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
    }
    node.addEventListener("pointermove", move);
    return {
        destroy() {
            node.removeEventListener("pointermove", move);
        },
    };
}
