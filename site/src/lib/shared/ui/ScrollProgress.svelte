<script lang="ts">
    // Port of Skiper UI's scroll progress ring (skiper89): a circular gauge
    // that fills as the page scrolls. rAF-throttled scroll listener drives a
    // stroke-dashoffset; decorative, desktop-only (hidden via CSS on small
    // screens where the mobile FAB cluster owns the corner).
    import { onMount } from "svelte";

    const R = 18;
    const CIRCUMFERENCE = 2 * Math.PI * R;
    let progress = $state(0);

    onMount(() => {
        let ticking = false;
        function update(): void {
            ticking = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        }
        function onScroll(): void {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    });
</script>

<div class="scroll-progress" aria-hidden="true">
    <svg viewBox="0 0 48 48">
        <circle class="scroll-progress-track" cx="24" cy="24" r={R} />
        <circle
            class="scroll-progress-fill"
            cx="24"
            cy="24"
            r={R}
            style:stroke-dasharray={CIRCUMFERENCE}
            style:stroke-dashoffset={CIRCUMFERENCE * (1 - progress)} />
    </svg>
</div>

<style>
    .scroll-progress {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 40;
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: color-mix(in oklch, var(--bg) 72%, transparent);
        backdrop-filter: blur(8px);
    }
    .scroll-progress svg {
        width: 34px;
        height: 34px;
        transform: rotate(-90deg);
    }
    .scroll-progress-track,
    .scroll-progress-fill {
        fill: none;
        stroke-width: 3;
    }
    .scroll-progress-track {
        stroke: oklch(1 0 0 / 0.12);
    }
    .scroll-progress-fill {
        stroke: var(--text);
        stroke-linecap: round;
        transition: stroke-dashoffset 80ms linear;
    }
    @media (max-width: 900px) {
        .scroll-progress {
            display: none;
        }
    }
</style>
