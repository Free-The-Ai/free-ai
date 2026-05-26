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

/** Lock body scroll and store current scrollY so it can be restored by unlockBodyScroll. */
let lockedScrollY = 0;
export function lockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  if (document.body.classList.contains(className)) return;
  lockedScrollY = window.scrollY;
  document.documentElement.classList.add(className);
  document.body.classList.add(className);
  document.body.style.top = `-${lockedScrollY}px`;
}

/** Unlock body scroll (undo lockBodyScroll). */
export function unlockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  if (!document.body.classList.contains(className)) return;
  const y = lockedScrollY;
  document.documentElement.classList.remove(className);
  document.body.classList.remove(className);
  document.body.style.top = "";
  lockedScrollY = 0;
  window.scrollTo(0, y);
}
