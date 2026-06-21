import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
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
function useSwipeToClose(el: () => HTMLElement | undefined, onClose: () => void) {
  let startX = 0, currentX = 0, dragging = false;
  let lastX = 0, lastT = 0, releaseVelocity = 0;
  const start = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("a, button")) return;
    startX = currentX = lastX = e.clientX;
    lastT = performance.now();
    releaseVelocity = 0;
    dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = now - lastT;
    if (dt > 0) releaseVelocity = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastT = now;
    currentX = e.clientX;
    const elRef = el();
    if (elRef) {
      elRef.style.transform = `translateX(${Math.max(0, currentX - startX)}px)`;
      elRef.style.transition = "none";
    }
    e.preventDefault();
  };
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    const delta = currentX - startX;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const elRef = el();
    if (elRef) { elRef.style.transition = ""; elRef.style.transform = ""; }
    if (delta > (elRef?.offsetWidth ?? 280) * 0.3) onClose();
  };
  return { onPointerDown: start, onPointerMove: move, onPointerUp: end, getVelocity: () => releaseVelocity };
}

export default function NavDrawer(props: NavDrawerProps) {
  const [open, setOpen] = createSignal(false);
  let rootRef: HTMLDivElement | undefined;
  let drawerRef: HTMLElement | undefined;

  const lockPageScroll = () => lockBodyScroll("nav-drawer-open");
  const unlockPageScroll = () => unlockBodyScroll("nav-drawer-open");

  const closeDrawer = () => {
    setOpen(false);
    unlockPageScroll();
  };

  const swipe = useSwipeToClose(() => drawerRef, closeDrawer);

  createEffect(() => {
    const nav = rootRef?.closest(".nav");
    if (nav instanceof HTMLElement) {
      nav.classList.toggle("has-open-drawer", open());
    }

    if (open()) {
      lockPageScroll();
    }

    if (!open() || typeof document === "undefined") return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };

    document.addEventListener("keydown", closeOnEscape);
    onCleanup(() => {
      document.removeEventListener("keydown", closeOnEscape);
    });
  });

  onCleanup(() => unlockPageScroll());

  return (
    <div class="nav-menu" ref={rootRef} data-open={open() ? "" : undefined}>
      <button
        type="button"
        class="nav-hamburger"
        aria-label={open() ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open()}
        aria-controls="mobile-navigation-menu"
        data-sound={open() ? "overlay.close" : "overlay.open"}
        onClick={() => setOpen((value) => !value)}
      >
        <span class="hamburger-bar" />
        <span class="hamburger-bar" />
        <span class="hamburger-bar" />
      </button>
      <Show when={open()}>
        <Portal mount={document.body}>
          <div class="nav-drawer-overlay" onClick={closeDrawer} data-sound="overlay.close" />
          <nav
            id="mobile-navigation-menu"
            class="nav-drawer"
            ref={(el) => {
              drawerRef = el;
              const distance = el.offsetWidth || 320;
              motionApply(el, motionFor("panel", "enter", {
                distance,
                size: distance,
                pointerVelocity: swipe.getVelocity(),
              }));
            }}
            aria-label="Mobile navigation"
            onPointerDown={swipe.onPointerDown}
            onPointerMove={swipe.onPointerMove}
            onPointerUp={swipe.onPointerUp}
          >
            <div class="nav-drawer__links">
              {LINKS.map(([href, label, external]) => (
                <a
                  href={href}
                  class={`nav-drawer__link${props.currentPath === href ? " is-active" : ""}`}
                  onClick={() => closeDrawer()}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  {label}
                </a>
              ))}
            </div>
            <div class="nav-drawer__footer">
              <a
                href={siteConfig.socials.discord}
                class="nav-drawer__discord"
                target="_blank"
                rel="noreferrer"
                onClick={() => closeDrawer()}
              >
                <span class="material-symbols-outlined">forum</span>
                Join Discord
              </a>
              <a
                href={siteConfig.socials.donate}
                class="nav-drawer__donate"
                target="_blank"
                rel="noreferrer"
                onClick={() => closeDrawer()}
              >
                <span class="material-symbols-outlined">favorite</span>
                Donate
              </a>
            </div>
          </nav>
        </Portal>
      </Show>
    </div>
  );
}
