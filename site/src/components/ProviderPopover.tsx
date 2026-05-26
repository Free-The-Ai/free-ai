import {
    Show,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import type { ProviderHealth } from "./ProviderStatusGrid";
import { formatPercent } from "../utils/format";

type ScrollRailMetrics = {
    scrollable: boolean;
    thumbHeight: number;
    thumbTop: number;
};

const DISMISS_THRESHOLD = 0.3;

const POPOVER_CSS = `
/* ═══ Popover Backdrop ═══ */
.popover-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  overscroll-behavior: contain;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  animation: backdrop-in 0.18s ease;
}
@keyframes backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ═══ Popover Shell ═══ */
.popover {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(520px, calc(100vw - 32px));
  max-height: min(640px, calc(100vh - 64px));
  max-height: min(640px, calc(100dvh - 64px));
  height: min(640px, calc(100vh - 64px));
  height: min(640px, calc(100dvh - 64px));
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius);
  background: var(--sk-shell-bg);
  box-shadow: var(--sk-raised-crisp-shadow), 0 32px 64px rgba(0, 0, 0, 0.7);
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.popover.is-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.popover-status-strip {
  flex-shrink: 0;
  height: 3px;
  margin: -1px -1px 0;
  border-radius: var(--radius) var(--radius) 0 0;
}
.is-up .popover-status-strip    { background: rgba(46, 160, 67, 0.6); }
.is-degraded .popover-status-strip { background: rgba(217, 119, 6, 0.65); }
.is-down .popover-status-strip  { background: rgba(255, 77, 77, 0.65); }

.popover-drag-handle {
  display: none;
  width: 64px;
  height: 28px;
  margin: 0 auto;
  padding: 10px 14px 13px;
  box-sizing: border-box;
  border: 0;
  background: transparent;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
}
.popover-drag-handle::before {
  content: "";
  display: block;
  width: 36px;
  height: 5px;
  margin: 0 auto;
  border-radius: 3px;
  background: var(--border-strong);
}
.popover-drag-handle:active { cursor: grabbing; }

.popover-header {
  flex-shrink: 0;
  padding: 0 24px;
  min-width: 0;
  touch-action: none;
}
.popover-header.has-handle { padding-top: 0; }

.popover-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  color: var(--muted);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.popover-close:hover {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--sk-shell-bg);
}
.popover-close:active { transform: scale(0.93); }

.popover-heading {
  margin: 22px 0 4px;
  color: var(--text);
  font-family: var(--font-serif);
  font-size: 1.3rem;
  font-weight: 600;
  padding-right: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.popover-sub {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 0.84rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.popover-body-frame {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}
.popover-body {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  min-height: 0;
  padding: 8px 24px 24px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
}
.popover-body::-webkit-scrollbar { width: 0; height: 0; }
.popover-scroll-rail {
  position: absolute;
  top: 8px;
  right: 7px;
  bottom: 14px;
  width: 12px;
  border-radius: 999px;
  background: transparent;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  touch-action: none;
}
.popover-body-frame.is-scrollable .popover-scroll-rail {
  opacity: 1;
  pointer-events: auto;
}
.popover-scroll-rail:hover,
.popover-scroll-rail.is-dragging { background: transparent; }
.popover-scroll-thumb {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  min-height: 32px;
  border-radius: 999px;
  background: transparent;
  cursor: grab;
  touch-action: none;
}
.popover-scroll-thumb::before {
  content: "";
  position: absolute;
  inset: 0 4px;
  border-radius: 999px;
  background: rgba(238, 93, 32, 0.48);
}
.popover-scroll-thumb:hover,
.popover-scroll-thumb.is-dragging { background: transparent; }
.popover-scroll-thumb.is-dragging { cursor: grabbing; }
.popover-scroll-thumb:hover::before,
.popover-scroll-thumb.is-dragging::before { background: rgba(238, 93, 32, 0.78); }

.detail-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  align-items: baseline;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  min-width: 0;
}
.detail-section:last-child { margin-bottom: 0; }

.detail-section-title {
  grid-column: 1 / -1;
  color: var(--dim);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding-bottom: 6px;
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-section dt {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.detail-section dd {
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-section dd.zero { color: var(--muted); }

.catalog-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius);
  color: var(--accent-text);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.15s ease, background 0.15s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.catalog-link:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
}
.catalog-link-arrow { font-size: 0.9rem; opacity: 0.7; flex-shrink: 0; }

@media (max-width: 640px) {
  .popover-backdrop {
    padding: 0;
    align-items: flex-end;
  }
  .popover {
    width: 100%;
    max-width: 100%;
    max-height: 88vh;
    max-height: 88dvh;
    height: 88vh;
    height: 88dvh;
    border-radius: 14px 14px 0 0;
    border-bottom: none;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
  }
  .popover.is-open { transform: translateY(0); }
  .popover-drag-handle { display: block; }
  .popover-header { padding: 0 18px; }
  .popover-header.has-handle { padding-top: 0; }
  .popover-heading { margin-top: 0; font-size: 1.15rem; }
  .popover-sub { margin-bottom: 12px; font-size: 0.78rem; }
  .popover-body {
    padding: 4px 30px calc(20px + env(safe-area-inset-bottom, 0px)) 18px;
    overscroll-behavior: contain;
  }
  .popover-close { top: 16px; right: 14px; }
  .detail-section {
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
    padding: 12px;
  }
  .detail-section dt { font-size: 0.68rem; }
  .detail-section dd { font-size: 0.8rem; }
}

html.popover-open { background: var(--bg); }
html.popover-open,
body.popover-open {
  overflow: hidden;
  overscroll-behavior: none;
}
body.popover-open {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
}
`;

function useScrollRail(onProviderChange: () => unknown) {
    const [metrics, setMetrics] = createSignal<ScrollRailMetrics>({ scrollable: false, thumbHeight: 0, thumbTop: 0 });
    const [isDragging, setIsDragging] = createSignal(false);
    let bodyEl: HTMLDivElement | undefined;
    let railEl: HTMLDivElement | undefined;
    let frame: number | undefined;
    let dragStartY = 0;
    let dragStartTop = 0;

    const reset = () => setMetrics({ scrollable: false, thumbHeight: 0, thumbTop: 0 });
    const update = () => {
        const body = bodyEl, rail = railEl;
        if (!body || !rail) { reset(); return; }
        const maxScroll = body.scrollHeight - body.clientHeight;
        const railH = rail.clientHeight;
        if (maxScroll <= 1 || railH <= 0) { reset(); return; }
        const thumbH = Math.max(32, Math.round((body.clientHeight / body.scrollHeight) * railH));
        const maxT = Math.max(0, railH - thumbH);
        setMetrics({ scrollable: true, thumbHeight: thumbH, thumbTop: Math.round((body.scrollTop / maxScroll) * maxT) });
    };
    const queueUpdate = () => {
        if (typeof window === "undefined") return;
        if (frame !== undefined) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => { frame = undefined; update(); });
    };
    const scrollToThumb = (thumbTop: number) => {
        const body = bodyEl, rail = railEl;
        if (!body || !rail) return;
        const maxScroll = body.scrollHeight - body.clientHeight;
        const maxT = rail.clientHeight - metrics().thumbHeight;
        body.scrollTop = maxT > 0 ? (thumbTop / maxT) * maxScroll : 0;
        update();
    };
    const onRailDown = (e: PointerEvent) => {
        if (!metrics().scrollable || e.target !== e.currentTarget || !railEl) return;
        e.preventDefault(); e.stopPropagation();
        const rect = railEl.getBoundingClientRect();
        const maxT = Math.max(0, railEl.clientHeight - metrics().thumbHeight);
        scrollToThumb(Math.max(0, Math.min(e.clientY - rect.top - metrics().thumbHeight / 2, maxT)));
    };
    const onThumbDown = (e: PointerEvent) => {
        if (!metrics().scrollable) return;
        e.preventDefault(); e.stopPropagation();
        dragStartY = e.clientY; dragStartTop = metrics().thumbTop;
        setIsDragging(true);
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    };
    const onThumbMove = (e: PointerEvent) => {
        if (!isDragging() || !railEl) return;
        e.preventDefault(); e.stopPropagation();
        const maxT = Math.max(0, railEl.clientHeight - metrics().thumbHeight);
        scrollToThumb(Math.max(0, Math.min(dragStartTop + e.clientY - dragStartY, maxT)));
    };
    const onThumbEnd = (e: PointerEvent) => {
        if (!isDragging()) return;
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        const t = e.currentTarget as HTMLDivElement;
        if (t.hasPointerCapture(e.pointerId)) t.releasePointerCapture(e.pointerId);
    };
    const onBodyWheel = (e: WheelEvent) => {
        const body = bodyEl;
        if (!body) return;
        const maxScroll = body.scrollHeight - body.clientHeight;
        if (maxScroll <= 1) return;
        const deltaY = e.deltaMode === DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === DOM_DELTA_PAGE ? e.deltaY * body.clientHeight : e.deltaY;
        e.preventDefault(); e.stopPropagation();
        body.scrollTop = Math.max(0, Math.min(body.scrollTop + deltaY, maxScroll));
        update();
    };

    createEffect(() => { if (onProviderChange()) queueUpdate(); });

    return {
        metrics, isDragging, queueUpdate,
        setBodyRef: (el: HTMLDivElement) => { bodyEl = el; queueUpdate(); },
        setRailRef: (el: HTMLDivElement) => { railEl = el; queueUpdate(); },
        onRailDown, onThumbDown, onThumbMove, onThumbEnd, onBodyWheel,
        cleanup: () => { if (frame !== undefined) window.cancelAnimationFrame(frame); },
    };
}

function useDragToDismiss(isMobile: () => boolean, onDismiss: () => void) {
    const [dragOffset, setDragOffset] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);
    let sheetEl: HTMLDivElement | undefined;
    let startY = 0;
    let startOffset = 0;
    let boundMove: ((e: PointerEvent) => void) | null = null;
    let boundUp: ((e: PointerEvent) => void) | null = null;

    const move = (e: PointerEvent) => {
        if (!isDragging()) return;
        e.preventDefault();
        const delta = e.clientY - startY;
        setDragOffset(Math.max(0, startOffset + (delta > 0 ? delta : delta * 0.3)));
    };
    const end = (e: PointerEvent) => {
        if (!isDragging()) return;
        e.preventDefault();
        setIsDragging(false);
        if (boundMove) document.removeEventListener("pointermove", boundMove);
        if (boundUp) {
            document.removeEventListener("pointerup", boundUp);
            document.removeEventListener("pointercancel", boundUp);
        }
        boundMove = null; boundUp = null;
        const threshold = (sheetEl?.offsetHeight ?? 400) * DISMISS_THRESHOLD;
        if (dragOffset() > threshold) onDismiss();
        else setDragOffset(0);
    };
    const start = (e: PointerEvent) => {
        if (!isMobile()) return;
        const target = e.target as HTMLElement;
        if (target.closest("button,a")) return;
        e.preventDefault();
        startY = e.clientY; startOffset = dragOffset();
        setIsDragging(true);
        boundMove = move; boundUp = end;
        document.addEventListener("pointermove", boundMove, { passive: false });
        document.addEventListener("pointerup", boundUp, { passive: false });
        document.addEventListener("pointercancel", boundUp, { passive: false });
    };

    return {
        dragOffset, isDragging,
        setSheetRef: (el: HTMLDivElement) => { sheetEl = el; },
        onDragStart: start, resetOffset: () => setDragOffset(0),
        cleanup: () => {
            if (boundMove) document.removeEventListener("pointermove", boundMove);
            if (boundUp) {
                document.removeEventListener("pointerup", boundUp);
                document.removeEventListener("pointercancel", boundUp);
            }
        },
    };
}

function formatTimestamp(iso: string | null | undefined): string {
    if (!iso) return "never";
    try {
        const date = new Date(iso);
        return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return "unknown";
    }
}

export default function ProviderPopover(props: {
    provider: ProviderHealth;
    onClose: () => void;
}) {
    const [isMobile, setIsMobile] = createSignal(false);
    let lockedScrollY = 0;

    const provider = () => props.provider;
    const closePopover = () => {
        unlockPageScroll();
        props.onClose();
    };
    const isAffected = provider().status === "degraded" || provider().status === "down";

    /* ── Hooks ── */
    const rail = useScrollRail(provider);
    const drag = useDragToDismiss(isMobile, closePopover);

    /* ── Body scroll lock ── */
    const lockPageScroll = () => {
        if (typeof document === "undefined" || document.body.classList.contains("popover-open")) return;
        lockedScrollY = window.scrollY;
        document.documentElement.classList.add("popover-open");
        document.body.classList.add("popover-open");
        document.body.style.top = `-${lockedScrollY}px`;
    };
    const unlockPageScroll = () => {
        if (typeof document === "undefined" || !document.body.classList.contains("popover-open")) return;
        const restoreY = lockedScrollY;
        document.documentElement.classList.remove("popover-open");
        document.body.classList.remove("popover-open");
        document.body.style.top = "";
        lockedScrollY = 0;
        window.scrollTo(0, restoreY);
    };

    onMount(() => {
        lockPageScroll();
        if (typeof window === "undefined") return;
        setIsMobile(window.innerWidth <= 640);
        const onResize = () => { setIsMobile(window.innerWidth <= 640); rail.queueUpdate(); };
        window.addEventListener("resize", onResize);
        document.addEventListener("keydown", (e: KeyboardEvent) => { if (e.key === "Escape") closePopover(); });
        onCleanup(() => window.removeEventListener("resize", onResize));
    });

    onCleanup(() => { unlockPageScroll(); rail.cleanup(); drag.cleanup(); });

    const sheetTransform = () => !isMobile() ? undefined : drag.dragOffset() > 0 ? `translateY(${drag.dragOffset()}px)` : undefined;
    const sheetTransition = () => drag.isDragging() ? "none" : undefined;

    return (
        <div>
            <style>{POPOVER_CSS}</style>
                <div
                    class="popover-backdrop"
                    onClick={closePopover}
                    data-sound="overlay.close"
                >
                    <div
                        ref={drag.setSheetRef}
                        class={`popover is-${provider().status} is-open`}
                        style={{
                            transform: sheetTransform(),
                            transition: sheetTransition(),
                        }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label={`${provider().prefix} provider details`}
                    >
                        <div class="popover-status-strip" />

                        <Show when={isMobile()}>
                            <div
                                class="popover-drag-handle"
                                data-sound="overlay.close"
                                onPointerDown={drag.onDragStart}
                            />
                        </Show>

                        <div
                            class={`popover-header${isMobile() ? " has-handle" : ""}`}
                            onPointerDown={
                                isMobile() ? drag.onDragStart : undefined
                            }
                        >
                            <button
                                class="popover-close"
                                onClick={closePopover}
                                data-sound="overlay.close"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h3 class="popover-heading">
                                <span
                                    class={`status-dot is-${provider().status}`}
                                    style="display:inline-block;margin-right:8px;vertical-align:middle"
                                />{" "}
                                {provider().prefix}/
                            </h3>
                            <p class="popover-sub">
                                Status:{" "}
                                <strong style="color:var(--text)">
                                    {provider().status}
                                </strong>{" "}
                                &middot;{" "}
                                {provider().model_count.toLocaleString()}{" "}
                                {provider().model_count === 1
                                    ? "model"
                                    : "models"}
                                {isAffected &&
                                    (provider().status === "down"
                                        ? " — affected"
                                        : " — at risk")}
                            </p>
                        </div>

                        <div
                            class={`popover-body-frame${rail.metrics().scrollable ? " is-scrollable" : ""}`}
                            onWheel={rail.onBodyWheel}
                        >
                            <div
                                class="popover-body"
                                ref={rail.setBodyRef}
                                onScroll={rail.metrics.scrollable ? rail.queueUpdate : undefined}
                            >
                            <dl class="detail-section">
                                <h4 class="detail-section-title">Reliability</h4>
                                <dt>60m error rate</dt>
                                <dd
                                    class={
                                        provider().error_rate_60m === 0
                                            ? "zero"
                                            : ""
                                    }
                                >
                                    {formatPercent(provider().error_rate_60m)}
                                </dd>
                                <dt>30m errors</dt>
                                <dd>
                                    {provider().errors_30m.toLocaleString()}
                                </dd>
                                <dt>60m errors</dt>
                                <dd>
                                    {provider().errors_60m.toLocaleString()}
                                </dd>
                            </dl>

                            <dl class="detail-section">
                                <h4 class="detail-section-title">Throughput</h4>
                                <dt>60m requests</dt>
                                <dd>
                                    {provider().requests_60m.toLocaleString()}
                                </dd>
                                <dt>30m successes</dt>
                                <dd>
                                    {provider().successes_30m.toLocaleString()}
                                </dd>
                                <dt>60m successes</dt>
                                <dd>
                                    {provider().successes_60m.toLocaleString()}
                                </dd>
                            </dl>

                            <dl class="detail-section">
                                <h4 class="detail-section-title">Activity</h4>
                                <dt>Last success</dt>
                                <dd>
                                    {formatTimestamp(
                                        provider().last_success_at,
                                    )}
                                </dd>
                                <dt>Last error</dt>
                                <dd
                                    class={
                                        !provider().last_error_at ? "zero" : ""
                                    }
                                >
                                    {formatTimestamp(
                                        provider().last_error_at,
                                    )}
                                </dd>
                            </dl>

                            <Show when={provider().model_count > 0}>
                                <a
                                    class="catalog-link"
                                    href={`/models?prefix=${provider().prefix}`}
                                >
                                    View all in model catalog
                                    <span class="catalog-link-arrow">
                                        &rarr;
                                    </span>
                                </a>
                            </Show>
                        </div>

                        <div
                            class={`popover-scroll-rail${rail.isDragging() ? " is-dragging" : ""}`}
                            ref={rail.setRailRef}
                            aria-hidden="true"
                            onPointerDown={rail.onRailDown}
                        >
                            <div
                                class={`popover-scroll-thumb${rail.isDragging() ? " is-dragging" : ""}`}
                                style={{
                                    height: `${rail.metrics().thumbHeight}px`,
                                    transform: `translateY(${rail.metrics().thumbTop}px)`,
                                }}
                                onPointerDown={rail.onThumbDown}
                                onPointerMove={rail.onThumbMove}
                                onPointerUp={rail.onThumbEnd}
                                onPointerCancel={rail.onThumbEnd}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


