<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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

// 8x8 cells, mirrored across one axis -> 32 free pattern bits. With the mirror
// axis bit and 180 hues that's 2^33 x 180 ~= 1.5 trillion distinct avatars.
const GRID = 8;
const CELL_PX = 4; // backing px per cell -> a 32x32 canvas, scaled up pixelated

type AvatarMirror = "auto" | "horizontal" | "vertical";

const props = withDefaults(
    defineProps<{
        /** The seed - same name, same avatar, every time. */
        name: string;
        /** Hue override (0-360). Derived from the name when omitted. */
        hue?: number;
        /** Mirror axis. "auto" picks one from the name. */
        mirror?: AvatarMirror;
        /** Square size in px. Omit to size via CSS on the host element. */
        size?: number;
        /** Glow on the dither fill. */
        bloom?: PixelBloom;
        /** Play the Bayer-ordered materialize entrance. */
        animate?: boolean;
        animationDuration?: number;
        /** Bump to replay the entrance. */
        replayToken?: number;
    }>(),
    { mirror: "auto", bloom: "off", animate: true, animationDuration: 600, replayToken: 0 },
);

type AvatarModel = {
    on: boolean[]; // GRID x GRID, row-major
    density: number[]; // per-cell dither density for on cells
    fill: [number, number, number];
};

/**
 * Derive the full 8x8 cell grid from the name: 32 pattern bits + the mirror
 * axis + the hue + per-cell densities, all from one deterministic PRNG stream.
 */
function avatarModel(name: string, hueProp: number | undefined, mirrorProp: AvatarMirror): AvatarModel {
    const rand = xorshift32(fnv1a(name));
    const bits = Array.from({ length: 32 }, () => rand() < 0.5);
    const drawnVertical = rand() < 0.5;
    const drawnHue = Math.floor(rand() * 180) * 2;
    const halfDensity = Array.from({ length: 32 }, () => 0.55 + rand() * 0.45);

    const vertical = mirrorProp === "auto" ? drawnVertical : mirrorProp === "vertical";
    const hue = hueProp ?? drawnHue;

    const on = new Array<boolean>(GRID * GRID);
    const density = new Array<number>(GRID * GRID);
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            // Fold across the chosen axis: left/right symmetric or top/bottom.
            const i = vertical
                ? Math.min(r, GRID - 1 - r) * GRID + c
                : r * (GRID / 2) + Math.min(c, GRID - 1 - c);
            on[r * GRID + c] = bits[i];
            density[r * GRID + c] = halfDensity[i];
        }
    }
    return { on, density, fill: hueFill(hue) };
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const bloomRef = ref<HTMLCanvasElement | null>(null);
let raf = 0;

/** Paint the avatar, optionally sweeping cells in with the entrance. */
function repaint(): void {
    const canvas = canvasRef.value;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (raf) cancelAnimationFrame(raf);

    const model = avatarModel(props.name, props.hue, props.mirror);
    const px = GRID * CELL_PX;
    canvas.width = px;
    canvas.height = px;
    const bloomCanvas = bloomRef.value;
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

    if (!props.animate || pixelPrefersReducedMotion()) {
        draw(1);
        return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
        const t = clamp01((now - startTime) / props.animationDuration);
        draw(1 - (1 - t) ** 3);
        if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
}

onMounted(repaint);
onBeforeUnmount(() => raf && cancelAnimationFrame(raf));
watch(
    () => [props.name, props.hue, props.mirror, props.animate, props.animationDuration, props.replayToken, props.bloom],
    repaint,
);

const hostStyle = computed(() =>
    props.size != null ? { width: `${props.size}px`, height: `${props.size}px` } : undefined,
);
</script>

<template>
    <div role="img" :aria-label="`${name} avatar`" class="kb-dither-avatar" :style="hostStyle">
        <canvas ref="canvasRef" class="kb-dither-layer" style="image-rendering: pixelated" />
        <canvas
            v-if="pixelBloomStyle(bloom)"
            ref="bloomRef"
            class="kb-dither-layer kb-dither-noptr"
            :style="pixelBloomStyle(bloom)!"
        />
    </div>
</template>

<style scoped>
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
