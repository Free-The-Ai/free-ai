import { onMount, onCleanup } from "solid-js";

export interface DitherShaderProps {
  /** Canvas resolution width in cells */
  w?: number;
  /** Canvas resolution height in cells */
  h?: number;
  /** Noise amplitude 0..1 */
  amplitude?: number;
  /** Speed multiplier */
  speed?: number;
  /** Update interval ms */
  interval?: number;
  /** Pause when off-screen */
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

  const W = () => props.w ?? 52;
  const H = () => props.h ?? 32;
  const amp = () => props.amplitude ?? 0.3;
  const spd = () => props.speed ?? 1;
  const ivl = () => props.interval ?? 200;

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
      const time = t * 0.00025 * spd();
      const seed = Math.floor(t * 0.000001) | 0;
      const a = amp();
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w;
          const ny = y / h;

          let n = Math.sin(nx * 3.7 + time) * Math.cos(ny * 3.3 - time * 0.7);
          n += Math.sin(nx * 2.1 - ny * 2.9 + time * 0.5) * 0.5;
          n = n * a + 0.5;

          const threshold = hash(x, y, seed);
          const on = n > threshold ? 1 : 0;

          const tint = hash(y, x, seed + 1);
          const r = on ? 24 + tint * 22 : 8 + tint * 6;
          const g = on ? 12 + tint * 10 : 4 + tint * 4;
          const b = on ? 6 + tint * 5 : 2 + tint * 3;

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

    // Pause when off-screen
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
