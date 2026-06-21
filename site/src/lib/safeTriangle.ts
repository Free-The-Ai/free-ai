/**
 * Prediction cone ("safe triangle") for submenu hover behavior.
 *
 * When the pointer travels diagonally from a parent menu item toward its
 * submenu, a naive hover-out handler would close the submenu mid-transit.
 * The prediction cone is an invisible triangular area whose apex sits at the
 * last pointer position and whose base spans the far edge of the submenu
 * content. While the pointer remains inside the cone the submenu is kept
 * open; once it leaves (and is not inside the trigger or content) a grace
 * timer closes it.
 *
 * The geometry mirrors the proven Radix/Kobalte pointer-grace-area algorithm
 * but is exposed here as a reusable, configurable Solid primitive so any
 * hover bridge (custom nav mega-menus, flyouts, popovers) can opt in with
 * tunable behavior. Kobalte's own Menu.Sub uses the same cone internally and
 * needs no wiring; this primitive is for surfaces that do not use it.
 */
import { createSignal, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";

/** Submenu anchor side, relative to its trigger. */
export type Side = "left" | "right" | "top" | "bottom";

/** A 2D point as [clientX, clientY]. */
export type Point = [number, number];

/** An ordered polygon (the cone) for point-in-polygon testing. */
export type Polygon = Point[];

export interface SafeTriangleOptions {
  /** Padding (px) around the pointer apex so micro-jitter stays in the cone. */
  pointerOffset?: number;
  /** Grace period (ms) before closing after the pointer leaves the cone. */
  closeTimeout?: number;
  /** Render a translucent SVG overlay of the active cone for development. */
  debug?: boolean;
}

export interface SafeTriangleState {
  /** True while the pointer is inside the current prediction cone. */
  isActive: Accessor<boolean>;
  /**
   * Recompute the cone from the live pointer position and test containment.
   * Call this from a `pointermove` handler on the surface that owns the
   * trigger/content pair. Returns true while the pointer is in the cone.
   */
  track: (contentEl: HTMLElement, placement: Side, event: PointerEvent) => boolean;
  /** Reset state, clear timers, and remove any debug overlay. */
  dispose: () => void;
}

/** Ray-casting point-in-polygon. Handles the convex cones we build here. */
export function isPointInPolygon(point: Point, polygon: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Build the prediction cone: a polygon whose apex is the pointer and whose
 * base spans the far edge of the submenu content rect. `pointerOffset` shifts
 * the apex slightly past the pointer toward the content so that the first
 * frame of diagonal motion is captured.
 */
export function buildSafeCone(
  pointer: Point,
  contentRect: DOMRect,
  placement: Side,
  pointerOffset: number,
): Polygon {
  switch (placement) {
    case "right":
      return [
        [pointer[0] - pointerOffset, pointer[1]],
        [contentRect.left, contentRect.top],
        [contentRect.right, contentRect.top],
        [contentRect.right, contentRect.bottom],
        [contentRect.left, contentRect.bottom],
      ];
    case "left":
      return [
        [pointer[0] + pointerOffset, pointer[1]],
        [contentRect.right, contentRect.bottom],
        [contentRect.left, contentRect.bottom],
        [contentRect.left, contentRect.top],
        [contentRect.right, contentRect.top],
      ];
    case "bottom":
      return [
        [pointer[0], pointer[1] - pointerOffset],
        [contentRect.right, contentRect.top],
        [contentRect.right, contentRect.bottom],
        [contentRect.left, contentRect.bottom],
        [contentRect.left, contentRect.top],
      ];
    case "top":
      return [
        [pointer[0], pointer[1] + pointerOffset],
        [contentRect.left, contentRect.bottom],
        [contentRect.left, contentRect.top],
        [contentRect.right, contentRect.top],
        [contentRect.right, contentRect.bottom],
      ];
  }
}

/**
 * Reactive prediction-cone primitive. Attach `track` to the pointermove
 * handler of the surface bridging a trigger and its submenu; read `isActive`
 * to decide whether to defer closing.
 *
 * @example
 * const cone = createSafeTriangle({ closeTimeout: 250 });
 * <div onPointerMove={(e) => {
 *   if (!cone.track(subContentEl, "right", e)) maybeCloseSubmenu();
 * }} />
 */
export function createSafeTriangle(
  options: SafeTriangleOptions = {},
): SafeTriangleState {
  const pointerOffset = options.pointerOffset ?? 5;
  const closeTimeout = options.closeTimeout ?? 300;
  const debug = options.debug ?? false;

  const [isActive, setIsActive] = createSignal(false);
  let cone: Polygon | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let overlay: SVGSVGElement | null = null;

  const paintDebug = (): void => {
    if (!debug) return;
    if (cone && !overlay) {
      overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      overlay.setAttribute(
        "style",
        "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99999;",
      );
      document.body.appendChild(overlay);
    }
    if (!overlay) return;
    overlay.innerHTML = cone
      ? `<polygon points="${cone.map((p) => p.join(",")).join(" ")}" fill="rgba(238,93,32,0.12)" stroke="rgba(238,93,32,0.7)" stroke-width="1"/>`
      : "";
  };

  const track = (
    contentEl: HTMLElement,
    placement: Side,
    event: PointerEvent,
  ): boolean => {
    const pointer: Point = [event.clientX, event.clientY];
    cone = buildSafeCone(
      pointer,
      contentEl.getBoundingClientRect(),
      placement,
      pointerOffset,
    );
    const inside = isPointInPolygon(pointer, cone);

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (inside) {
      setIsActive(true);
    } else {
      // Defer deactivation so a brief excursion outside the cone does not
      // snap the submenu shut before the pointer reaches the content.
      timer = setTimeout(() => {
        setIsActive(false);
        cone = null;
        paintDebug();
      }, closeTimeout);
    }
    paintDebug();
    return inside;
  };

  const dispose = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
    cone = null;
    setIsActive(false);
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  onCleanup(dispose);
  return { isActive, track, dispose };
}
