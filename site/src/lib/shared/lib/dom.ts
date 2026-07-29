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

/** Reference-counted scroll locks per class so overlapping drawers cannot
 * unlock one another. */
const scrollLocks = new Map<string, number>();

export function lockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  const count = scrollLocks.get(className);
  if (count !== undefined) {
    scrollLocks.set(className, count + 1);
    return;
  }
  scrollLocks.set(className, 1);
  // html is the scroll container with scrollbar-gutter:stable, so overflow:hidden
  // locks scroll without shifting layout or losing scroll position.
  document.documentElement.classList.add(className);
}

/** Unlock one caller's lock; the class is removed only after the final release. */
export function unlockBodyScroll(className: string = "scroll-locked"): void {
  if (typeof document === "undefined") return;
  const count = scrollLocks.get(className);
  if (count === undefined) return;
  if (count > 1) {
    scrollLocks.set(className, count - 1);
    return;
  }
  scrollLocks.delete(className);
  document.documentElement.classList.remove(className);
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

/** Serialize a camelCase style object (as Vue's :style binding accepted) into
 * a CSS text string for Svelte's plain string `style` attribute. */
export function styleToCss(style: Record<string, string | number | undefined> | null | undefined): string | undefined {
  if (!style) return undefined;
  const entries = Object.entries(style).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return undefined;
  return entries
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value}`)
    .join('; ');
}

export function swapMaterialIcon(icon: Element | null, next: string, fallback = "content_copy"): void {
  if (!(icon instanceof HTMLElement)) return;
  icon.getAnimations().forEach((animation) => animation.cancel());
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swap = () => { icon.textContent = next; };
  if (reduced) swap();
  else {
    const exit = icon.animate(
      [{ opacity: 1, scale: 1, filter: "blur(0)" }, { opacity: 0, scale: 0.25, filter: "blur(4px)" }],
      { duration: 90, easing: "cubic-bezier(0.2, 0, 0, 1)" },
    );
    exit.onfinish = () => {
      swap();
      icon.animate(
        [{ opacity: 0, scale: 0.25, filter: "blur(4px)" }, { opacity: 1, scale: 1, filter: "blur(0)" }],
        { duration: 140, easing: "cubic-bezier(0.2, 0, 0, 1)" },
      );
    };
  }
  if (next !== fallback) window.setTimeout(() => swapMaterialIcon(icon, fallback, fallback), 1500);
}
