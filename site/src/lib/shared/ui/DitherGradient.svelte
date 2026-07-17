<script lang="ts">
    import type { Action } from "svelte/action";
    import { rgb } from "@/shared/lib/dither/palette";
    import { BAYER4, fillOf, type PixelBloom, type PixelColor, pixelBloomStyle } from "@/shared/lib/dither/pixel";
    import { styleToCss } from "@/shared/lib/dom";

    // Backing-resolution caps - a background wash never needs more cells than this.
    const MAX_COLS = 960;
    const MAX_ROWS = 600;

    type GradientDirection = "up" | "down" | "left" | "right";

    let {
        from,
        to = "transparent",
        direction = "up",
        cell = 3,
        opacity = 1,
        bloom = "off",
        class: className = "",
    }: {
        /** The colour the gradient starts solid as - a palette name or a hue. */
        from: PixelColor;
        /** What it dissolves into: another colour for a two-tone dither blend,
         * or "transparent" (default) so the background shows through. */
        to?: PixelColor | "transparent";
        /** Where `to` ends up - "up" reads as a glow rising from the bottom. */
        direction?: GradientDirection;
        /** CSS px per dither cell - bigger is chunkier. */
        cell?: number;
        /** Overall opacity multiplier. */
        opacity?: number;
        /** Glow on the dither fill. */
        bloom?: PixelBloom;
        class?: string;
    } = $props();

    let canvasEl: HTMLCanvasElement | undefined = $state();
    let bloomEl: HTMLCanvasElement | undefined = $state();

    type GradientParams = {
        from: PixelColor;
        to: PixelColor | "transparent";
        direction: GradientDirection;
        cell: number;
        opacity: number;
        bloom: PixelBloom;
    };

    // Observes the host element's size and paints the ordered-dither ramp,
    // repainting whenever size or the color/direction params change. Replaces
    // the previous onMounted(ResizeObserver) + watch(paint) pair.
    const ditherWash: Action<HTMLDivElement, GradientParams> = (node, params) => {
        let width = 0;
        let height = 0;
        let current = params;

        const paint = (): void => {
            const canvas = canvasEl;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx || width <= 0 || height <= 0) return;

            const cols = Math.min(MAX_COLS, Math.max(4, Math.round(width / current.cell)));
            const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / current.cell)));
            canvas.width = cols;
            canvas.height = rows;
            const fromFill = fillOf(current.from);
            const toFill = current.to === "transparent" ? null : fillOf(current.to);
            const o = current.opacity;

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    // t runs 0 at the `from` edge -> 1 at the `to` edge.
                    const t =
                        current.direction === "up"
                            ? 1 - (y + 0.5) / rows
                            : current.direction === "down"
                              ? (y + 0.5) / rows
                              : current.direction === "left"
                                ? 1 - (x + 0.5) / cols
                                : (x + 0.5) / cols;
                    const density = 1 - t;
                    const lit = density > BAYER4[y & 3][x & 3];
                    if (toFill) {
                        // Two-tone: every cell painted, the dither decides the colour.
                        ctx.fillStyle = rgb(lit ? fromFill : toFill, 1, o);
                        ctx.fillRect(x, y, 1, 1);
                    } else {
                        // Dissolve to transparent: lit cells carry the ramp, off cells
                        // keep a faint tint that also fades, so the falloff reads smooth.
                        const alpha = (lit ? 0.35 + 0.65 * density : 0.12 * density) * o;
                        if (alpha <= 0.004) continue;
                        ctx.fillStyle = rgb(fromFill, 1, alpha);
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }

            const bloomCanvas = bloomEl;
            const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
            if (bloomCanvas && bloomCtx) {
                bloomCanvas.width = cols;
                bloomCanvas.height = rows;
                bloomCtx.drawImage(canvas, 0, 0);
            }
        };

        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(([entry]) => {
                const box = entry.borderBoxSize[0];
                width = box?.inlineSize ?? entry.contentRect.width;
                height = box?.blockSize ?? entry.contentRect.height;
                paint();
            });
            ro.observe(node);
        }

        return {
            update(next) {
                current = next;
                paint();
            },
            destroy() {
                ro?.disconnect();
            },
        };
    };

    const bloomStyle = $derived(styleToCss(pixelBloomStyle(bloom) ?? undefined));
</script>

<div aria-hidden="true" class={["kb-dither-gradient", className]} use:ditherWash={{ from, to, direction, cell, opacity, bloom }}>
    <canvas bind:this={canvasEl} class="kb-dither-layer" style="image-rendering: pixelated"></canvas>
    {#if bloomStyle}
        <canvas bind:this={bloomEl} class="kb-dither-layer" style={bloomStyle}></canvas>
    {/if}
</div>

<style>
    .kb-dither-gradient {
        pointer-events: none;
        position: absolute;
        inset: 0;
        overflow: hidden;
    }
    .kb-dither-layer {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
    }
</style>
