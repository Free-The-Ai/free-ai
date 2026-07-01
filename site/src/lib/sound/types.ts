/**
 * Sound system types — semantic audio feedback for UI interactions.
 * Ported from sensory-ui for Solid.js + Kobalte.
 */

// ── Categories & Roles ──

export type SoundCategory =
  | "interaction"
  | "overlay"
  | "navigation"
  | "notification"
  | "hero";

export type SoundRole =
  | "interaction.tap"
  | "interaction.subtle"
  | "interaction.toggle"
  | "interaction.confirm"
  | "interaction.typing"
  | "overlay.open"
  | "overlay.close"
  | "overlay.expand"
  | "overlay.collapse"
  | "navigation.forward"
  | "navigation.backward"
  | "navigation.tab"
  | "navigation.scroll"
  | "notification.info"
  | "notification.success"
  | "notification.warning"
  | "notification.error"
  | "hero.complete"
  | "hero.milestone";

export const ALL_SOUND_ROLES: SoundRole[] = [
  "interaction.tap",
  "interaction.subtle",
  "interaction.toggle",
  "interaction.confirm",
  "interaction.typing",
  "overlay.open",
  "overlay.close",
  "overlay.expand",
  "overlay.collapse",
  "navigation.forward",
  "navigation.backward",
  "navigation.tab",
  "navigation.scroll",
  "notification.info",
  "notification.success",
  "notification.warning",
  "notification.error",
  "hero.complete",
  "hero.milestone",
];



// ── Sound Packs ──

export type SoundPackName =
  | "soft"
  | "aero"
  | "arcade"
  | "organic"
  | "glass"
  | "industrial"
  | "minimal"
  | "retro"
  | "crisp";

// ── Oscillator & Instruments ──

export type OscillatorWaveform = "sine" | "square" | "sawtooth" | "triangle";

export interface InstrumentConfig {
  oscType: OscillatorWaveform;
  filterFreq: number;
  q: number;
  decayMult: number;
  gainMult: number;
  pitchMult: number;
}

// ── Tunes ──

export type TuneType =
  | "click"
  | "pop"
  | "toggle"
  | "tick"
  | "sweep"
  | "rise"
  | "drop"
  | "chime"
  | "arpeggio";

export interface BaseTune {
  type: TuneType;
  duration: number;
  frequency?: number;
  endFrequency?: number;
  notes?: number[];
  noteDuration?: number;
  noteGap?: number;
  filterFreq?: number;
  filterQ?: number;
  volume?: number;
  attack?: number;
  decay?: number;
  harmonics?: boolean;
  harmonicRatio?: number;
  harmonicVolume?: number;
  modFreq?: number;
  modDepth?: number;
  pulseCount?: number;
  meta?: Record<string, unknown>;
}

// ── Playback ──

export interface PlaySoundOptions {
  volume?: number;
  playbackRate?: number;
  onEnd?: () => void;
}

export interface SoundPlayback {
  stop: () => void;
}

export type SoundSynthesizer = (
  ctx: AudioContext,
  options: PlaySoundOptions,
) => SoundPlayback;

export type SoundPack = Record<SoundRole, SoundSynthesizer>;

// ── Config ──

export interface SensoryConfig {
  enabled: boolean;
  volume: number;
  theme: SoundPackName | (string & {});
  categories: Record<SoundCategory, boolean>;
  reducedMotion: "inherit" | "force-off" | "force-on";
}
