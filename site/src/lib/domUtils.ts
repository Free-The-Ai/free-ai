/** Clean up pointer event listeners registered by drag-to-dismiss or scroll-rail handlers. */
export function disconnectPointerDrag(
  boundMove: ((e: PointerEvent) => void) | null,
  boundUp: ((e: PointerEvent) => void) | null,
): void {
  if (boundMove) document.removeEventListener("pointermove", boundMove);
  if (boundUp) {
    document.removeEventListener("pointerup", boundUp);
    document.removeEventListener("pointercancel", boundUp);
  }
}

/** Lock body scroll. scrollbar-gutter: stable on <html> prevents horizontal reflow. */
let lockedScrollY = 0;
export function lockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  if (document.documentElement.classList.contains(className)) return;
  lockedScrollY = window.scrollY;
  document.documentElement.classList.add(className);
}

/** Unlock body scroll (undo lockBodyScroll). */
export function unlockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  if (!document.documentElement.classList.contains(className)) return;
  document.documentElement.classList.remove(className);
  lockedScrollY = 0;
}
