/**
 * Instruments — oscillator configs + noise/envelope/filter helpers.
 * Each instrument defines a timbral character applied to all tunes.
 */

import type { InstrumentConfig, OscillatorWaveform } from "./types";

// ── 9 Built-in Instrument Presets ──

export const INSTRUMENTS: Record<string, InstrumentConfig> = {
  soft:       { oscType: "sine",      filterFreq: 2000, q: 1,  decayMult: 1.5, gainMult: 0.7,  pitchMult: 0.8  },
  aero:       { oscType: "sine",      filterFreq: 3500, q: 2,  decayMult: 1.0, gainMult: 0.9,  pitchMult: 1.0  },
  arcade:     { oscType: "square",    filterFreq: 4000, q: 8,  decayMult: 0.5, gainMult: 1.0,  pitchMult: 1.5  },
  organic:    { oscType: "triangle",  filterFreq: 2500, q: 3,  decayMult: 1.3, gainMult: 0.85, pitchMult: 0.9  },
  glass:      { oscType: "sine",      filterFreq: 6000, q: 10, decayMult: 1.2, gainMult: 0.75, pitchMult: 1.8  },
  industrial: { oscType: "sawtooth",  filterFreq: 3000, q: 12, decayMult: 0.6, gainMult: 1.0,  pitchMult: 0.7  },
  minimal:    { oscType: "sine",      filterFreq: 2000, q: 1,  decayMult: 0.8, gainMult: 0.4,  pitchMult: 1.0  },
  retro:      { oscType: "square",    filterFreq: 1500, q: 2,  decayMult: 1.1, gainMult: 0.8,  pitchMult: 0.85 },
  crisp:      { oscType: "triangle",  filterFreq: 5500, q: 4,  decayMult: 0.6, gainMult: 1.0,  pitchMult: 1.1  },
};

// ── Noise Buffer Generation ──

export function createNoiseBuffer(
  ctx: AudioContext,
  duration: number,
  type: "white" | "pink" | "brown" = "white",
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }

  return buffer;
}

export function applyDecayToBuffer(buffer: AudioBuffer, decayRate: number): void {
  const data = buffer.getChannelData(0);
  const length = data.length;
  const sampleRate = buffer.sampleRate;
  const tauSeconds = 1 / decayRate;

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    data[i] *= Math.exp(-t / tauSeconds);
  }
}

// ── Oscillator & Gain Helpers ──

export function createOscillator(
  ctx: AudioContext,
  freq: number,
  instrument: InstrumentConfig,
  detuneCents = 0,
): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = instrument.oscType;
  osc.frequency.value = freq * instrument.pitchMult;
  if (detuneCents !== 0) osc.detune.value = detuneCents;
  return osc;
}

export function createEnvelopedGain(
  ctx: AudioContext,
  time: number,
  volume: number,
  duration: number,
  instrument: InstrumentConfig,
): GainNode {
  const gain = ctx.createGain();
  const v = Math.max(0.001, volume * instrument.gainMult);
  const attack = Math.min(0.005, duration * 0.1);
  const decay = duration * instrument.decayMult;

  gain.gain.setValueAtTime(0.001, time);
  gain.gain.linearRampToValueAtTime(v, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, time + attack + decay);

  return gain;
}

export function createFilter(
  ctx: AudioContext,
  freq: number,
  q: number,
  type: BiquadFilterType = "bandpass",
): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  return filter;
}
