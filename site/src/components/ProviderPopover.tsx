import {
    Show,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
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
        disconnectPointerDrag(boundMove, boundUp);
        boundMove = boundUp = null;
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
        cleanup: () => { disconnectPointerDrag(boundMove, boundUp); },
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

// ── Popover Body sub-component ──

function ProviderPopoverBody({ provider }: { provider: () => ProviderHealth }) {
  return (
    <>
      <dl class="detail-section">
        <h4 class="detail-section-title">Reliability</h4>
        <dt>60m error rate</dt>
        <dd class={provider().error_rate_60m === 0 ? "zero" : ""}>{formatPercent(provider().error_rate_60m)}</dd>
        <dt>30m errors</dt>
        <dd>{provider().errors_30m.toLocaleString()}</dd>
        <dt>60m errors</dt>
        <dd>{provider().errors_60m.toLocaleString()}</dd>
      </dl>
      <dl class="detail-section">
        <h4 class="detail-section-title">Throughput</h4>
        <dt>60m requests</dt>
        <dd>{provider().requests_60m.toLocaleString()}</dd>
        <dt>30m successes</dt>
        <dd>{provider().successes_30m.toLocaleString()}</dd>
        <dt>60m successes</dt>
        <dd>{provider().successes_60m.toLocaleString()}</dd>
      </dl>
      <dl class="detail-section">
        <h4 class="detail-section-title">Activity</h4>
        <dt>Last success</dt>
        <dd>{formatTimestamp(provider().last_success_at)}</dd>
        <dt>Last error</dt>
        <dd class={!provider().last_error_at ? "zero" : ""}>{formatTimestamp(provider().last_error_at)}</dd>
      </dl>
      <Show when={provider().model_count > 0}>
        <a class="catalog-link" href={`/models?prefix=${provider().prefix}`}>
          View all in model catalog <span class="catalog-link-arrow">&rarr;</span>
        </a>
      </Show>
    </>
  );
}

export default function ProviderPopover(props: {
    provider: ProviderHealth;
    onClose: () => void;
}) {
    const [isMobile, setIsMobile] = createSignal(false);

    const provider = () => props.provider;
    let sheetEl: HTMLDivElement | undefined;
    const closePopover = () => {
        unlockPageScroll();
        props.onClose();
    };
    const isAffected = provider().status === "degraded" || provider().status === "down";

    /* ── Hooks ── */
    const rail = useScrollRail(provider);
    const drag = useDragToDismiss(isMobile, closePopover);

    /* ── Body scroll lock (uses shared domUtils with "popover-open" class) ── */
    const lockPageScroll = () => lockBodyScroll("popover-open");
    const unlockPageScroll = () => unlockBodyScroll("popover-open");

    onMount(() => {
        lockPageScroll();
        // Adaptive motion: compute open params from live pointer velocity + size,
        // then expose them as --motion-* CSS vars consumed by .popover.
        if (sheetEl) {
            motionApply(sheetEl, motionFor("popover", "enter", {
                size: sheetEl.offsetHeight,
            }));
        }
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
                <div
                    class="popover-backdrop"
                    onClick={closePopover}
                    data-sound="overlay.close"
                >
                    <div
                        ref={(el) => { sheetEl = el; drag.setSheetRef(el); }}
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
                                />{" "}
                                {provider().prefix}/
                            </h3>
                            <p class="popover-sub">
                                Status:{" "}
                                <strong>
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
                                <ProviderPopoverBody provider={provider} />
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


