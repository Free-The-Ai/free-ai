import { createEffect, createSignal, onCleanup } from "solid-js";
import { Dialog } from "@kobalte/core/dialog";
import { Tooltip } from "./ui";
import { siteConfig } from "../config/site";

const LINKS: [string, string, boolean][] = [
  ["/", "Home", false],
  ["/docs", "Docs", false],
  ["/models", "Models", false],
  [siteConfig.socials.github, "Repo", true],
];

export default function NavDrawer() {
  const [open, setOpen] = createSignal(false);
  let closeButtonRef: HTMLButtonElement | undefined;

  createEffect(() => {
    if (!open() || typeof document === "undefined") return;

    const scrollY = window.scrollY;
    const style = document.body.style;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    onCleanup(() => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    });
  });

  return (
    <Dialog open={open()} onOpenChange={setOpen} modal preventScroll={false}>
      <Dialog.Trigger
        class="nav-hamburger"
        aria-label="Open navigation menu"
      >
        <Tooltip content="Menu">
          <span class="hamburger-bar" />
          <span class="hamburger-bar" />
          <span class="hamburger-bar" />
        </Tooltip>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="nav-drawer-overlay" />
        <Dialog.Content
          class="nav-drawer"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeButtonRef?.focus({ preventScroll: true });
          }}
        >
          <Dialog.Title class="nav-drawer__title">Navigation</Dialog.Title>
          <nav class="nav-drawer__links">
            {LINKS.map(([href, label, external]) => (
              <a
                href={href}
                class="nav-drawer__link"
                onClick={() => setOpen(false)}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div class="nav-drawer__footer">
            <a
              href={siteConfig.socials.discord}
              class="nav-drawer__discord"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              <span class="material-symbols-outlined">forum</span>
              Join Discord
            </a>
          </div>
          <Dialog.CloseButton ref={closeButtonRef} class="nav-drawer__close" aria-label="Close menu">
            <Tooltip content="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </Tooltip>
          </Dialog.CloseButton>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
