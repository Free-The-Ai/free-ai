<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { rgb } from "@/shared/lib/dither/palette";
import {
    BAYER4,
    fillOf,
    type PixelBloom,
    type PixelColor,
    pixelBloomStyle,
} from "@/shared/lib/dither/pixel";

// Backing-resolution caps - a background wash never needs more cells than this.
const MAX_COLS = 960;
const MAX_ROWS = 600;

type GradientDirection = "up" | "down" | "left" | "right";

const props = withDefaults(
    defineProps<{
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
    }>(),
    { to: "transparent", direction: "up", cell: 3, opacity: 1, bloom: "off" },
);

const wrapRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const bloomRef = ref<HTMLCanvasElement | null>(null);

let width = 0;
let height = 0;

/** Paint the ordered-dither ramp at the last observed size. */
function paint(): void {
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || width <= 0 || height <= 0) return;

    const cols = Math.min(MAX_COLS, Math.max(4, Math.round(width / props.cell)));
    const rows = Math.min(MAX_ROWS, Math.max(4, Math.round(height / props.cell)));
    canvas.width = cols;
    canvas.height = rows;
    const fromFill = fillOf(props.from);
    const toFill = props.to === "transparent" ? null : fillOf(props.to);
    const o = props.opacity;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // t runs 0 at the `from` edge -> 1 at the `to` edge.
            const t =
                props.direction === "up"
                    ? 1 - (y + 0.5) / rows
                    : props.direction === "down"
                        ? (y + 0.5) / rows
                        : props.direction === "left"
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

    const bloomCanvas = bloomRef.value;
    const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
    if (bloomCanvas && bloomCtx) {
        bloomCanvas.width = cols;
        bloomCanvas.height = rows;
        bloomCtx.drawImage(canvas, 0, 0);
    }
}

let ro: ResizeObserver | null = null;

onMounted(() => {
    if (typeof ResizeObserver === "undefined") return;
    ro = new ResizeObserver(([entry]) => {
        const box = entry.borderBoxSize[0];
        width = box?.inlineSize ?? entry.contentRect.width;
        height = box?.blockSize ?? entry.contentRect.height;
        paint();
    });
    if (wrapRef.value) ro.observe(wrapRef.value);
});

onBeforeUnmount(() => ro?.disconnect());

watch(
    () => [props.from, props.to, props.direction, props.cell, props.opacity, props.bloom],
    () => paint(),
);
</script>

<template>
    <div ref="wrapRef" aria-hidden="true" class="kb-dither-gradient">
        <canvas ref="canvasRef" class="kb-dither-layer" style="image-rendering: pixelated" />
        <canvas
            v-if="pixelBloomStyle(bloom)"
            ref="bloomRef"
            class="kb-dither-layer"
            :style="pixelBloomStyle(bloom)!"
        />
    </div>
</template>

<style scoped>
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
