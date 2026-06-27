import { onMount, onCleanup } from "solid-js";

export interface DitherShaderProps {
  w?: number;
  h?: number;
  amplitude?: number;
  speed?: number;
  interval?: number;
  pauseWhenOffscreen?: boolean;
}

function hash(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
  h ^= h >>> 13;
  h *= 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export default function DitherShader(props: DitherShaderProps) {
  let canvas: HTMLCanvasElement | undefined;
  let raf: number;
  let last = 0;
  let visible = true;

  const W = () => props.w ?? 72;
  const H = () => props.h ?? 45;
  const amp = () => props.amplitude ?? 0.35;
  const spd = () => props.speed ?? 1;
  const ivl = () => props.interval ?? 220;

  onMount(() => {
    if (!canvas || typeof window === "undefined") return;

    const w = W();
    const h = H();
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const img = ctx.createImageData(w, h);
    const d = img.data;

    function draw(t: number) {
      const time = t * 0.0002 * spd();
      const seed = Math.floor(t * 0.000001) | 0;
      const a = amp();
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w;
          const ny = y / h;

          // Chaotic organic blobs
          let n = Math.sin(nx * 3.7 + time) * Math.cos(ny * 3.3 - time * 0.7);
          n += Math.sin(nx * 2.1 - ny * 2.9 + time * 0.5) * 0.5;
          n = n * a + 0.5;

          const threshold = hash(x, y, seed);
          const on = n > threshold ? 1 : 0;

          if (!on) {
            const i = (y * w + x) * 4;
            d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
            continue;
          }

          // Ember glow: bright amber/orange with variation
          const tint = hash(y, x, seed + 1);
          const intensity = 0.4 + tint * 0.6; // 0.4 to 1.0
          const sparkle = tint > 0.92 ? 40 + hash(x + y, x, seed + 3) * 60 : 0;

          const r = Math.min(255, Math.floor((55 + tint * 40) * intensity) + sparkle);
          const g = Math.min(255, Math.floor((22 + tint * 18) * intensity) + Math.floor(sparkle * 0.4));
          const b = Math.min(255, Math.floor((4 + tint * 8) * intensity) + Math.floor(sparkle * 0.1));

          const i = (y * w + x) * 4;
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
      if (!visible) return;
      if (t - last > ivl()) {
        last = t;
        draw(t);
      }
    }

    draw(0);
    loop(0);

    if (props.pauseWhenOffscreen !== false) {
      const obs = new IntersectionObserver(
        ([entry]) => { visible = entry.isIntersecting; },
        { threshold: 0 }
      );
      obs.observe(canvas);
      onCleanup(() => obs.disconnect());
    }

    onCleanup(() => cancelAnimationFrame(raf));
  });

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        "image-rendering": "pixelated",
        "pointer-events": "none",
        opacity: 1,
      }}
    />
  );
}
