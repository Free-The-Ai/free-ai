<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Action } from "svelte/action";
    import { rgb } from "@/shared/lib/dither/palette";
    import {
        BAYER4,
        clamp01,
        fillOf,
        type PixelBloom,
        type PixelColor,
        pixelBloomStyle,
        pixelPrefersReducedMotion,
    } from "@/shared/lib/dither/pixel";
    import { styleToCss } from "@/shared/lib/dom";

    const CELL = 2; // css px per dither cell - same chunk as the charts

    type ButtonVariant = "gradient" | "dotted" | "hatched" | "solid";

    let {
        color = "blue",
        variant = "gradient",
        bloom = "off",
        size = "md",
        href,
        to,
        children,
        ...rest
    }: {
        color?: PixelColor;
        variant?: ButtonVariant;
        bloom?: PixelBloom;
        size?: "sm" | "md" | "lg";
        href?: string;
        to?: string;
        children?: Snippet;
        [key: string]: unknown;
    } = $props();

    // Render the semantically correct element: an internal link for SvelteKit
    // navigation (plain <a href> — SvelteKit intercepts same-origin anchors),
    // an anchor for external links, a native button otherwise.
    const tag = $derived(to != null ? "a" : href != null ? "a" : "button");
    const linkHref = $derived(to ?? href);
    const bloomStyle = $derived(styleToCss(pixelBloomStyle(bloom) ?? undefined));

    let canvasEl: HTMLCanvasElement | undefined = $state();
    let bloomEl: HTMLCanvasElement | undefined = $state();

    // Paints the ordered-dither fill onto the canvas and reacts to hover/press
    // via pointer events on the host element. Attached to the root element
    // (button/a) via `use:`; its update() handler repaints when color/variant
    // change without tearing down the listeners.
    const ditherFill: Action<HTMLElement, { color: PixelColor; variant: ButtonVariant }> = (el, params) => {
        const canvas = canvasEl;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return {};
        const bloomCanvas = bloomEl ?? null;
        const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
        let fill = fillOf(params.color);
        let variantValue = params.variant;
        const reduce = pixelPrefersReducedMotion();

        let cols = 0;
        let rows = 0;
        let intensity = 0;
        let target = 0;
        let hovered = false;
        let raf = 0;

        const paint = () => {
            ctx.clearRect(0, 0, cols, rows);
            const bias = variantValue === "dotted" ? 0.12 : 0;
            for (let y = 0; y < rows; y++) {
                const density =
                    variantValue === "gradient"
                        ? 0.25 + 0.75 * ((y + 0.5) / rows)
                        : variantValue === "dotted"
                          ? 0.5
                          : 0.75;
                for (let x = 0; x < cols; x++) {
                    if (variantValue === "hatched" && ((x + y) & 3) >= 2) continue;
                    const lit = variantValue === "solid" || density > BAYER4[y & 3][x & 3] - 0.1 * intensity - bias;
                    if (variantValue === "dotted" && !lit) continue;
                    const k = (0.3 + density * 0.7) * (1 + 0.22 * intensity);
                    ctx.fillStyle = rgb(fill, 1, clamp01(lit ? k : k * 0.4));
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            ctx.fillStyle = rgb(fill, 1, clamp01(0.5 + 0.25 * intensity));
            ctx.fillRect(0, 0, cols, 1);
            ctx.fillRect(0, rows - 1, cols, 1);
            ctx.fillRect(0, 0, 1, rows);
            ctx.fillRect(cols - 1, 0, 1, rows);
            if (bloomCtx && bloomCanvas) {
                bloomCtx.clearRect(0, 0, cols, rows);
                bloomCtx.drawImage(canvas, 0, 0);
            }
        };

        const tick = () => {
            const d = target - intensity;
            if (Math.abs(d) < 0.01) {
                intensity = target;
                paint();
                raf = 0;
                return;
            }
            intensity += d * 0.16;
            paint();
            raf = requestAnimationFrame(tick);
        };
        const setTarget = (t: number) => {
            target = t;
            if (reduce) {
                intensity = t;
                paint();
            } else if (!raf) {
                raf = requestAnimationFrame(tick);
            }
        };
        const resize = (entry: ResizeObserverEntry) => {
            const box = entry.borderBoxSize[0];
            const nextCols = Math.max(4, Math.round((box?.inlineSize ?? entry.contentRect.width) / CELL));
            const nextRows = Math.max(4, Math.round((box?.blockSize ?? entry.contentRect.height) / CELL));
            if (nextCols === cols && nextRows === rows) return;
            cols = nextCols;
            rows = nextRows;
            canvas.width = cols;
            canvas.height = rows;
            if (bloomCanvas) {
                bloomCanvas.width = cols;
                bloomCanvas.height = rows;
            }
            paint();
        };

        const enter = () => {
            hovered = true;
            setTarget(1);
        };
        const leave = () => {
            hovered = false;
            setTarget(0);
        };
        const down = () => setTarget(1.5);
        const up = () => setTarget(hovered ? 1 : 0);
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);

        const ro = new ResizeObserver(([entry]) => resize(entry));
        ro.observe(el);

        return {
            update(next) {
                fill = fillOf(next.color);
                variantValue = next.variant;
                paint();
            },
            destroy() {
                if (raf) cancelAnimationFrame(raf);
                el.removeEventListener("pointerenter", enter);
                el.removeEventListener("pointerleave", leave);
                el.removeEventListener("pointerdown", down);
                el.removeEventListener("pointerup", up);
                el.removeEventListener("pointercancel", up);
                ro.disconnect();
            },
        };
    };
</script>

<svelte:element
    this={tag}
    {...rest}
    class="kb-dither-button"
    data-size={size}
    type={tag === "button" ? "button" : undefined}
    href={tag === "a" ? linkHref : undefined}
    use:ditherFill={{ color, variant }}
>
    <canvas bind:this={canvasEl} aria-hidden="true" class="kb-dither-canvas" style="image-rendering: pixelated"></canvas>
    {#if bloomStyle}
        <canvas bind:this={bloomEl} aria-hidden="true" class="kb-dither-canvas kb-dither-noptr" style={bloomStyle}></canvas>
    {/if}
    <span class="kb-dither-label">{@render children?.()}</span>
</svelte:element>

<style>
    .kb-dither-button {
        position: relative;
        isolation: isolate;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border: 0;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-family: var(--font-mono, ui-monospace, monospace);
        font-size: 0.75rem;
        color: var(--text, currentColor);
        text-decoration: none;
        background: transparent;
        cursor: pointer;
        transition: opacity 0.15s ease;
    }
    .kb-dither-button[data-size="sm"] {
        padding: 0.35rem 0.7rem;
        font-size: 0.72rem;
    }
    .kb-dither-button[data-size="lg"] {
        padding: 0.72rem 1.25rem;
        font-size: 0.95rem;
        border-radius: 0.5rem;
    }
    .kb-dither-button:focus-visible {
        outline: none;
        box-shadow: 0 0 0 1px color-mix(in srgb, currentColor 40%, transparent);
    }
    .kb-dither-button:is(:disabled, [aria-disabled="true"]) {
        pointer-events: none;
        opacity: 0.4;
    }
    .kb-dither-canvas {
        position: absolute;
        inset: 0;
        z-index: -1;
        height: 100%;
        width: 100%;
    }
    .kb-dither-noptr {
        pointer-events: none;
    }
    .kb-dither-label {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 0.4em;
        /* Keep the label legible over the dither fill on any variant/colour. */
        text-shadow: 0 1px 2px rgb(0 0 0 / 0.55);
    }
</style>
