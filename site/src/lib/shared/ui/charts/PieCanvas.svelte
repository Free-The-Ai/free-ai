<script lang="ts">
    import { type PolarChartContextValue, usePolarChart } from "@/shared/lib/dither/chart-context";
    import { BAYER, backingSize, bloomLayerStyle, easeInOutCubic, OFF_TIER, prefersReducedMotion } from "@/shared/lib/dither/dither-paint";
    import { rgb } from "@/shared/lib/dither/palette";
    import { sliceAtAngle } from "@/shared/lib/dither/polar";
    import { styleToCss } from "@/shared/lib/dom";
    import { watchDeps } from "@/shared/lib/watchDeps";

    const TOP = -Math.PI / 2;
    const TAU = Math.PI * 2;
    const POP = 6; // px the hovered slice bulges outward

    const ctx = usePolarChart();
    let canvasEl: HTMLCanvasElement | undefined = $state();
    let bloomEl: HTMLCanvasElement | undefined = $state();

    const backing = $derived(backingSize(ctx.plot.width, ctx.plot.height));
    const cols = $derived(backing.cols);
    const rows = $derived(backing.rows);

    function startLoop(
        canvas: HTMLCanvasElement,
        bloomCanvas: HTMLCanvasElement | null,
        nCols: number,
        nRows: number,
        width: number,
        height: number,
    ): (() => void) | undefined {
        const c = canvas.getContext("2d");
        if (!c || nCols <= 0 || nRows <= 0) return undefined;
        canvas.width = nCols;
        canvas.height = nRows;

        const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
        if (bloomCanvas) {
            bloomCanvas.width = nCols;
            bloomCanvas.height = nRows;
        }

        const reduce = prefersReducedMotion();
        const animate = ctx.animate && !reduce;
        const duration = ctx.animationDuration;
        let raf = 0;
        let animStart = 0;
        let lastProg = -1;
        let lastRevision = ctx.revision;
        let intensity = 0;
        let popEase = 0;
        let needsFill = true;
        let lastPaintSig = "";
        let lastSelected: string | null | undefined = Symbol() as never;
        let lastHover: number | null | undefined = Symbol() as never;

        const paint = (prog: number) => {
            const s: PolarChartContextValue = ctx;
            const slices = s.pie;
            if (!slices) return;
            c.clearRect(0, 0, nCols, nRows);
            const cx = s.center.x;
            const cy = s.center.y;
            const outerR = s.outerRadius;
            const innerR = s.innerRadius;
            const revealAngle = TOP + easeInOutCubic(prog) * TAU;

            for (let y = 0; y < nRows; y++) {
                const py = ((y + 0.5) * height) / nRows;
                for (let x = 0; x < nCols; x++) {
                    const px = ((x + 0.5) * width) / nCols;
                    const dx = px - cx;
                    const dy = py - cy;
                    const r = Math.hypot(dx, dy);
                    if (r < innerR) continue;
                    const angle = Math.atan2(dy, dx);
                    let na = angle;
                    while (na < TOP) na += TAU;
                    while (na >= TOP + TAU) na -= TAU;
                    if (na > revealAngle) continue;
                    const si = sliceAtAngle(slices, angle);
                    if (si < 0) continue;
                    const slice = slices[si];
                    const activeSlice = s.hoverIndex === si;
                    const localOuter = activeSlice ? outerR + POP * popEase : outerR;
                    if (r > localOuter) continue;

                    const seed = s.seedOf(slice.name);
                    const variant = s.variantOf(slice.name);
                    const emphasis = s.selectedDataKey ?? s.focusDataKey;
                    const selDim = emphasis !== null && emphasis !== slice.name ? 0.3 : 1;
                    const it = intensity + (activeSlice ? 0.4 * popEase : 0);

                    if (localOuter - r < (activeSlice ? 1.4 + popEase : 1.4)) {
                        c.fillStyle = rgb(seed.fill, 1, selDim);
                        c.fillRect(x, y, 1, 1);
                        continue;
                    }
                    const density = (r - innerR) / Math.max(localOuter - innerR, 1);
                    const bias = variant === "dotted" ? 0.12 : 0;
                    if (variant === "hatched" && ((x + y) & 3) >= 2) continue;
                    const lit = variant === "solid" || density > BAYER[y & 3][x & 3] - 0.1 * it - bias;
                    if (variant === "dotted" && !lit) continue;
                    const k = (0.35 + density * 0.65) * (1 + 0.22 * it);
                    const alpha = Math.min(1, (lit ? k : k * OFF_TIER) * selDim);
                    c.fillStyle = rgb(seed.fill, 1, alpha);
                    c.fillRect(x, y, 1, 1);
                }
            }
        };

        const draw = (now: number) => {
            raf = requestAnimationFrame(draw);
            const s: PolarChartContextValue = ctx;
            if (!s.ready || !s.pie) return;
            if (bloomCtx) {
                const on = s.bloom !== "off" && (!s.bloomOnHover || s.isMouseInChart);
                if (on) {
                    bloomCtx.clearRect(0, 0, nCols, nRows);
                    bloomCtx.drawImage(canvas, 0, 0);
                }
            }
            if (s.revision !== lastRevision) {
                lastRevision = s.revision;
                animStart = 0;
                lastProg = -1;
            }
            if (!animStart) animStart = now;
            const prog = animate ? Math.min(1, (now - animStart) / duration) : 1;

            const emphasisNow = s.selectedDataKey ?? s.focusDataKey;
            if (emphasisNow !== lastSelected) {
                lastSelected = emphasisNow;
                needsFill = true;
            }
            if (s.hoverIndex !== lastHover) {
                lastHover = s.hoverIndex;
                popEase = 0;
                needsFill = true;
            }
            const itTarget = s.isMouseInChart ? 1 : 0;
            if (Math.abs(intensity - itTarget) > 0.001) {
                intensity += (itTarget - intensity) * (reduce ? 1 : 0.16);
                needsFill = true;
            } else intensity = itTarget;
            const popTarget = s.hoverIndex != null ? 1 : 0;
            if (Math.abs(popEase - popTarget) > 0.001) {
                popEase += (popTarget - popEase) * (reduce ? 1 : 0.22);
                needsFill = true;
            } else popEase = popTarget;
            if (prog !== lastProg) {
                lastProg = prog;
                needsFill = true;
            }

            const paintSig = `${s.innerRadius}|${s.pie.map((sl) => s.variantOf(sl.name)).join(",")}`;
            if (paintSig !== lastPaintSig) {
                lastPaintSig = paintSig;
                needsFill = true;
            }
            if (!needsFill) return;
            paint(prog);
            needsFill = false;
        };

        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }

    const restartLoop = watchDeps(() => {
        const canvas = canvasEl;
        if (!canvas) return;
        return startLoop(canvas, bloomEl ?? null, cols, rows, ctx.plot.width, ctx.plot.height);
    });

    const posStyle = $derived({
        position: "absolute",
        left: `${ctx.margins.left}px`,
        top: `${ctx.margins.top}px`,
        width: `${ctx.plot.width}px`,
        height: `${ctx.plot.height}px`,
        zIndex: 1,
    });
    const crispStyle = $derived(styleToCss({ ...posStyle, imageRendering: "pixelated" }));
    const bloomStyle = $derived.by(() => {
        const bloom = bloomLayerStyle(ctx.bloom, ctx.bloomOnHover ? ctx.isMouseInChart : true);
        return styleToCss({ ...posStyle, transition: "opacity 220ms ease", ...(bloom ?? { opacity: 0 }) });
    });
</script>

<canvas bind:this={canvasEl} class="dk-canvas" style={crispStyle} use:restartLoop={[cols, rows, ctx.plot.width, ctx.plot.height]}></canvas>
<canvas bind:this={bloomEl} class="dk-canvas" style={bloomStyle}></canvas>

<style>
    .dk-canvas {
        pointer-events: none;
    }
</style>
