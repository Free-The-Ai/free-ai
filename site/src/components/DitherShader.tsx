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

  const W = () => props.w ?? 48;
  const H = () => props.h ?? 30;
  const amp = () => props.amplitude ?? 0.07;
  const spd = () => props.speed ?? 1;
  const ivl = () => props.interval ?? 320;

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
      const time = t * 0.00018 * spd();
      const seed = Math.floor(t * 0.000001) | 0;
      const a = amp();
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = x / w;
          const ny = y / h;

          // Sparse starfield: no blob clustering, just random placement
          const t = hash(x, y, seed + Math.floor(time * 10));
          // Only 12% of cells lit, distributed randomly
          const on = t > 0.88 ? 1 : 0;

          if (!on) {
            const i = (y * w + x) * 4;
            d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
            continue;
          }

          // Distant star ember: very dim warm speck
          const tint = hash(y, x, seed + 1);
          const r = 20 + Math.floor(tint * 18);
          const g = 8 + Math.floor(tint * 8);
          const b = 2 + Math.floor(tint * 4);

          // 2% chance of a slightly brighter "spark" star
          const spark = tint > 0.98 ? 15 + Math.floor(hash(x + y, x, seed + 3) * 20) : 0;

          const i = (y * w + x) * 4;
          d[i] = r + spark;
          d[i + 1] = g + Math.floor(spark * 0.4);
          d[i + 2] = b + Math.floor(spark * 0.15);
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
        "image-rendering": "auto",
        "pointer-events": "none",
        opacity: 1,
      }}
    />
  );
}
