/**
 * Sound engine — Web Audio API runtime.
 * Framework-agnostic. Zero dependencies.
 */

import type {
  PlaySoundOptions,
  SoundPlayback,
  SoundSource,
  SoundSynthesizer,
} from "./types";

// ── AudioContext singleton ──

let audioCtx: AudioContext | null = null;
let resumePromise: Promise<void> | null = null;
let resumed = false;

export function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContext();
    resumePromise = null;
    resumed = audioCtx.state === "running";
  }
  return audioCtx;
}

/**
 * Ensure the AudioContext is running. Must be called from a user gesture handler
 * on first interaction. Returns a promise that resolves when the context is ready.
 */
export function ensureResumed(): Promise<void> {
  if (resumed) return Promise.resolve();
  const ctx = getAudioContext();
  if (ctx.state === "running") {
    resumed = true;
    return Promise.resolve();
  }
  if (!resumePromise) {
    resumePromise = ctx.resume().then(() => { resumed = true; });
  }
  return resumePromise;
}

export function closeAudioContext(): void {
  if (audioCtx && audioCtx.state !== "closed") {
    audioCtx.close();
  }
  audioCtx = null;
  bufferCache.clear();
}

// ── Buffer cache for decoded audio ──

const bufferCache = new Map<string, AudioBuffer>();

export function clearBufferCache(): void {
  bufferCache.clear();
}

async function decodeAudioData(source: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(source);
  if (cached) return cached;

  const ctx = getAudioContext();
  let arrayBuffer: ArrayBuffer;

  if (source.startsWith("data:") || source.startsWith("blob:")) {
    const resp = await fetch(source);
    arrayBuffer = await resp.arrayBuffer();
  } else {
    const resp = await fetch(source);
    arrayBuffer = await resp.arrayBuffer();
  }

  const buffer = await ctx.decodeAudioData(arrayBuffer);
  bufferCache.set(source, buffer);
  return buffer;
}

// ── Active playback tracking (anti-overlap) ──

let activePlayback: SoundPlayback | null = null;

// ── Public API ──

function isSynthesizer(source: SoundSource): source is SoundSynthesizer {
  return typeof source === "function";
}

export function playSound(
  source: SoundSource,
  options: PlaySoundOptions = {},
): SoundPlayback | null {
  // Cancel previous sound on rapid re-trigger
  if (activePlayback) {
    activePlayback.stop();
    activePlayback = null;
  }

  const ctx = getAudioContext();

  // If AudioContext is suspended, queue playback for after resume.
  // The warmup handler (capture phase) fires before this and calls
  // ensureResumed(), so by the next microtask the context should be running.
  if (!resumed && ctx.state !== "running") {
    let stopped = false;
    const placeholder: SoundPlayback = { stop() { stopped = true; } };
    ensureResumed().then(() => {
      if (!stopped) playSoundImmediate(source, options);
    });
    return placeholder;
  }

  return playSoundImmediate(source, options);
}

function playSoundImmediate(
  source: SoundSource,
  options: PlaySoundOptions = {},
): SoundPlayback | null {
  const ctx = getAudioContext();

  if (isSynthesizer(source)) {
    const playback = source(ctx, options);
    activePlayback = playback;
    return playback;
  }

  // String source — decode and play via BufferSource
  let stopped = false;
  let sourceNode: AudioBufferSourceNode | null = null;
  let gainNode: GainNode | null = null;

  const playback: SoundPlayback = {
    stop() {
      if (stopped) return;
      stopped = true;
      try {
        sourceNode?.stop();
      } catch {
        // already stopped
      }
    },
  };

  decodeAudioData(source)
    .then((buffer) => {
      if (stopped) return;
      sourceNode = ctx.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.playbackRate.value = options.playbackRate ?? 1;

      gainNode = ctx.createGain();
      gainNode.gain.value = options.volume ?? 1;

      sourceNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      sourceNode.onended = () => {
        if (activePlayback === playback) activePlayback = null;
        options.onEnd?.();
      };

      sourceNode.start();
    })
    .catch(() => {
      // Decode failed — silent fallback
    });

  activePlayback = playback;
  return playback;
}
