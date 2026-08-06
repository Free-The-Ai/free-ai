<script lang="ts">
    // Port of Skiper UI's TextRoll (skiper58, free registry component).
    // The text renders twice; on hover each character rolls upward with a
    // stagger, the duplicate rolling in from below. Pure CSS transitions,
    // no JS listeners. Spaces become non-breaking so they survive splitting.
    let { text, center = true }: { text: string; center?: boolean } = $props();

    const STAGGER = 0.035;
    const chars = $derived(text.replaceAll(" ", "\u00A0").split(""));

    function delay(i: number): string {
        const d = center ? STAGGER * Math.abs(i - (chars.length - 1) / 2) : STAGGER * i;
        return `${d.toFixed(3)}s`;
    }
</script>

<span class="textroll">
    <span class="textroll-layer" aria-hidden="true">
        {#each chars as ch, i (i)}
            <span class="textroll-char" style:transition-delay={delay(i)}>{ch}</span>
        {/each}
    </span>
    <span class="textroll-layer textroll-dup" aria-hidden="true">
        {#each chars as ch, i (i)}
            <span class="textroll-char" style:transition-delay={delay(i)}>{ch}</span>
        {/each}
    </span>
    <span class="sr-only">{text}</span>
</span>

<style>
    .textroll {
        position: relative;
        display: block;
        overflow: hidden;
    }
    .textroll-layer {
        display: block;
        white-space: nowrap;
    }
    .textroll-dup {
        position: absolute;
        inset: 0;
    }
    .textroll-char {
        display: inline-block;
        transition: transform 320ms var(--ease-out-smooth, ease-in-out);
        will-change: transform;
    }
    .textroll-dup .textroll-char {
        transform: translateY(110%);
    }
    :global(a:hover) > .textroll .textroll-layer:first-child .textroll-char,
    :global(button:hover) > .textroll .textroll-layer:first-child .textroll-char {
        transform: translateY(-110%);
    }
    :global(a:hover) > .textroll .textroll-dup .textroll-char,
    :global(button:hover) > .textroll .textroll-dup .textroll-char {
        transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
        .textroll-char {
            transition: none;
        }
        .textroll-dup {
            display: none;
        }
    }
</style>
