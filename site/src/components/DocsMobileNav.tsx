import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";
import { disconnectPointerDrag, lockBodyScroll, unlockBodyScroll } from "../lib/domUtils";

const SECTIONS = [
  { id: "auth", label: "Auth" },
  { id: "endpoints", label: "Endpoints" },
  { id: "chat", label: "Chat" },
  { id: "messages", label: "Messages" },
  { id: "models", label: "Models" },
  { id: "images", label: "Images" },
  { id: "errors", label: "Errors" },
];

// ── Sheet drag hook (reused pattern) ──

function useSheetDrag(isOpen: () => boolean, onClose: () => void) {
  const [dragY, setDragY] = createSignal(0);
  let sheetEl: HTMLDivElement | undefined;
  let startY = 0;
  let startOffset = 0;
  let isDragging = false;
  let boundMove: ((e: PointerEvent) => void) | null = null;
  let boundUp: ((e: PointerEvent) => void) | null = null;

  const onDragStart = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button:not(.docs-mobile-toc__handle), a")) return;
    e.preventDefault();
    isDragging = true;
    startY = e.clientY;
    startOffset = dragY();
    boundMove = onDragMove;
    boundUp = onDragEnd;
    document.addEventListener("pointermove", boundMove, { passive: false });
    document.addEventListener("pointerup", boundUp, { passive: false });
    document.addEventListener("pointercancel", boundUp, { passive: false });
  };
  const onDragMove = (e: PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setDragY(Math.max(0, startOffset + e.clientY - startY));
  };
  const onDragEnd = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    e.preventDefault();
    disconnectPointerDrag(boundMove, boundUp);
    boundMove = boundUp = null;
    const sheet = sheetEl;
    if (!sheet) { setDragY(0); return; }
    if (dragY() > sheet.offsetHeight * 0.3) onClose();
    else setDragY(0);
  };

  onCleanup(() => { disconnectPointerDrag(boundMove, boundUp); });

  return {
    dragY, setSheetRef: (el: HTMLDivElement) => { sheetEl = el; },
    onDragStart, cleanup: () => disconnectPointerDrag(boundMove, boundUp),
  };
}

export default function DocsMobileNav() {
  const [open, setOpen] = createSignal(false);
  const [activeId, setActiveId] = createSignal("");

  const close = () => {
    setOpen(false);
    unlockScroll();
  };

  const drag = useSheetDrag(() => open, close);

  const lockScroll = () => lockBodyScroll("docs-toc-open");
  const unlockScroll = () => unlockBodyScroll("docs-toc-open");

  createEffect(() => {
    if (typeof window === "undefined") return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    onCleanup(() => observer.disconnect());
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      close();
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const toggle = () => {
    if (open()) { close(); }
    else { setOpen(true); lockScroll(); }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  onCleanup(() => { if (open()) unlockScroll(); });

  return (
    <div class="docs-mobile-toc" onKeyDown={handleKeyDown}>
      <button
        type="button"
        class="docs-mobile-toc__trigger"
        onClick={toggle}
        aria-expanded={open()}
        aria-label="Table of contents"
      >
        <span class="material-symbols-outlined">toc</span>
      </button>

      <Show when={open()}>
        <div class="docs-mobile-toc__overlay" data-sound="overlay.close" onClick={close} />
        <div
          class="docs-mobile-toc__sheet"
          ref={drag.setSheetRef}
          style={drag.dragY() > 0 ? { transform: `translateY(${drag.dragY()}px)`, transition: "none", "touch-action": "none" } : {}}
          onPointerDown={drag.onDragStart}
        >
          <div class="docs-mobile-toc__handle" />
          <div class="docs-mobile-toc__label">On this page</div>
          <nav class="docs-mobile-toc__links">
            <For each={SECTIONS}>
              {(s) => (
                <button
                  type="button"
                  class={`docs-mobile-toc__link${activeId() === s.id ? " is-active" : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  {s.label}
                </button>
              )}
            </For>
          </nav>
        </div>
      </Show>
    </div>
  );
}
