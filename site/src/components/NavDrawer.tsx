import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { siteConfig } from "../config/site";
import { lockBodyScroll, unlockBodyScroll } from "../lib/domUtils";
import { motionFor, motionApply } from "../lib/motion";

const LINKS: [string, string, boolean][] = [
  ["/home", "Home", false],
  ["/docs", "Docs", false],
  ["/models", "Models", false],
  ["/setup", "Setup", false],
  ["/roleplay-api", "Roleplay API", false],
  ["/coding-agent-api", "Coding API", false],
  ["/pricing", "Pricing", false],
  ["/status", "Status", false],
  ["/privacy", "Privacy", false],
  ["/terms", "Terms", false],
  [siteConfig.socials.github, "Repo", true],
];

type NavDrawerProps = {
  currentPath?: string;
};

/** Horizontal swipe-to-close handler. Returns pointer event handlers to spread on an element. */
function useSwipeToClose(drawerRef: React.RefObject<HTMLElement | null>, onClose: () => void) {
  const stateRef = useRef({ startX: 0, currentX: 0, dragging: false, lastX: 0, lastT: 0, releaseVelocity: 0 });
  const velocityRef = useRef(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("a, button")) return;
    const s = stateRef.current;
    s.startX = s.currentX = s.lastX = e.clientX;
    s.lastT = performance.now();
    s.releaseVelocity = 0;
    s.dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const now = performance.now();
    const dt = now - s.lastT;
    if (dt > 0) s.releaseVelocity = (e.clientX - s.lastX) / dt;
    s.lastX = e.clientX;
    s.lastT = now;
    s.currentX = e.clientX;
    const el = drawerRef.current;
    if (el) {
      el.style.transform = `translateX(${Math.max(0, s.currentX - s.startX)}px)`;
      el.style.transition = "none";
    }
    e.preventDefault();
  }, [drawerRef]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    s.dragging = false;
    velocityRef.current = s.releaseVelocity;
    const delta = s.currentX - s.startX;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const el = drawerRef.current;
    if (el) { el.style.transition = ""; el.style.transform = ""; }
    if (delta > (el?.offsetWidth ?? 280) * 0.3) onCloseRef.current();
  }, [drawerRef]);

  return { onPointerDown, onPointerMove, onPointerUp, getVelocity: () => velocityRef.current };
}

export default function NavDrawer(props: NavDrawerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const lockPageScroll = useCallback(() => lockBodyScroll("nav-drawer-open"), []);
  const unlockPageScroll = useCallback(() => unlockBodyScroll("nav-drawer-open"), []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    unlockPageScroll();
  }, [unlockPageScroll]);

  const swipe = useSwipeToClose(drawerRef, closeDrawer);

  useEffect(() => {
    const nav = rootRef.current?.closest(".nav");
    if (nav instanceof HTMLElement) {
      nav.classList.toggle("has-open-drawer", open);
    }
    if (open) lockPageScroll();
  }, [open, lockPageScroll]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, closeDrawer]);

  useEffect(() => () => unlockPageScroll(), [unlockPageScroll]);

  const setDrawerRef = useCallback((el: HTMLElement | null) => {
    drawerRef.current = el;
    if (el) {
      const distance = el.offsetWidth || 320;
      motionApply(el, motionFor("panel", "enter", {
        distance,
        size: distance,
        pointerVelocity: swipe.getVelocity(),
      }));
    }
  }, [swipe]);

  return (
    <div className="nav-menu" ref={rootRef} data-open={open ? "" : undefined}>
      <button
        type="button"
        className="nav-hamburger"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation-menu"
        data-sound={open ? "overlay.close" : "overlay.open"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>
      {open && createPortal(
        <>
          <div className="nav-drawer-overlay" onClick={closeDrawer} data-sound="overlay.close" />
          <nav
            id="mobile-navigation-menu"
            className="nav-drawer"
            ref={setDrawerRef}
            aria-label="Mobile navigation"
            onPointerDown={swipe.onPointerDown}
            onPointerMove={swipe.onPointerMove}
            onPointerUp={swipe.onPointerUp}
          >
            <div className="nav-drawer__links">
              {LINKS.map(([href, label, external]) => (
                <a
                  key={href}
                  href={href}
                  className={`nav-drawer__link${props.currentPath === href ? " is-active" : ""}`}
                  onClick={() => closeDrawer()}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="nav-drawer__footer">
              <a
                href={siteConfig.socials.discord}
                className="nav-drawer__discord"
                target="_blank"
                rel="noreferrer"
                onClick={() => closeDrawer()}
              >
                <span className="material-symbols-outlined">forum</span>
                Join Discord
              </a>
              <a
                href={siteConfig.socials.donate}
                className="nav-drawer__donate"
                target="_blank"
                rel="noreferrer"
                onClick={() => closeDrawer()}
              >
                <span className="material-symbols-outlined">favorite</span>
                Donate
              </a>
            </div>
          </nav>
        </>,
        document.body,
      )}
    </div>
  );
}
