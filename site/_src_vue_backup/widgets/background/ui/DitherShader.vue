<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        amplitude?: number;
        speed?: number;
        interval?: number;
        pauseWhenOffscreen?: boolean;
        cellSize?: number;
    }>(),
    { amplitude: 0.32, speed: 1, interval: 200, pauseWhenOffscreen: true, cellSize: 16 },
);

const canvasEl = ref<HTMLCanvasElement | null>(null);

const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 frag;
uniform vec2 u_res;
uniform float u_time;
uniform float u_amp;
uniform float u_seed;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  vec2 uv = v_uv;
  vec2 px = uv * u_res;

  float t = u_time;
  float n = sin(uv.x * 3.7 + t) * cos(uv.y * 3.3 - t * 0.7);
  n += sin(uv.x * 2.1 - uv.y * 2.9 + t * 0.5) * 0.5;
  n = n * u_amp + 0.5;

  float threshold = hash(floor(px) + u_seed);
  if (n <= threshold) {
    frag = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float tint = hash(floor(px).yx + u_seed + 1.0);
  float intensity = 0.5 + tint * 0.5;
  float sparkle = tint > 0.94
    ? 20.0 + hash(floor(px) + u_seed + 3.0) * 35.0
    : 0.0;

  float r = min(255.0, (65.0 + tint * 30.0) * intensity + sparkle);
  float g = min(255.0, (26.0 + tint * 14.0) * intensity + sparkle * 0.4);
  float b = min(255.0, (6.0 + tint * 6.0) * intensity + sparkle * 0.1);
  frag = vec4(r / 255.0, g / 255.0, b / 255.0, 1.0);
}`;

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) throw new Error(`vert: ${gl.getShaderInfoLog(vs)}`);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) throw new Error(`frag: ${gl.getShaderInfoLog(fs)}`);

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(`link: ${gl.getProgramInfoLog(prog)}`);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
}

let cleanup: (() => void) | null = null;

onMounted(() => {
    const canvas = canvasEl.value;
    if (!canvas || typeof window === "undefined") return;

    const cs = props.cellSize;
    let w = Math.max(8, Math.round(window.innerWidth / cs));
    let h = Math.max(8, Math.round(window.innerHeight / cs));
    canvas.width = w;
    canvas.height = h;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) return;
    const ctx = gl;

    const prog = createProgram(gl);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u_res = gl.getUniformLocation(prog, "u_res");
    const u_time = gl.getUniformLocation(prog, "u_time");
    const u_amp = gl.getUniformLocation(prog, "u_amp");
    const u_seed = gl.getUniformLocation(prog, "u_seed");

    gl.uniform2f(u_res, w, h);
    gl.uniform1f(u_amp, props.amplitude);
    gl.viewport(0, 0, w, h);

    const resizeObserver = new ResizeObserver(([entry]) => {
        const nw = Math.max(8, Math.round(entry.contentRect.width / cs));
        const nh = Math.max(8, Math.round(entry.contentRect.height / cs));
        if (nw === w && nh === h) return;
        w = nw;
        h = nh;
        canvas.width = w;
        canvas.height = h;
        ctx.uniform2f(u_res, w, h);
        ctx.viewport(0, 0, w, h);
        render(performance.now());
    });
    resizeObserver.observe(canvas);

    let raf = 0;
    let last = 0;
    let visible = true;

    function render(t: number): void {
        const time = t * 0.00018 * props.speed;
        const seed = Math.floor(t * 0.000001);
        ctx.uniform1f(u_time, time);
        ctx.uniform1f(u_seed, seed);
        ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, 4);
    }

    function loop(t: number): void {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        if (t - last > props.interval) {
            last = t;
            render(t);
        }
    }

    render(0);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduceMotion.matches) loop(0);

    let obs: IntersectionObserver | undefined;
    if (props.pauseWhenOffscreen !== false) {
        obs = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
        obs.observe(canvas);
    }

    cleanup = () => {
        cancelAnimationFrame(raf);
        obs?.disconnect();
        resizeObserver.disconnect();
        ctx.deleteProgram(prog);
        ctx.deleteBuffer(buf);
    };
});

onBeforeUnmount(() => cleanup?.());
</script>

<template>
    <canvas ref="canvasEl" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; pointer-events: none; opacity: 1" />
</template>
