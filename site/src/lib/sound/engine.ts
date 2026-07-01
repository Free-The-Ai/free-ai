/**
 * Sound engine — Web Audio API runtime.
 * Framework-agnostic. Zero dependencies.
 */

import type {
  PlaySoundOptions,
  SoundPlayback,
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
}

// ── Active playback tracking (anti-overlap) ──

let activePlayback: SoundPlayback | null = null;

// ── Public API ──

export function playSound(
  source: SoundSynthesizer,
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
  source: SoundSynthesizer,
  options: PlaySoundOptions = {},
): SoundPlayback | null {
  const ctx = getAudioContext();
  const playback = source(ctx, options);
  activePlayback = playback;
  return playback;
}
