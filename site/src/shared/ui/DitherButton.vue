<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
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

const CELL = 2; // css px per dither cell - same chunk as the charts

type ButtonVariant = "gradient" | "dotted" | "hatched" | "solid";

const props = withDefaults(
    defineProps<{
        /** Fill colour - a palette name or a hue (0-360). */
        color?: PixelColor;
        /** Fill texture - the same four variants the charts use. */
        variant?: ButtonVariant;
        /** Glow on the dither fill. */
        bloom?: PixelBloom;
    }>(),
    { color: "blue", variant: "gradient", bloom: "off" },
);

const buttonRef = ref<HTMLButtonElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const bloomRef = ref<HTMLCanvasElement | null>(null);

let teardown: (() => void) | null = null;

/**
 * Wire the button's dither fill: the ordered-dither texture on a low-res
 * canvas, with `intensity` (0 rest, 1 hover, ~1.5 pressed) lifting density and
 * alpha. Returns a cleanup that removes listeners and cancels the loop.
 */
function mount(): (() => void) | undefined {
    const button = buttonRef.value;
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext("2d");
    if (!button || !canvas || !ctx) return undefined;
    const bloomCanvas = bloomRef.value;
    const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
    const fill = fillOf(props.color);
    const variant = props.variant;
    const reduce = pixelPrefersReducedMotion();

    let cols = 0;
    let rows = 0;
    let intensity = 0;
    let target = 0;
    let hovered = false;
    let raf = 0;

    const paint = () => {
        ctx.clearRect(0, 0, cols, rows);
        const bias = variant === "dotted" ? 0.12 : 0;
        for (let y = 0; y < rows; y++) {
            const density =
                variant === "gradient"
                    ? 0.25 + 0.75 * ((y + 0.5) / rows)
                    : variant === "dotted"
                        ? 0.5
                        : 0.75;
            for (let x = 0; x < cols; x++) {
                if (variant === "hatched" && ((x + y) & 3) >= 2) continue;
                const lit =
                    variant === "solid" ||
                    density > BAYER4[y & 3][x & 3] - 0.1 * intensity - bias;
                if (variant === "dotted" && !lit) continue;
                const k = (0.3 + density * 0.7) * (1 + 0.22 * intensity);
                ctx.fillStyle = rgb(fill, 1, clamp01(lit ? k : k * 0.4));
                ctx.fillRect(x, y, 1, 1);
            }
        }
        // Soft outline in the fill colour, brightening a touch on hover.
        ctx.fillStyle = rgb(fill, 1, clamp01(0.5 + 0.25 * intensity));
        ctx.fillRect(0, 0, cols, 1);
        ctx.fillRect(0, rows - 1, cols, 1);
        ctx.fillRect(0, 0, 1, rows);
        ctx.fillRect(cols - 1, 0, 1, rows);
        if (bloomCtx) {
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

    const resize = () => {
        const box = button.getBoundingClientRect();
        cols = Math.max(4, Math.round(box.width / CELL));
        rows = Math.max(4, Math.round(box.height / CELL));
        canvas.width = cols;
        canvas.height = rows;
        if (bloomCanvas) {
            bloomCanvas.width = cols;
            bloomCanvas.height = rows;
        }
        paint();
    };
    resize();

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
    button.addEventListener("pointerenter", enter);
    button.addEventListener("pointerleave", leave);
    button.addEventListener("pointerdown", down);
    button.addEventListener("pointerup", up);
    button.addEventListener("pointercancel", up);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(button);

    return () => {
        if (raf) cancelAnimationFrame(raf);
        button.removeEventListener("pointerenter", enter);
        button.removeEventListener("pointerleave", leave);
        button.removeEventListener("pointerdown", down);
        button.removeEventListener("pointerup", up);
        button.removeEventListener("pointercancel", up);
        ro?.disconnect();
    };
}

function remount(): void {
    teardown?.();
    teardown = mount() ?? null;
}

onMounted(remount);
onBeforeUnmount(() => teardown?.());
watch(() => [props.color, props.variant, props.bloom], remount);
</script>

<template>
    <button ref="buttonRef" type="button" class="kb-dither-button">
        <canvas
            ref="canvasRef"
            aria-hidden="true"
            class="kb-dither-canvas"
            style="image-rendering: pixelated"
        />
        <canvas
            v-if="pixelBloomStyle(bloom)"
            ref="bloomRef"
            aria-hidden="true"
            class="kb-dither-canvas kb-dither-noptr"
            :style="pixelBloomStyle(bloom)!"
        />
        <span class="kb-dither-label"><slot /></span>
    </button>
</template>

<style scoped>
.kb-dither-button {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 0;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.75rem;
    color: var(--color-foreground, currentColor);
    background: transparent;
    cursor: pointer;
    transition: opacity 0.15s ease;
}
.kb-dither-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px color-mix(in srgb, currentColor 40%, transparent);
}
.kb-dither-button:disabled {
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
}
</style>
