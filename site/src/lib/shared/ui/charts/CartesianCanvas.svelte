<script lang="ts">
    import { type ChartContextValue, useChart } from "@/shared/lib/dither/chart-context";
    import {
        backingSize,
        bloomLayerStyle,
        easeInOutCubic,
        paintColumn,
        prefersReducedMotion,
        resample,
    } from "@/shared/lib/dither/dither-paint";
    import { rgb } from "@/shared/lib/dither/palette";
    import { styleToCss } from "@/shared/lib/dom";
    import { watchDeps } from "@/shared/lib/watchDeps";

    type Star = { key: string; xi: number; depth: number; phase: number };
    type Surface = { top: number[]; floor: number[] };

    const ctx = useChart();
    let bloomEl: HTMLCanvasElement | undefined = $state();

    const backing = $derived(backingSize(ctx.plot.width, ctx.plot.height));
    const cols = $derived(backing.cols);
    const rows = $derived(backing.rows);

    // Per-series [top, floor] band resampled to the backing column count.
    const targets = $derived.by((): Record<string, Surface> => {
        const out: Record<string, Surface> = {};
        if (!ctx.ready) return out;
        const h = ctx.plot.height || 1;
        const nRows = rows;
        const nCols = cols;
        const glow = Math.max(6, Math.round(nRows * 0.16));
        const defaultKind = ctx.chartType === "line" ? "line" : "area";
        for (const key of ctx.configKeys) {
            const band = ctx.bands[key];
            if (!band) continue;
            const line = (ctx.seriesSpecs[key]?.kind ?? defaultKind) === "line";
            const top = band.map((b) => (ctx.y(b[1]) / h) * (nRows - 1));
            const floor = band.map((b, i) => (line ? Math.min(nRows - 1, top[i] + glow) : (ctx.y(b[0]) / h) * (nRows - 1)));
            out[key] = { top: resample(top, nCols), floor: resample(floor, nCols) };
        }
        return out;
    });

    // Deterministic star field — only its shape (series x column count) matters.
    const stars = $derived.by((): Star[] => {
        const out: Star[] = [];
        const per = Math.max(4, Math.round(cols / 14));
        ctx.configKeys.forEach((key, k) => {
            for (let i = 0; i < per; i++) {
                const seed = i * 67 + 13 + k * 131;
                out.push({
                    key,
                    xi: seed % Math.max(ctx.dataLength, 1),
                    depth: ((seed * 53 + 7) % 100) / 100,
                    phase: (seed * 41) % 360,
                });
            }
        });
        return out;
    });

    function startLoop(canvas: HTMLCanvasElement, bloomCanvas: HTMLCanvasElement | null, nCols: number, nRows: number): (() => void) | undefined {
        const c = canvas.getContext("2d");
        if (!c || nCols <= 0 || nRows <= 0) return undefined;
        canvas.width = nCols;
        canvas.height = nRows;

        const off = document.createElement("canvas");
        off.width = nCols;
        off.height = nRows;
        const octx = off.getContext("2d");
        if (!octx) return undefined;

        const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
        if (bloomCanvas) {
            bloomCanvas.width = nCols;
            bloomCanvas.height = nRows;
        }

        const reduce = prefersReducedMotion();
        const EASE = reduce ? 1 : 0.18;
        const animate = ctx.animate && !reduce;
        const duration = ctx.animationDuration;
        const current: Record<string, Surface> = {};

        const paintFill = (intensity: number, reveal: number) => {
            octx.clearRect(0, 0, nCols, nRows);
            const s: ChartContextValue = ctx;
            const stacked = s.stackType === "stacked" || s.stackType === "percent";
            const revealCols = Math.ceil(reveal * nCols);
            s.configKeys.forEach((key, si) => {
                const cur = current[key];
                if (!cur) return;
                const seed = s.seedOf(key);
                const variant = s.seriesSpecs[key]?.variant ?? "gradient";
                const isLine = (s.seriesSpecs[key]?.kind ?? (s.chartType === "line" ? "line" : "area")) === "line";
                const emphasis = s.selectedDataKey ?? s.focusDataKey;
                const dim = emphasis !== null && emphasis !== key ? 0.3 : 1;
                const sparse = stacked ? 0 : si * 0.14;
                for (let x = 0; x < nCols; x++) {
                    if (x > revealCols) break;
                    paintColumn(octx, x, cur.top[x] ?? 0, cur.floor[x] ?? 0, seed, {
                        variant,
                        intensity,
                        dim,
                        stacked: stacked && !isLine,
                        sparse,
                    });
                }
            });
        };

        let raf = 0;
        let tick = 0;
        let last = 0;
        let animStart = 0;
        let lastProg = -1;
        let lastRevision = ctx.revision;
        let entranceReported = !animate;
        let intensity = 0;
        let needsFill = true;
        let lastPaintSig = "";
        let lastSelected: string | null | undefined = Symbol() as never;

        const draw = (now: number) => {
            raf = requestAnimationFrame(draw);
            const s: ChartContextValue = ctx;
            if (!s.ready) return;
            if (bloomCtx) {
                const on = s.bloom !== "off" && (!s.bloomOnHover || s.isMouseInChart || s.hovered);
                if (on) {
                    bloomCtx.clearRect(0, 0, nCols, nRows);
                    bloomCtx.drawImage(canvas, 0, 0);
                }
            }
            const tgt = targets;
            if (s.revision !== lastRevision) {
                lastRevision = s.revision;
                animStart = 0;
                lastProg = -1;
                entranceReported = false;
            }
            if (!animStart) animStart = now;
            const prog = animate ? Math.min(1, (now - animStart) / duration) : 1;
            const progChanged = prog !== lastProg;
            if (prog >= 1 && !entranceReported) {
                entranceReported = true;
                s.markEntranceDone();
            }

            let moving = false;
            for (const key of s.configKeys) {
                const t = tgt[key];
                if (!t) continue;
                const cur = current[key];
                if (!cur || cur.top.length !== nCols) {
                    current[key] = { top: t.top.slice(), floor: t.floor.slice() };
                    needsFill = true;
                    continue;
                }
                for (let x = 0; x < nCols; x++) {
                    const dt = t.top[x] - cur.top[x];
                    const df = t.floor[x] - cur.floor[x];
                    if (Math.abs(dt) > 0.01 || Math.abs(df) > 0.01) {
                        cur.top[x] += dt * EASE;
                        cur.floor[x] += df * EASE;
                        moving = true;
                    } else {
                        cur.top[x] = t.top[x];
                        cur.floor[x] = t.floor[x];
                    }
                }
            }
            for (const key of Object.keys(current)) {
                if (!tgt[key]) {
                    delete current[key];
                    needsFill = true;
                }
            }
            if (moving) needsFill = true;
            const emphasisNow = s.selectedDataKey ?? s.focusDataKey;
            if (emphasisNow !== lastSelected) {
                lastSelected = emphasisNow;
                needsFill = true;
            }

            const itTarget = s.isMouseInChart || s.hovered ? 1 : 0;
            let settling = false;
            if (Math.abs(intensity - itTarget) > 0.001) {
                intensity += (itTarget - intensity) * 0.16;
                settling = true;
                needsFill = true;
            } else intensity = itTarget;

            const marker = s.hoverIndex != null ? s.hoverIndex : s.markerIndex;
            const winkDue = !reduce && now - last >= 100;
            const paintSig = `${s.stackType}|${s.configKeys.map((k) => s.seriesSpecs[k]?.variant ?? "").join(",")}`;
            const sigChanged = paintSig !== lastPaintSig;
            if (sigChanged) {
                lastPaintSig = paintSig;
                needsFill = true;
            }
            if (!(moving || settling || winkDue || marker != null || progChanged || sigChanged)) return;
            if (progChanged) {
                lastProg = prog;
                needsFill = true;
            }
            if (winkDue) {
                last = now;
                tick += 1;
            }

            const reveal = animate ? easeInOutCubic(prog) : 1;
            const revealCols = reveal * nCols;

            if (needsFill) {
                paintFill(intensity, reveal);
                needsFill = false;
            }
            c.clearRect(0, 0, nCols, nRows);
            c.drawImage(off, 0, 0);

            const mx = marker != null && s.dataLength > 1 ? Math.round((marker / (s.dataLength - 1)) * (nCols - 1)) : -1;
            if (mx >= 0 && mx <= revealCols) {
                for (const key of s.configKeys) {
                    const cur = current[key];
                    if (!cur) continue;
                    const seed = s.seedOf(key);
                    const my = Math.round(cur.top[mx] ?? 0);
                    c.fillStyle = rgb(seed.fill, 1, 0.55);
                    for (let yy = my; yy < nRows; yy++) c.fillRect(mx, yy, 1, 1);
                    c.fillStyle = rgb(seed.fill);
                    c.fillRect(mx - 1, my - 1, 3, 3);
                }
            }

            for (const star of stars) {
                const cur = current[star.key];
                if (!cur) continue;
                const sx = Math.round((star.xi / Math.max(s.dataLength - 1, 1)) * (nCols - 1));
                if (sx > revealCols) continue;
                const top = cur.top[sx] ?? 0;
                const floor = cur.floor[sx] ?? nRows - 1;
                const sy = Math.round(top + star.depth * (floor - top));
                const tw = reduce ? 0.85 : (Math.sin((tick + star.phase) * 0.35) + 1) / 2;
                const lift = tw * (0.7 + 0.3 * intensity);
                if (lift < 0.55 || sy < 0 || sy >= nRows) continue;
                const starColor = s.seedOf(star.key).fill;
                c.fillStyle = rgb(starColor, 1, lift);
                c.fillRect(sx, sy, 1, 1);
                if (tw > 0.9) {
                    c.fillStyle = rgb(starColor, 1, lift * 0.6 * (tw - 0.9) * 10);
                    c.fillRect(sx - 1, sy, 1, 1);
                    c.fillRect(sx + 1, sy, 1, 1);
                    c.fillRect(sx, sy - 1, 1, 1);
                    c.fillRect(sx, sy + 1, 1, 1);
                }
            }
        };

        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }

    let stop: (() => void) | undefined;
    const restartLoop = watchDeps((deps) => {
        stop?.();
        const canvas = deps[0] as HTMLCanvasElement | undefined;
        if (!canvas) return;
        stop = startLoop(canvas, bloomEl ?? null, cols, rows);
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
        const active = ctx.bloomOnHover ? ctx.isMouseInChart || ctx.hovered : true;
        const bloom = bloomLayerStyle(ctx.bloom, active);
        return styleToCss({ ...posStyle, transition: "opacity 220ms ease", ...(bloom ?? { opacity: 0 }) });
    });

    let canvasEl: HTMLCanvasElement | undefined = $state();
</script>

<canvas bind:this={canvasEl} class="dk-canvas" style={crispStyle} use:restartLoop={[canvasEl, cols, rows]}></canvas>
<canvas bind:this={bloomEl} class="dk-canvas" style={bloomStyle}></canvas>

<style>
    .dk-canvas {
        pointer-events: none;
    }
</style>
