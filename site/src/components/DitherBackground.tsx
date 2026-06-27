import { onMount, onCleanup } from "solid-js";

const W = 52;
const H = 32;

// True chaotic hash — no sine gradients, just bit-mashing
function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
  h ^= h >>> 13;
  h *= 1274126177;
  h ^= h >>> 16;
  // Normalize to 0..1 with full 32-bit precision
  return (h >>> 0) / 4294967296;
}

export default function DitherBackground() {
  let canvas: HTMLCanvasElement | undefined;
  let raf: number;
  let last = 0;

  onMount(() => {
    if (!canvas || typeof window === "undefined") return;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const img = ctx.createImageData(W, H);
    const d = img.data;

    function draw(t: number) {
      const time = t * 0.0002;
      const seed = Math.floor(t * 0.000001) | 0;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const nx = x / W;
          const ny = y / H;

          // Slow organic field — large blobs
          let n = Math.sin(nx * 3.7 + time) * Math.cos(ny * 3.3 - time * 0.7);
          n += Math.sin(nx * 2.1 - ny * 2.9 + time * 0.5) * 0.5;
          n = n * 0.3 + 0.5;

          // Per-cell chaotic threshold — completely independent per pixel
          const threshold = hash(x, y, seed);
          const on = n > threshold ? 1 : 0;

          // Warm/cool per-cell tint
          const tint = hash(y, x, seed + 1);
          const r = on ? 24 + tint * 22 : 8 + tint * 6;
          const g = on ? 12 + tint * 10 : 4 + tint * 4;
          const b = on ? 6 + tint * 5 : 2 + tint * 3;

          const i = (y * W + x) * 4;
          d[i] = r;
          d[i + 1] = g;
          d[i + 2] = b;
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function loop(t: number) {
      raf = requestAnimationFrame(loop);
      if (t - last > 200) {
        last = t;
        draw(t);
      }
    }

    draw(0);
    loop(0);

    onCleanup(() => cancelAnimationFrame(raf));
  });

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        "z-index": -1,
        "image-rendering": "pixelated",
        "pointer-events": "none",
        opacity: 1,
      }}
    />
  );
}
