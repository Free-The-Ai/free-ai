import { useState, useCallback } from "react";
import { siteConfig } from "../config/site";
import { NavDrawerSheet } from "./ui";

const TABS: [string, string, string][] = [
  ["/home", "Home", "home"],
  ["/models", "Models", "smart_toy"],
  ["/pricing", "Pricing", "payments"],
  ["/status", "Status", "monitoring"],
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
              data-sound={isActive ? undefined : "interaction.tap"}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {icon}
              </span>
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
          <span className="material-symbols-outlined" aria-hidden="true">menu</span>
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
