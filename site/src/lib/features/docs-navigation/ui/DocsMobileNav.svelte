<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { Action } from "svelte/action";
    import { disconnectPointerDrag, lockBodyScroll, unlockBodyScroll } from "@/shared/lib/dom";
    import { motionApply, motionFor } from "@/shared/lib/motion";

    const SECTIONS = [
        { id: "auth", label: "Auth" },
        { id: "chat", label: "Chat" },
        { id: "messages", label: "Messages" },
        { id: "models", label: "Models" },
        { id: "other-routes", label: "More routes" },
        { id: "errors", label: "Errors" },
    ];

    let open = $state(false);
    let openedAt = 0;
    let activeId = $state("");
    let dragY = $state(0);
    let sheetEl: HTMLElement | undefined = $state();

    let dragging = false;
    let startY = 0;
    let boundMove: ((e: PointerEvent) => void) | null = null;
    let boundUp: ((e: PointerEvent) => void) | null = null;
    let observer: IntersectionObserver | null = null;

    function close(): void {
        open = false;
        unlockBodyScroll("docs-toc-open");
    }

    function toggle(): void {
        if (open) {
            // Ignore the touch ghost click that re-fires this trigger ~300ms
            // after opening (it would slam the sheet shut instantly).
            if (performance.now() - openedAt < 400) return;
            close();
        } else {
            open = true;
            openedAt = performance.now();
            lockBodyScroll("docs-toc-open");
        }
    }

    // Ignore the touch ghost click that lands on the overlay right after opening.
    function onOverlayClick(): void {
        if (performance.now() - openedAt < 400) return;
        close();
    }

    // Replaces the Vue callback-ref pattern: fires once when the sheet mounts.
    const onSheetMount: Action<HTMLElement> = (el) => {
        motionApply(el, motionFor("panel", "enter", { size: el.offsetHeight }));
    };

    function onDragStart(event: PointerEvent): void {
        const target = event.target as HTMLElement;
        if (target.closest("button:not(.docs-mobile-toc__handle), a")) return;
        event.preventDefault();
        dragging = true;
        startY = event.clientY;
        boundMove = onDragMove;
        boundUp = onDragEnd;
        document.addEventListener("pointermove", boundMove, { passive: false });
        document.addEventListener("pointerup", boundUp, { passive: false });
        document.addEventListener("pointercancel", boundUp, { passive: false });
    }

    function onDragMove(event: PointerEvent): void {
        if (!dragging) return;
        event.preventDefault();
        dragY = Math.max(0, event.clientY - startY);
    }

    function onDragEnd(): void {
        if (!dragging) return;
        dragging = false;
        disconnectPointerDrag(boundMove, boundUp);
        boundMove = boundUp = null;
        const sheet = sheetEl;
        if (!sheet) {
            dragY = 0;
            return;
        }
        if (dragY > sheet.offsetHeight * 0.3) close();
        dragY = 0;
    }

    function scrollTo(id: string): void {
        const el = document.getElementById(id);
        if (!el) return;
        close();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setTimeout(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }), 50);
    }

    function onKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape") close();
    }

    onMount(() => {
        if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) activeId = entry.target.id;
                }
            },
            { rootMargin: "-20% 0px -70% 0px" },
        );
        for (const section of SECTIONS) {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        }
    });

    onDestroy(() => {
        observer?.disconnect();
        if (open) unlockBodyScroll("docs-toc-open");
        disconnectPointerDrag(boundMove, boundUp);
    });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="docs-mobile-toc" onkeydown={onKeydown}>
    <button type="button" class="docs-mobile-toc__trigger" aria-expanded={open} aria-label="Table of contents" onclick={toggle}>
        <span class="material-symbols-outlined">toc</span>
    </button>

    {#if open}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="docs-mobile-toc__overlay" data-sound="overlay.close" onclick={onOverlayClick}></div>
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            bind:this={sheetEl}
            use:onSheetMount
            class="docs-mobile-toc__sheet"
            style={dragY > 0 ? `transform: translateY(${dragY}px); transition: none; touch-action: none;` : undefined}
            onpointerdown={onDragStart}
        >
            <div class="docs-mobile-toc__handle"></div>
            <div class="docs-mobile-toc__label">On this page</div>
            <nav class="docs-mobile-toc__links">
                {#each SECTIONS as section (section.id)}
                    <button
                        type="button"
                        class={["docs-mobile-toc__link", { "is-active": activeId === section.id }]}
                        onclick={() => scrollTo(section.id)}
                    >
                        {section.label}
                    </button>
                {/each}
            </nav>
        </div>
    {/if}
</div>
