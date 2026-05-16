import { createSignal, createEffect, onCleanup, For, Show } from "solid-js";

const SECTIONS = [
  { id: "auth", label: "Auth" },
  { id: "endpoints", label: "Endpoints" },
  { id: "chat", label: "Chat" },
  { id: "messages", label: "Messages" },
  { id: "models", label: "Models" },
  { id: "images", label: "Images" },
  { id: "errors", label: "Errors" },
];

export default function DocsMobileNav() {
  const [open, setOpen] = createSignal(false);
  const [activeId, setActiveId] = createSignal("");
  const [dragY, setDragY] = createSignal(0);

  let lockedScrollY = 0;
  let sheetEl: HTMLDivElement | undefined;
  let dragStartY = 0;
  let dragStartOffset = 0;
  let isDragging = false;
  let boundMove: ((e: PointerEvent) => void) | null = null;
  let boundUp: ((e: PointerEvent) => void) | null = null;

  const close = () => {
    setOpen(false);
    setDragY(0);
    unlockScroll();
  };

  const lockScroll = () => {
    if (typeof document === "undefined") return;
    if (document.body.classList.contains("docs-toc-open")) return;
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("docs-toc-open");
    document.body.classList.add("docs-toc-open");
    document.body.style.top = `-${lockedScrollY}px`;
  };

  const unlockScroll = () => {
    if (typeof document === "undefined") return;
    if (!document.body.classList.contains("docs-toc-open")) return;
    const y = lockedScrollY;
    document.documentElement.classList.remove("docs-toc-open");
    document.body.classList.remove("docs-toc-open");
    document.body.style.top = "";
    lockedScrollY = 0;
    window.scrollTo(0, y);
  };

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
    if (open()) {
      close();
    } else {
      setOpen(true);
      lockScroll();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  const handleDragStart = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button:not(.docs-mobile-toc__handle), a")) return;
    e.preventDefault();
    isDragging = true;
    dragStartY = e.clientY;
    dragStartOffset = dragY();
    boundMove = handleDragMove;
    boundUp = handleDragEnd;
    document.addEventListener("pointermove", boundMove, { passive: false });
    document.addEventListener("pointerup", boundUp, { passive: false });
    document.addEventListener("pointercancel", boundUp, { passive: false });
  };

  const handleDragMove = (e: PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const delta = e.clientY - dragStartY;
    const next = Math.max(0, dragStartOffset + delta);
    setDragY(next);
  };

  const handleDragEnd = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    e.preventDefault();
    if (boundMove) document.removeEventListener("pointermove", boundMove);
    if (boundUp) {
      document.removeEventListener("pointerup", boundUp);
      document.removeEventListener("pointercancel", boundUp);
    }
    boundMove = null;
    boundUp = null;
    const sheet = sheetEl;
    if (!sheet) { setDragY(0); return; }
    const threshold = sheet.offsetHeight * 0.3;
    if (dragY() > threshold) {
      close();
    } else {
      setDragY(0);
    }
  };

  onCleanup(() => {
    if (open()) unlockScroll();
  });

  const dy = dragY();
  const sheetStyle = dy > 0 ? { transform: `translateY(${dy}px)`, transition: "none", "touch-action": "none" } : {};

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
        <div class="docs-mobile-toc__overlay" onClick={close} />
        <div
          class="docs-mobile-toc__sheet"
          ref={sheetEl}
          style={sheetStyle}
          onPointerDown={handleDragStart}
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
