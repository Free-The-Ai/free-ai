<script lang="ts">
    import { type PolarChartContextValue, usePolarChart } from "@/shared/lib/dither/chart-context";
    import { BAYER, backingSize, bloomLayerStyle, easeInOutCubic, OFF_TIER, prefersReducedMotion } from "@/shared/lib/dither/dither-paint";
    import { rgb } from "@/shared/lib/dither/palette";
    import { distToPolygonEdge, pointInPolygon, polarX, polarY } from "@/shared/lib/dither/polar";
    import { styleToCss } from "@/shared/lib/dom";
    import { watchDeps } from "@/shared/lib/watchDeps";

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
        let needsFill = true;
        let lastPaintSig = "";
        let lastSelected: string | null | undefined = Symbol() as never;
        let lastHover: number | null | undefined = Symbol() as never;

        const fx = nCols / Math.max(width, 1);
        const fy = nRows / Math.max(height, 1);

        const buildPolys = (prog: number) => {
            const s: PolarChartContextValue = ctx;
            const radar = s.radar;
            if (!radar) return [];
            return s.configKeys.map((key) => {
                const poly: number[] = [];
                const pts: { x: number; y: number }[] = [];
                radar.axes.forEach((ax, i) => {
                    const v = Number(s.data[i]?.[key]) || 0;
                    const r = (v / radar.max) * s.outerRadius * prog;
                    const x = polarX(s.center.x, r, ax.angle);
                    const y = polarY(s.center.y, r, ax.angle);
                    poly.push(x, y);
                    pts.push({ x, y });
                });
                return { key, poly, pts };
            });
        };

        const paint = (prog: number) => {
            const s: PolarChartContextValue = ctx;
            if (!s.radar) return;
            c.clearRect(0, 0, nCols, nRows);
            const polys = buildPolys(easeInOutCubic(prog));
            const band = Math.max(s.outerRadius * 0.45, 1);

            for (let y = 0; y < nRows; y++) {
                const py = ((y + 0.5) * height) / nRows;
                for (let x = 0; x < nCols; x++) {
                    const px = ((x + 0.5) * width) / nCols;
                    let covered = false;
                    for (let pi = 0; pi < polys.length; pi++) {
                        const { key, poly } = polys[pi];
                        if (!pointInPolygon(px, py, poly)) continue;
                        const seed = s.seedOf(key);
                        const variant = s.variantOf(key);
                        const emphasis = s.selectedDataKey ?? s.focusDataKey;
                        const selDim = emphasis !== null && emphasis !== key ? 0.3 : 1;
                        const dist = distToPolygonEdge(px, py, poly);
                        if (dist < 1.4) {
                            c.fillStyle = rgb(seed.fill, 1, selDim);
                            c.fillRect(x, y, 1, 1);
                            covered = true;
                            continue;
                        }
                        const density = 1 - Math.min(1, dist / band);
                        const bias = variant === "dotted" ? 0.12 : 0;
                        const sparse = pi * 0.2;
                        if (variant === "hatched" && ((x + y) & 3) >= 2) continue;
                        const lit = variant === "solid" || density > BAYER[y & 3][x & 3] - 0.1 * intensity - bias + sparse;
                        if (!lit && (variant === "dotted" || covered)) continue;
                        const k = (0.32 + density * 0.68) * (1 + 0.22 * intensity);
                        const alpha = Math.min(1, (lit ? k : k * OFF_TIER) * selDim);
                        c.fillStyle = rgb(seed.fill, 1, alpha);
                        c.fillRect(x, y, 1, 1);
                        covered = true;
                    }
                }
            }

            for (const { key, pts } of polys) {
                const seed = s.seedOf(key);
                const emphasis = s.selectedDataKey ?? s.focusDataKey;
                const selDim = emphasis !== null && emphasis !== key ? 0.3 : 1;
                pts.forEach((p, i) => {
                    const bx = Math.round(p.x * fx);
                    const by = Math.round(p.y * fy);
                    const big = s.hoverIndex === i;
                    c.fillStyle = rgb(seed.fill, 1, selDim);
                    const sz = big ? 2 : 1;
                    c.fillRect(bx - (sz - 1), by - (sz - 1), sz * 2 - 1, sz * 2 - 1);
                });
            }
        };

        const draw = (now: number) => {
            raf = requestAnimationFrame(draw);
            const s: PolarChartContextValue = ctx;
            if (!s.ready || !s.radar) return;
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
                needsFill = true;
            }
            const itTarget = s.isMouseInChart ? 1 : 0;
            if (Math.abs(intensity - itTarget) > 0.001) {
                intensity += (itTarget - intensity) * (reduce ? 1 : 0.16);
                needsFill = true;
            } else intensity = itTarget;
            if (prog !== lastProg) {
                lastProg = prog;
                needsFill = true;
            }

            const paintSig = s.configKeys.map((k) => s.variantOf(k)).join(",");
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
