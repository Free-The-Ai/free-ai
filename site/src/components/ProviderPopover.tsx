import { useState, useEffect, useRef, useCallback } from "react";
import type { ProviderHealth } from "./ProviderStatusGrid";
import { formatPercent } from "../utils/format";
import { disconnectPointerDrag, lockBodyScroll, unlockBodyScroll } from "../lib/domUtils";
import { motionApply, motionFor } from "../lib/motion";

type ScrollRailMetrics = {
    scrollable: boolean;
    thumbHeight: number;
    thumbTop: number;
};

const DISMISS_THRESHOLD = 0.3;

function useScrollRail(provider: ProviderHealth) {
    const [metrics, setMetrics] = useState<ScrollRailMetrics>({ scrollable: false, thumbHeight: 0, thumbTop: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const railRef = useRef<HTMLDivElement | null>(null);
    const frameRef = useRef<number | undefined>(undefined);
    const dragStartYRef = useRef(0);
    const dragStartTopRef = useRef(0);
    const metricsRef = useRef(metrics);
    metricsRef.current = metrics;
    const isDraggingRef = useRef(false);
    isDraggingRef.current = isDragging;

    const reset = useCallback(() => setMetrics({ scrollable: false, thumbHeight: 0, thumbTop: 0 }), []);

    const update = useCallback(() => {
        const body = bodyRef.current, rail = railRef.current;
        if (!body || !rail) { reset(); return; }
        const maxScroll = body.scrollHeight - body.clientHeight;
        const railH = rail.clientHeight;
        if (maxScroll <= 1 || railH <= 0) { reset(); return; }
        const thumbH = Math.max(32, Math.round((body.clientHeight / body.scrollHeight) * railH));
        const maxT = Math.max(0, railH - thumbH);
        setMetrics({ scrollable: true, thumbHeight: thumbH, thumbTop: Math.round((body.scrollTop / maxScroll) * maxT) });
    }, [reset]);

    const queueUpdate = useCallback(() => {
        if (typeof window === "undefined") return;
        if (frameRef.current !== undefined) window.cancelAnimationFrame(frameRef.current);
        frameRef.current = window.requestAnimationFrame(() => { frameRef.current = undefined; update(); });
    }, [update]);

    const scrollToThumb = useCallback((thumbTop: number) => {
        const body = bodyRef.current, rail = railRef.current;
        if (!body || !rail) return;
        const maxScroll = body.scrollHeight - body.clientHeight;
        const maxT = rail.clientHeight - metricsRef.current.thumbHeight;
        body.scrollTop = maxT > 0 ? (thumbTop / maxT) * maxScroll : 0;
        update();
    }, [update]);

    const onRailDown = useCallback((e: React.PointerEvent) => {
        if (!metricsRef.current.scrollable || e.target !== e.currentTarget || !railRef.current) return;
        e.preventDefault(); e.stopPropagation();
        const rect = railRef.current.getBoundingClientRect();
        const maxT = Math.max(0, railRef.current.clientHeight - metricsRef.current.thumbHeight);
        scrollToThumb(Math.max(0, Math.min(e.clientY - rect.top - metricsRef.current.thumbHeight / 2, maxT)));
    }, [scrollToThumb]);

    const onThumbDown = useCallback((e: React.PointerEvent) => {
        if (!metricsRef.current.scrollable) return;
        e.preventDefault(); e.stopPropagation();
        dragStartYRef.current = e.clientY;
        dragStartTopRef.current = metricsRef.current.thumbTop;
        setIsDragging(true);
        isDraggingRef.current = true;
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    }, []);

    const onThumbMove = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current || !railRef.current) return;
        e.preventDefault(); e.stopPropagation();
        const maxT = Math.max(0, railRef.current.clientHeight - metricsRef.current.thumbHeight);
        scrollToThumb(Math.max(0, Math.min(dragStartTopRef.current + e.clientY - dragStartYRef.current, maxT)));
    }, [scrollToThumb]);

    const onThumbEnd = useCallback((e: React.PointerEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        isDraggingRef.current = false;
        const t = e.currentTarget as HTMLDivElement;
        if (t.hasPointerCapture(e.pointerId)) t.releasePointerCapture(e.pointerId);
    }, []);

    const onBodyWheel = useCallback((e: React.WheelEvent) => {
        const body = bodyRef.current;
        if (!body) return;
        const maxScroll = body.scrollHeight - body.clientHeight;
        if (maxScroll <= 1) return;
        const deltaY = e.deltaMode === DOM_DELTA_LINE ? e.deltaY * 16 : e.deltaMode === DOM_DELTA_PAGE ? e.deltaY * body.clientHeight : e.deltaY;
        e.preventDefault(); e.stopPropagation();
        body.scrollTop = Math.max(0, Math.min(body.scrollTop + deltaY, maxScroll));
        update();
    }, [update]);

    useEffect(() => { queueUpdate(); }, [provider, queueUpdate]);

    useEffect(() => () => { if (frameRef.current !== undefined) window.cancelAnimationFrame(frameRef.current); }, []);

    return {
        metrics, isDragging, queueUpdate,
        bodyRef, railRef,
        onRailDown, onThumbDown, onThumbMove, onThumbEnd, onBodyWheel,
    };
}

function useDragToDismiss(isMobile: boolean, onDismiss: () => void) {
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const startYRef = useRef(0);
    const startOffsetRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef(0);
    const boundMoveRef = useRef<((e: PointerEvent) => void) | null>(null);
    const boundUpRef = useRef<((e: PointerEvent) => void) | null>(null);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;
    const isMobileRef = useRef(isMobile);
    isMobileRef.current = isMobile;

    const move = useCallback((e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        const delta = e.clientY - startYRef.current;
        const next = Math.max(0, startOffsetRef.current + (delta > 0 ? delta : delta * 0.3));
        dragOffsetRef.current = next;
        setDragOffset(next);
    }, []);

    const end = useCallback((e: PointerEvent) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        setIsDragging(false);
        isDraggingRef.current = false;
        disconnectPointerDrag(boundMoveRef.current, boundUpRef.current);
        boundMoveRef.current = boundUpRef.current = null;
        const threshold = (sheetRef.current?.offsetHeight ?? 400) * DISMISS_THRESHOLD;
        if (dragOffsetRef.current > threshold) onDismissRef.current();
        else setDragOffset(0);
    }, []);

    const onDragStart = useCallback((e: React.PointerEvent) => {
        if (!isMobileRef.current) return;
        const target = e.target as HTMLElement;
        if (target.closest("button,a")) return;
        e.preventDefault();
        startYRef.current = e.clientY;
        startOffsetRef.current = dragOffsetRef.current;
        setIsDragging(true);
        isDraggingRef.current = true;
        boundMoveRef.current = move;
        boundUpRef.current = end;
        document.addEventListener("pointermove", move, { passive: false });
        document.addEventListener("pointerup", end, { passive: false });
        document.addEventListener("pointercancel", end, { passive: false });
    }, [move, end]);

    useEffect(() => () => disconnectPointerDrag(boundMoveRef.current, boundUpRef.current), []);

    return {
        dragOffset, isDragging,
        sheetRef, onDragStart, resetOffset: () => { dragOffsetRef.current = 0; setDragOffset(0); },
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

function ProviderPopoverBody({ provider }: { provider: ProviderHealth }) {
  return (
    <>
      <dl className="detail-section">
        <h4 className="detail-section-title">Reliability</h4>
        <dt>60m error rate</dt>
        <dd className={provider.error_rate_60m === 0 ? "zero" : ""}>{formatPercent(provider.error_rate_60m)}</dd>
        <dt>30m errors</dt>
        <dd>{provider.errors_30m.toLocaleString()}</dd>
        <dt>60m errors</dt>
        <dd>{provider.errors_60m.toLocaleString()}</dd>
      </dl>
      <dl className="detail-section">
        <h4 className="detail-section-title">Throughput</h4>
        <dt>60m requests</dt>
        <dd>{provider.requests_60m.toLocaleString()}</dd>
        <dt>30m successes</dt>
        <dd>{provider.successes_30m.toLocaleString()}</dd>
        <dt>60m successes</dt>
        <dd>{provider.successes_60m.toLocaleString()}</dd>
      </dl>
      <dl className="detail-section">
        <h4 className="detail-section-title">Activity</h4>
        <dt>Last success</dt>
        <dd>{formatTimestamp(provider.last_success_at)}</dd>
        <dt>Last error</dt>
        <dd className={!provider.last_error_at ? "zero" : ""}>{formatTimestamp(provider.last_error_at)}</dd>
      </dl>
      {provider.model_count > 0 && (
        <a className="catalog-link" href={`/models?prefix=${provider.prefix}`}>
          View all in model catalog <span className="catalog-link-arrow">&rarr;</span>
        </a>
      )}
    </>
  );
}

export default function ProviderPopover(props: {
    provider: ProviderHealth;
    onClose: () => void;
}) {
    const [isMobile, setIsMobile] = useState(false);
    const sheetRef = useRef<HTMLDivElement>(null);
    const provider = props.provider;
    const closePopover = useCallback(() => {
        unlockBodyScroll("popover-open");
        props.onClose();
    }, [props]);
    const isAffected = provider.status === "degraded" || provider.status === "down";

    const rail = useScrollRail(provider);
    const drag = useDragToDismiss(isMobile, closePopover);

    const lockPageScroll = useCallback(() => lockBodyScroll("popover-open"), []);

    useEffect(() => {
        lockPageScroll();
        if (sheetRef.current) {
            motionApply(sheetRef.current, motionFor("popover", "enter", {
                size: sheetRef.current.offsetHeight,
            }));
        }
        if (typeof window === "undefined") return;
        setIsMobile(window.innerWidth <= 640);
        const onResize = () => { setIsMobile(window.innerWidth <= 640); rail.queueUpdate(); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePopover(); };
        window.addEventListener("resize", onResize);
        document.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("resize", onResize);
            document.removeEventListener("keydown", onKey);
            unlockBodyScroll("popover-open");
        };
    }, [lockPageScroll, rail, closePopover]);

    const sheetTransform = !isMobile ? undefined : drag.dragOffset > 0 ? `translateY(${drag.dragOffset}px)` : undefined;
    const sheetTransition = drag.isDragging ? "none" : undefined;

    return (
        <div>
            <div
                className="popover-backdrop"
                onClick={closePopover}
                data-sound="overlay.close"
            >
                <div
                    ref={(el) => { sheetRef.current = el; drag.sheetRef.current = el; }}
                    className={`popover is-${provider.status} is-open`}
                    style={{
                        transform: sheetTransform,
                        transition: sheetTransition,
                    }}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-label={`${provider.prefix} provider details`}
                >
                    <div className="popover-status-strip" />

                    {isMobile && (
                        <div
                            className="popover-drag-handle"
                            data-sound="overlay.close"
                            onPointerDown={drag.onDragStart}
                        />
                    )}

                    <div
                        className={`popover-header${isMobile ? " has-handle" : ""}`}
                        onPointerDown={isMobile ? drag.onDragStart : undefined}
                    >
                        <button
                            className="popover-close"
                            onClick={closePopover}
                            data-sound="overlay.close"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h3 className="popover-heading">
                            <span className={`status-dot is-${provider.status}`} />{" "}
                            {provider.prefix}/
                        </h3>
                        <p className="popover-sub">
                            Status:{" "}
                            <strong>{provider.status}</strong>{" "}
                            &middot;{" "}
                            {provider.model_count.toLocaleString()}{" "}
                            {provider.model_count === 1 ? "model" : "models"}
                            {isAffected &&
                                (provider.status === "down" ? " — affected" : " — at risk")}
                        </p>
                    </div>

                    <div
                        className={`popover-body-frame${rail.metrics.scrollable ? " is-scrollable" : ""}`}
                        onWheel={rail.onBodyWheel}
                    >
                        <div
                            className="popover-body"
                            ref={rail.bodyRef}
                            onScroll={rail.metrics.scrollable ? rail.queueUpdate : undefined}
                        >
                            <ProviderPopoverBody provider={provider} />
                        </div>
                    </div>

                    <div
                        className={`popover-scroll-rail${rail.isDragging ? " is-dragging" : ""}`}
                        ref={rail.railRef}
                        aria-hidden="true"
                        onPointerDown={rail.onRailDown}
                    >
                        <div
                            className={`popover-scroll-thumb${rail.isDragging ? " is-dragging" : ""}`}
                            style={{
                                height: `${rail.metrics.thumbHeight}px`,
                                transform: `translateY(${rail.metrics.thumbTop}px)`,
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
    );
}
