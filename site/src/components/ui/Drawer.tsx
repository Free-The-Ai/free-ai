import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

function useMediaQuery(query: string): boolean {
  const getMatches = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);
  const [matches, setMatches] = React.useState(getMatches);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export interface ResponsiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  modal?: boolean;
}

export function ResponsiveDrawer({
  open,
  onOpenChange,
  title,
  children,
  className,
  modal = true,
}: ResponsiveDrawerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const swipeDirection = isMobile ? "down" : "right";
  return (
    <BaseDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={swipeDirection}
      modal={modal}
    >
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="responsive-drawer-backdrop" data-sound="overlay.close" />
        <BaseDrawer.Viewport
          className={`responsive-drawer-viewport${isMobile ? " is-mobile" : " is-desktop"}`}
        >
          <BaseDrawer.Popup
            className={`responsive-drawer-popup${isMobile ? " is-mobile" : " is-desktop"}${className ? ` ${className}` : ""}`}
          >
            {isMobile && (
              <div className="responsive-drawer-handle" aria-hidden="true" />
            )}
            {title && (
              <BaseDrawer.Title className="responsive-drawer-title">
                {title}
              </BaseDrawer.Title>
            )}
            <BaseDrawer.Content className="responsive-drawer-content">
              {children}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export interface NavDrawerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function NavDrawerSheet({ open, onOpenChange, children }: NavDrawerSheetProps) {
  return (
    <BaseDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="down"
      modal={true}
    >
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="nav-drawer-backdrop" data-sound="overlay.close" />
        <BaseDrawer.Viewport className="nav-drawer-viewport">
          <BaseDrawer.Popup className="nav-drawer-popup">
            <div className="nav-drawer-handle" aria-hidden="true" />
            <BaseDrawer.Content className="nav-drawer-content">
              {children}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export default ResponsiveDrawer;
