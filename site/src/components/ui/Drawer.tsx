import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";

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
  return (
    <BaseDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="down"
      modal={modal}
    >
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="responsive-drawer-backdrop" data-sound="overlay.close" />
        <BaseDrawer.Viewport className="responsive-drawer-viewport">
          <BaseDrawer.Popup
            className={`responsive-drawer-popup${className ? ` ${className}` : ""}`}
          >
            <div className="responsive-drawer-handle" aria-hidden="true" />
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
  className?: string;
}

export function NavDrawerSheet({ open, onOpenChange, children, className }: NavDrawerSheetProps) {
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
          <BaseDrawer.Popup className={`nav-drawer-popup${className ? ` ${className}` : ""}`}>
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
