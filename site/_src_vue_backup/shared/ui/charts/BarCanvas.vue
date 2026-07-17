<script setup lang="ts">
import { computed, type CSSProperties, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { type ChartContextValue, useChart } from "@/shared/lib/dither/chart-context";
import {
    backingSize,
    bloomLayerStyle,
    clamp01,
    easeOutCubic,
    paintColumn,
    prefersReducedMotion,
} from "@/shared/lib/dither/dither-paint";

type Bars = { top: number[]; base: number[] };

// Fraction of the timeline spent staggering bar starts — the rest is each bar's
// own grow window, so the rise sweeps across the chart as a wave.
const STAGGER = 0.55;

const ctx = useChart();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const bloomRef = ref<HTMLCanvasElement | null>(null);

const backing = computed(() => backingSize(ctx.plot.width, ctx.plot.height));
const cols = computed(() => backing.value.cols);
const rows = computed(() => backing.value.rows);

const targets = computed<Record<string, Bars>>(() => {
    const out: Record<string, Bars> = {};
    if (!ctx.ready) return out;
    const h = ctx.plot.height || 1;
    const nRows = rows.value;
    for (const key of ctx.configKeys) {
        const band = ctx.bands[key];
        if (!band) continue;
        out[key] = {
            top: band.map((b) => (ctx.y(b[1]) / h) * (nRows - 1)),
            base: band.map((b) => (ctx.y(b[0]) / h) * (nRows - 1)),
        };
    }
    return out;
});

function startLoop(
    canvas: HTMLCanvasElement,
    bloomCanvas: HTMLCanvasElement | null,
    nCols: number,
    nRows: number,
    width: number,
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
    const fx = nCols / Math.max(width, 1);

    const barProgress = (i: number, len: number, prog: number) => {
        if (!animate) return 1;
        const start = len > 1 ? (i / (len - 1)) * STAGGER : 0;
        return easeOutCubic(clamp01((prog - start) / (1 - STAGGER)));
    };

    const paint = (prog: number, intensity: number) => {
        const s: ChartContextValue = ctx;
        c.clearRect(0, 0, nCols, nRows);
        const stacked = s.stackType === "stacked" || s.stackType === "percent";
        const keys = s.configKeys;
        keys.forEach((key, si) => {
            const t = targets.value[key];
            if (!t) return;
            const seed = s.seedOf(key);
            const variant = s.seriesSpecs[key]?.variant ?? "gradient";
            const emphasis = s.selectedDataKey ?? s.focusDataKey;
            const selDim = emphasis !== null && emphasis !== key ? 0.3 : 1;
            for (let i = 0; i < s.dataLength; i++) {
                const bp = barProgress(i, s.dataLength, prog);
                const base = t.base[i] ?? nRows - 1;
                const top = base + ((t.top[i] ?? base) - base) * bp;
                const activeBar = s.hoverIndex === i;
                const hoverDim = s.hoverIndex != null && !activeBar && s.isMouseInChart ? 0.5 : 1;
                const slot = s.barSlot(i, si, keys.length);
                const c0 = Math.round(slot.x * fx);
                const c1 = Math.round((slot.x + slot.width) * fx);
                for (let x = c0; x < c1; x++) {
                    paintColumn(c, x, top, base, seed, {
                        variant,
                        intensity: intensity + (activeBar ? 0.4 : 0),
                        dim: selDim * hoverDim,
                        stacked,
                    });
                }
            }
        });
    };

    let raf = 0;
    let animStart = 0;
    let lastProg = -1;
    let lastRevision = ctx.revision;
    let intensity = 0;
    let needsFill = true;
    let lastPaintSig = "";
    let lastSelected: string | null | undefined = Symbol() as never;
    let lastHover: number | null | undefined = Symbol() as never;

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
        if (s.revision !== lastRevision) {
            lastRevision = s.revision;
            animStart = 0;
            lastProg = -1;
        }
        if (!animStart) animStart = now;
        const prog = animate ? Math.min(1, (now - animStart) / duration) : 1;
        if (prog !== lastProg) {
            lastProg = prog;
            needsFill = true;
        }
        const emphasisNow = s.selectedDataKey ?? s.focusDataKey;
        if (emphasisNow !== lastSelected) {
            lastSelected = emphasisNow;
            needsFill = true;
        }
        if (s.hoverIndex !== lastHover) {
            lastHover = s.hoverIndex;
            needsFill = true;
        }
        const itTarget = s.isMouseInChart || s.hovered ? 1 : 0;
        if (Math.abs(intensity - itTarget) > 0.001) {
            intensity += (itTarget - intensity) * (reduce ? 1 : 0.16);
            needsFill = true;
        } else intensity = itTarget;

        const paintSig = `${s.stackType}|${s.configKeys
            .map((k) => s.seriesSpecs[k]?.variant ?? "")
            .join(",")}`;
        if (paintSig !== lastPaintSig) {
            lastPaintSig = paintSig;
            needsFill = true;
        }
        if (!needsFill) return;
        paint(prog, intensity);
        needsFill = false;
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
}

let stop: (() => void) | undefined;
function restart(): void {
    stop?.();
    const canvas = canvasRef.value;
    if (!canvas) return;
    stop = startLoop(canvas, bloomRef.value, cols.value, rows.value, ctx.plot.width);
}
onMounted(restart);
watch([cols, rows, () => ctx.plot.width], restart);
onBeforeUnmount(() => stop?.());

const posStyle = computed<CSSProperties>(() => ({
    position: "absolute",
    left: `${ctx.margins.left}px`,
    top: `${ctx.margins.top}px`,
    width: `${ctx.plot.width}px`,
    height: `${ctx.plot.height}px`,
    zIndex: 1,
}));
const crispStyle = computed<CSSProperties>(() => ({ ...posStyle.value, imageRendering: "pixelated" }));
const bloomStyle = computed<CSSProperties>(() => {
    const active = ctx.bloomOnHover ? ctx.isMouseInChart || ctx.hovered : true;
    const bloom = bloomLayerStyle(ctx.bloom, active);
    return {
        ...posStyle.value,
        transition: "opacity 220ms ease",
        ...((bloom ?? { opacity: 0 }) as CSSProperties),
    };
});
</script>

<template>
    <canvas ref="canvasRef" class="dk-canvas" :style="crispStyle" />
    <canvas ref="bloomRef" class="dk-canvas" :style="bloomStyle" />
</template>

<style scoped>
.dk-canvas {
    pointer-events: none;
}
</style>
