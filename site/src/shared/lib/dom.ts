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

/** Lock body scroll. Locks are reference-counted per class so overlapping
 * drawers cannot unlock one another. */
const scrollLocks = new Map<string, { count: number; scrollY: number }>();

export function lockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  const lock = scrollLocks.get(className);
  if (lock) {
    lock.count += 1;
    return;
  }
  const scrollY = window.scrollY;
  scrollLocks.set(className, { count: 1, scrollY });
  document.documentElement.classList.add(className);
  // Set body top to negative scrollY so position:fixed doesn't visually
  // jump the content to the top — it stays exactly where the user was.
  if (className === "scroll-locked") {
    document.body.style.top = `-${scrollY}px`;
  }
}

/** Unlock one caller's scroll lock and restore the original position only
 * after the final caller releases it. */
export function unlockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  const lock = scrollLocks.get(className);
  if (!lock) return;
  lock.count -= 1;
  if (lock.count > 0) return;
  scrollLocks.delete(className);
  document.documentElement.classList.remove(className);
  if (className === "scroll-locked") {
    document.body.style.top = "";
    window.scrollTo(0, lock.scrollY);
  }
}

let openModalCount = 0;

/** Make application content inert while any teleported modal is open. */
export function setAppModalOpen(open: boolean): void {
  if (typeof document === "undefined") return;
  const app = document.getElementById("app");
  if (!app) return;
  openModalCount = Math.max(0, openModalCount + (open ? 1 : -1));
  app.inert = openModalCount > 0;
  if (openModalCount > 0) app.setAttribute("aria-hidden", "true");
  else app.removeAttribute("aria-hidden");
}
