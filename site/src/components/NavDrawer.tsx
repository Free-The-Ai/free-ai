import { useState, useRef, useCallback, useEffect } from "react";
import { siteConfig } from "../config/site";
import { NavDrawerSheet } from "./ui";

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

export default function NavDrawer(props: NavDrawerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const closeDrawer = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const nav = rootRef.current?.closest(".nav");
    if (nav instanceof HTMLElement) {
      nav.classList.toggle("has-open-drawer", open);
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

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
      <NavDrawerSheet open={open} onOpenChange={setOpen}>
        <nav id="mobile-navigation-menu" aria-label="Mobile navigation" className="nav-drawer-panel">
          <div className="nav-drawer-header">
            <span className="nav-drawer-title">Menu</span>
            <button
              type="button"
              className="nav-drawer-close"
              aria-label="Close navigation menu"
              onClick={closeDrawer}
              data-sound="overlay.close"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
          <div className="nav-drawer-links">
            {LINKS.map(([href, label, external]) => (
              <a
                key={href}
                href={href}
                className={`nav-drawer-link${props.currentPath === href ? " is-active" : ""}`}
                onClick={() => closeDrawer()}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {label}
              </a>
            ))}
          </div>
          <div className="nav-drawer-footer">
            <a
              href={siteConfig.socials.discord}
              className="nav-drawer-discord"
              target="_blank"
              rel="noreferrer"
              onClick={() => closeDrawer()}
            >
              <span className="material-symbols-outlined">forum</span>
              Join Discord
            </a>
            <a
              href={siteConfig.socials.donate}
              className="nav-drawer-donate"
              target="_blank"
              rel="noreferrer"
              onClick={() => closeDrawer()}
            >
              <span className="material-symbols-outlined">favorite</span>
              Donate
            </a>
          </div>
        </nav>
      </NavDrawerSheet>
    </div>
  );
}
