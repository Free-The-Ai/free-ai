<script lang="ts">
    import type { Action } from "svelte/action";
    import { rgb } from "@/shared/lib/dither/palette";
    import {
        BAYER4,
        clamp01,
        fnv1a,
        hueFill,
        type PixelBloom,
        pixelBloomStyle,
        pixelPrefersReducedMotion,
        xorshift32,
    } from "@/shared/lib/dither/pixel";
    import { styleToCss } from "@/shared/lib/dom";

    // 8x8 cells, mirrored across one axis -> 32 free pattern bits. With the mirror
    // axis bit and 180 hues that's 2^33 x 180 ~= 1.5 trillion distinct avatars.
    const GRID = 8;
    const CELL_PX = 4; // backing px per cell -> a 32x32 canvas, scaled up pixelated

    type AvatarMirror = "auto" | "horizontal" | "vertical";

    let {
        name,
        hue,
        mirror = "auto",
        size,
        bloom = "off",
        animate = true,
        animationDuration = 600,
        replayToken = 0,
        class: className = "",
    }: {
        name: string;
        hue?: number;
        mirror?: AvatarMirror;
        size?: number;
        bloom?: PixelBloom;
        animate?: boolean;
        animationDuration?: number;
        replayToken?: number;
        class?: string;
    } = $props();

    type AvatarModel = {
        on: boolean[]; // GRID x GRID, row-major
        density: number[]; // per-cell dither density for on cells
        fill: [number, number, number];
    };

    /**
     * Derive the full 8x8 cell grid from the name: 32 pattern bits + the mirror
     * axis + the hue + per-cell densities, all from one deterministic PRNG stream.
     */
    function avatarModel(nameValue: string, hueProp: number | undefined, mirrorProp: AvatarMirror): AvatarModel {
        const rand = xorshift32(fnv1a(nameValue));
        const bits = Array.from({ length: 32 }, () => rand() < 0.5);
        const drawnVertical = rand() < 0.5;
        const drawnHue = Math.floor(rand() * 180) * 2;
        const halfDensity = Array.from({ length: 32 }, () => 0.55 + rand() * 0.45);

        const vertical = mirrorProp === "auto" ? drawnVertical : mirrorProp === "vertical";
        const hueValue = hueProp ?? drawnHue;

        const on = new Array<boolean>(GRID * GRID);
        const density = new Array<number>(GRID * GRID);
        for (let r = 0; r < GRID; r++) {
            for (let c = 0; c < GRID; c++) {
                // Fold across the chosen axis: left/right symmetric or top/bottom.
                const i = vertical ? Math.min(r, GRID - 1 - r) * GRID + c : r * (GRID / 2) + Math.min(c, GRID - 1 - c);
                on[r * GRID + c] = bits[i];
                density[r * GRID + c] = halfDensity[i];
            }
        }
        return { on, density, fill: hueFill(hueValue) };
    }

    let canvasEl: HTMLCanvasElement | undefined = $state();
    let bloomEl: HTMLCanvasElement | undefined = $state();

    type AvatarParams = {
        name: string;
        hue?: number;
        mirror: AvatarMirror;
        animate: boolean;
        animationDuration: number;
        replayToken: number;
        bloom: PixelBloom;
    };

    // Paints on mount and repaints on every relevant prop change via the
    // action's update() hook — replaces the previous onMounted + watch pair.
    const paintAvatar: Action<HTMLElement, AvatarParams> = (_el, params) => {
        let raf = 0;

        const repaint = (p: AvatarParams): void => {
            const canvas = canvasEl;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            if (raf) cancelAnimationFrame(raf);

            const model = avatarModel(p.name, p.hue, p.mirror);
            const px = GRID * CELL_PX;
            canvas.width = px;
            canvas.height = px;
            const bloomCanvas = bloomEl;
            const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
            if (bloomCanvas) {
                bloomCanvas.width = px;
                bloomCanvas.height = px;
            }

            const draw = (progress: number) => {
                ctx.clearRect(0, 0, px, px);
                for (let r = 0; r < GRID; r++) {
                    for (let c = 0; c < GRID; c++) {
                        if (!model.on[r * GRID + c]) continue;
                        // Cells materialize in Bayer order.
                        const start = BAYER4[r % 4][c % 4] * 0.7;
                        const cellAlpha = clamp01((progress - start) / 0.3);
                        if (cellAlpha <= 0) continue;
                        const density = model.density[r * GRID + c];
                        const base = 0.35 + 0.65 * density;
                        for (let py = 0; py < CELL_PX; py++) {
                            for (let pxi = 0; pxi < CELL_PX; pxi++) {
                                const gx = c * CELL_PX + pxi;
                                const gy = r * CELL_PX + py;
                                const lit = density > BAYER4[gy & 3][gx & 3];
                                const alpha = (lit ? base : base * 0.35) * cellAlpha;
                                ctx.fillStyle = rgb(model.fill, 1, alpha);
                                ctx.fillRect(gx, gy, 1, 1);
                            }
                        }
                    }
                }
                if (bloomCtx) {
                    bloomCtx.clearRect(0, 0, px, px);
                    bloomCtx.drawImage(canvas, 0, 0);
                }
            };

            if (!p.animate || pixelPrefersReducedMotion()) {
                draw(1);
                return;
            }

            const startTime = performance.now();
            const tick = (now: number) => {
                const t = clamp01((now - startTime) / p.animationDuration);
                draw(1 - (1 - t) ** 3);
                if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };

        repaint(params);

        return {
            update(next) {
                repaint(next);
            },
            destroy() {
                if (raf) cancelAnimationFrame(raf);
            },
        };
    };

    const hostStyle = $derived(size != null ? styleToCss({ width: `${size}px`, height: `${size}px` }) : undefined);
    const bloomStyle = $derived(styleToCss(pixelBloomStyle(bloom) ?? undefined));
</script>

<div
    role="img"
    aria-label={`${name} avatar`}
    class="kb-dither-avatar"
    style={hostStyle}
    use:paintAvatar={{ name, hue, mirror, animate, animationDuration, replayToken, bloom }}
>
    <canvas bind:this={canvasEl} class="kb-dither-layer" style="image-rendering: pixelated"></canvas>
    {#if bloomStyle}
        <canvas bind:this={bloomEl} class="kb-dither-layer kb-dither-noptr" style={bloomStyle}></canvas>
    {/if}
</div>

<style>
    .kb-dither-avatar {
        position: relative;
    }
    .kb-dither-layer {
        position: absolute;
        inset: 0;
        height: 100%;
        width: 100%;
    }
    .kb-dither-noptr {
        pointer-events: none;
    }
</style>
