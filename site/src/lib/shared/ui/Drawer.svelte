<script lang="ts">
    import type { Snippet } from "svelte";
    import { onDestroy } from "svelte";
    import { disconnectPointerDrag, lockBodyScroll, setAppModalOpen, unlockBodyScroll } from "@/shared/lib/dom";
    import { motionApply, motionFor } from "@/shared/lib/motion";
    import { portal } from "@/shared/lib/portal";
    import { attrTransition } from "@/shared/lib/attrTransition";

    let {
        open = $bindable(false),
        label,
        title,
        popupClass,
        variant = "responsive",
        children,
    }: {
        open: boolean;
        label: string;
        title?: string;
        popupClass?: string;
        /** Selects the CSS class family already defined in app/styles/global.css. */
        variant?: "responsive" | "nav";
        children?: Snippet;
    } = $props();

    const titleId = $props.id();
    let popupEl: HTMLElement | undefined = $state();
    let dragY = $state(0);
    let dragging = false;
    let startY = 0;
    let boundMove: ((e: PointerEvent) => void) | null = null;
    let boundUp: ((e: PointerEvent) => void) | null = null;
    let previousFocus: HTMLElement | null = null;
    let ownsScrollLock = false;
    let ownsModal = false;

    const focusableSelector = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    function focusableElements(): HTMLElement[] {
        return popupEl ? [...popupEl.querySelectorAll<HTMLElement>(focusableSelector)].filter((element) => !element.hidden) : [];
    }

    function close(): void {
        open = false;
    }

    function onKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
        }
        if (event.key !== "Tab") return;
        const focusable = focusableElements();
        if (focusable.length === 0) {
            event.preventDefault();
            popupEl?.focus();
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function onHandlePointerDown(event: PointerEvent): void {
        dragging = true;
        startY = event.clientY;
        boundMove = onHandlePointerMove;
        boundUp = onHandlePointerUp;
        document.addEventListener("pointermove", boundMove, { passive: false });
        document.addEventListener("pointerup", boundUp, { passive: false });
        document.addEventListener("pointercancel", boundUp, { passive: false });
    }

    function onHandlePointerMove(event: PointerEvent): void {
        if (!dragging) return;
        event.preventDefault();
        dragY = Math.max(0, event.clientY - startY);
    }

    function onHandlePointerUp(): void {
        dragging = false;
        disconnectPointerDrag(boundMove, boundUp);
        boundMove = boundUp = null;
        if (popupEl && dragY > popupEl.offsetHeight * 0.3) close();
        dragY = 0;
    }

    function applyPanelEnterMotion(el: HTMLElement): void {
        if (el.offsetHeight) motionApply(el, motionFor("panel", "enter", { size: el.offsetHeight }));
    }

    const popupTransition = attrTransition(applyPanelEnterMotion);
    const backdropTransition = attrTransition();

    // Focus management + body scroll lock/modal-inert, mirroring the previous
    // `watch(modelValue, ..., { immediate: true })` handler. The viewport only
    // exists in the DOM while `open` is true, so its mount/destroy lifecycle
    // (via this action) corresponds exactly to the drawer opening/closing —
    // no separate prop-change watcher needed.
    function openLifecycle(_el: HTMLElement): { destroy(): void } {
        previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        lockBodyScroll("scroll-locked");
        ownsScrollLock = true;
        setAppModalOpen(true);
        ownsModal = true;
        requestAnimationFrame(() => {
            (focusableElements()[0] ?? popupEl)?.focus();
        });
        return {
            destroy() {
                if (ownsScrollLock) unlockBodyScroll("scroll-locked");
                if (ownsModal) setAppModalOpen(false);
                ownsScrollLock = ownsModal = false;
                previousFocus?.focus();
                previousFocus = null;
            },
        };
    }

    onDestroy(() => {
        disconnectPointerDrag(boundMove, boundUp);
    });
</script>

<div use:portal={"body"}>
    {#if open}
        <div
            class={`${variant}-drawer-backdrop`}
            data-sound="overlay.close"
            onclick={close}
            transition:backdropTransition
        ></div>
    {/if}
    {#if open}
        <div class={`${variant}-drawer-viewport`} onkeydown={onKeydown} use:openLifecycle>
            <div
                bind:this={popupEl}
                class={[`${variant}-drawer-popup`, popupClass]}
                role="dialog"
                aria-modal="true"
                aria-label={title ? undefined : label}
                aria-labelledby={title ? titleId : undefined}
                tabindex="-1"
                style={dragY > 0 ? `transform: translateY(${dragY}px); transition: none;` : undefined}
                transition:popupTransition
            >
                <div class={`${variant}-drawer-handle`} aria-hidden="true" onpointerdown={onHandlePointerDown}></div>
                {#if title}
                    <h2 id={titleId} class="responsive-drawer-title">{title}</h2>
                {/if}
                <div class={`${variant}-drawer-content`}>
                    {@render children?.()}
                </div>
            </div>
        </div>
    {/if}
</div>
