import { useState, useEffect, useRef, useCallback } from "react";
import { disconnectPointerDrag, lockBodyScroll, unlockBodyScroll } from "../lib/domUtils";
import { motionFor, motionApply } from "../lib/motion";

const SECTIONS = [
  { id: "auth", label: "Auth" },
  { id: "endpoints", label: "Endpoints" },
  { id: "chat", label: "Chat" },
  { id: "messages", label: "Messages" },
  { id: "models", label: "Models" },
  { id: "errors", label: "Errors" },
];

function useSheetDrag(onClose: () => void) {
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragYRef = useRef(0);
  const boundMoveRef = useRef<((e: PointerEvent) => void) | null>(null);
  const boundUpRef = useRef<((e: PointerEvent) => void) | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const onDragMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const next = Math.max(0, startOffsetRef.current + e.clientY - startYRef.current);
    dragYRef.current = next;
    setDragY(next);
  }, []);

  const onDragEnd = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.preventDefault();
    disconnectPointerDrag(boundMoveRef.current, boundUpRef.current);
    boundMoveRef.current = boundUpRef.current = null;
    const sheet = sheetRef.current;
    if (!sheet) { setDragY(0); dragYRef.current = 0; return; }
    if (dragYRef.current > sheet.offsetHeight * 0.3) onCloseRef.current();
    else { setDragY(0); dragYRef.current = 0; }
  }, []);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button:not(.docs-mobile-toc__handle), a")) return;
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startOffsetRef.current = dragYRef.current;
    boundMoveRef.current = onDragMove;
    boundUpRef.current = onDragEnd;
    document.addEventListener("pointermove", onDragMove, { passive: false });
    document.addEventListener("pointerup", onDragEnd, { passive: false });
    document.addEventListener("pointercancel", onDragEnd, { passive: false });
  }, [onDragMove, onDragEnd]);

  useEffect(() => () => disconnectPointerDrag(boundMoveRef.current, boundUpRef.current), []);

  return { dragY, sheetRef, onDragStart };
}

export default function DocsMobileNav() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  const close = useCallback(() => {
    setOpen(false);
    unlockBodyScroll("docs-toc-open");
  }, []);

  const drag = useSheetDrag(close);

  const setSheetRef = useCallback((el: HTMLDivElement | null) => {
    drag.sheetRef.current = el;
    if (el) motionApply(el, motionFor("panel", "enter", { size: el.offsetHeight }));
  }, [drag]);

  useEffect(() => {
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

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      close();
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [close]);

  const toggle = useCallback(() => {
    if (open) close();
    else { setOpen(true); lockBodyScroll("docs-toc-open"); }
  }, [open, close]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
  }, [close]);

  useEffect(() => () => { if (open) unlockBodyScroll("docs-toc-open"); }, [open]);

  return (
    <div className="docs-mobile-toc" onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="docs-mobile-toc__trigger"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Table of contents"
      >
        <span className="material-symbols-outlined">toc</span>
      </button>

      {open && (
        <>
          <div className="docs-mobile-toc__overlay" data-sound="overlay.close" onClick={close} />
          <div
            className="docs-mobile-toc__sheet"
            ref={setSheetRef}
            style={drag.dragY > 0 ? { transform: `translateY(${drag.dragY}px)`, transition: "none", touchAction: "none" } : {}}
            onPointerDown={drag.onDragStart}
          >
            <div className="docs-mobile-toc__handle" />
            <div className="docs-mobile-toc__label">On this page</div>
            <nav className="docs-mobile-toc__links">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`docs-mobile-toc__link${activeId === s.id ? " is-active" : ""}`}
                  onClick={() => scrollTo(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
