import { useState, useCallback } from "react";
import { siteConfig } from "../config/site";
import { NavDrawerSheet } from "./ui";

const ICONS: Record<string, JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .6-1.4l7-6a2 2 0 0 1 2.8 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
    </svg>
  ),
  models: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  pricing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  status: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-3l-2.5 5-4.5-10-3.5 7H2" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="5" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  ),
};

const TABS: [string, string, string][] = [
  ["/home", "Home", "home"],
  ["/models", "Models", "models"],
  ["/pricing", "Pricing", "pricing"],
  ["/status", "Status", "status"],
];

const MORE: [string, string, boolean][] = [
  ["/docs", "Docs", false],
  ["/setup", "Setup", false],
  ["/roleplay-api", "Roleplay API", false],
  ["/coding-agent-api", "Coding API", false],
  ["/privacy", "Privacy", false],
  ["/terms", "Terms", false],
  [siteConfig.socials.github, "Repo", true],
  [siteConfig.socials.discord, "Join Discord", true],
  [siteConfig.socials.donate, "Donate", true],
];

type NavDrawerProps = {
  currentPath?: string;
};

export default function NavDrawer(props: NavDrawerProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  return (
    <div className="mobile-nav">
      <nav className="bottom-tab-bar" aria-label="Mobile navigation">
        {TABS.map(([href, label, icon]) => {
          const isActive = props.currentPath === href;
          return (
            <a
              key={href}
              href={href}
              className={`bottom-tab${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              data-sound={isActive ? "interaction.subtle" : "interaction.tap"}
            >
              <span className="bottom-tab-icon">{ICONS[icon]}</span>
              <span className="bottom-tab-label">{label}</span>
            </a>
          );
        })}
        <button
          type="button"
          className={`bottom-tab${moreOpen ? " is-active" : ""}`}
          aria-label="More navigation"
          aria-expanded={moreOpen}
          aria-controls="mobile-more-menu"
          data-sound={moreOpen ? "overlay.close" : "overlay.open"}
          onClick={() => setMoreOpen((value) => !value)}
        >
          <span className="bottom-tab-icon">{ICONS.more}</span>
          <span className="bottom-tab-label">More</span>
        </button>
      </nav>

      <NavDrawerSheet open={moreOpen} onOpenChange={setMoreOpen} className="more-sheet">
        <div id="mobile-more-menu" className="more-menu">
          <span className="more-menu-title">More</span>
          <nav className="more-menu-links" aria-label="More navigation">
            {MORE.map(([href, label, external]) => (
              <a
                key={href}
                href={href}
                className={`more-menu-link${props.currentPath === href ? " is-active" : ""}`}
                onClick={closeMore}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </NavDrawerSheet>
    </div>
  );
}
