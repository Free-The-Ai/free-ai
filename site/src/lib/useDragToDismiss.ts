import { useState, useRef, useCallback, useEffect } from "react";
import { disconnectPointerDrag } from "./domUtils";

const DISMISS_THRESHOLD = 0.3;

interface DragToDismissOptions {
    isMobile: boolean;
    onDismiss: () => void;
    threshold?: number;
}

interface DragToDismissReturn {
    dragOffset: number;
    isDragging: boolean;
    sheetRef: React.RefObject<HTMLDivElement | null>;
    onDragStart: (e: React.PointerEvent) => void;
    resetOffset: () => void;
}

export function useDragToDismiss({ isMobile, onDismiss, threshold = DISMISS_THRESHOLD }: DragToDismissOptions): DragToDismissReturn {
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
        const el = sheetRef.current;
        const thresholdPx = (el?.offsetHeight ?? 400) * threshold;
        if (dragOffsetRef.current > thresholdPx) onDismissRef.current();
        else setDragOffset(0);
    }, [threshold]);

    const onDragStart = useCallback((e: React.PointerEvent) => {
        if (!isMobileRef.current) return;
        const target = e.target as HTMLElement;
        if (target.closest("button,a,input,textarea,select,[data-base-ui-swipe-ignore]")) return;
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
        dragOffset,
        isDragging,
        sheetRef,
        onDragStart,
        resetOffset: () => { dragOffsetRef.current = 0; setDragOffset(0); },
    };
}

export default useDragToDismiss;
