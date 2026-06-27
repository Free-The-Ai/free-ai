import { onMount, onCleanup } from "solid-js";

// 4x4 Bayer ordered dither matrix
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const W = 128;
const H = 80;

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
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const nx = x / W;
          const ny = y / H;

          // Very subtle organic drift — two slow octaves
          let n = Math.sin(nx * 6 + time) * Math.cos(ny * 6 - time * 0.7);
          n += Math.sin(nx * 3 - ny * 4 + time * 0.3) * 0.5;
          n = n * 0.08 + 0.5; // tiny amplitude

          // Bayer threshold
          const threshold = BAYER[y % 4][x % 4] / 16;
          const on = n > threshold ? 1 : 0;

          // Subtle warm accent drift — barely visible
          const drift = Math.sin(nx * 2 - time * 0.2) * 1.5;
          const r = on ? 14 + drift : 12;
          const g = on ? 11 + drift * 0.6 : 10;
          const b = on ? 8 + drift * 0.4 : 7;

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
      if (t - last > 300) {
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
        opacity: 0.6,
      }}
    />
  );
}
