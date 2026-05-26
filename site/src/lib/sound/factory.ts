/**
 * Synthesizer factories — turn tunes + instruments into playable sounds.
 * 13 tune types, each returns a SoundSynthesizer function.
 */

import type {
  BaseTune,
  InstrumentConfig,
  PlaySoundOptions,
  SoundPlayback,
  SoundSynthesizer,
} from "./types";
import {
  applyDecayToBuffer,
  createEnvelopedGain,
  createFilter,
  createNoiseBuffer,
  createOscillator,
} from "./instruments";

// ── Shared helpers ──

/** Extract common params from tune, options, instrument */
function extractParams(
  ctx: AudioContext,
  tune: BaseTune,
  options: PlaySoundOptions,
  instrument: InstrumentConfig,
  defaultVolume = 0.35,
) {
  return {
    time: ctx.currentTime,
    vol: (tune.volume ?? defaultVolume) * (options.volume ?? 1),
    duration: tune.duration * instrument.decayMult,
  };
}

/** Create a noise-burst voice with filter and gain envelope */
function createNoiseBurstVoice(
  ctx: AudioContext,
  duration: number,
  time: number,
  vol: number,
  instrument: InstrumentConfig,
  config: {
    decayConstant?: number;
    filterFreq?: number;
    filterQ?: number;
    filterType?: BiquadFilterType;
    filterSweep?: { start: number; end: number };
  } = {},
): void {
  const d = config.decayConstant ?? 35;
  const noiseBuffer = createNoiseBuffer(ctx, duration + 0.01);
  applyDecayToBuffer(noiseBuffer, d);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  const fFreq = config.filterFreq ?? instrument.filterFreq;
  const fQ = config.filterQ ?? instrument.q;
  const filter = createFilter(ctx, fFreq, fQ, config.filterType);
  if (config.filterSweep) {
    filter.frequency.setValueAtTime(config.filterSweep.start, time);
    filter.frequency.exponentialRampToValueAtTime(config.filterSweep.end, time + duration);
  }
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0.001, vol * instrument.gainMult), time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(time);
  source.stop(time + duration + 0.01);
}

/** Create a fundamental sweep oscillator + harmonic voice */
function createSweepVoices(
  ctx: AudioContext,
  time: number,
  vol: number,
  freq: number,
  endFreq: number,
  duration: number,
  instrument: InstrumentConfig,
  tune: BaseTune,
  addClickLayer?: boolean,
): { oscillators: OscillatorNode[]; gainNodes: GainNode[] } {
  const oscillators: OscillatorNode[] = [];
  const gainNodes: GainNode[] = [];

  const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
  const gain = createEnvelopedGain(ctx, time, vol, duration, { ...instrument, decayMult: 1 });
  osc.connect(gain); gain.connect(ctx.destination);
  oscillators.push(osc); gainNodes.push(gain);

  if (tune.harmonics && tune.harmonicRatio) {
    createHarmonicVoiceInner(ctx, time, freq, endFreq, vol, duration, instrument, tune, oscillators, gainNodes);
  }

  if (addClickLayer && tune.meta?.clickLayer) {
    createNoiseBurstVoice(ctx, 0.01, time, vol, instrument, {
      decayConstant: 40, filterFreq: instrument.filterFreq, filterQ: instrument.q,
    });
  }

  for (const o of oscillators) { o.start(time); o.stop(time + duration + 0.05); }
  return { oscillators, gainNodes };
}

/** Create a harmonic overtone voice for sweep/rise factories */
function createHarmonicVoiceInner(
  ctx: AudioContext,
  time: number,
  freq: number,
  endFreq: number,
  vol: number,
  duration: number,
  instrument: InstrumentConfig,
  tune: BaseTune,
  oscillators: OscillatorNode[],
  gainNodes: GainNode[],
): void {
  if (!tune.harmonics || !tune.harmonicRatio) return;
  const hFreq = freq * tune.harmonicRatio;
  const hEndFreq = endFreq * tune.harmonicRatio;
  const harmOsc = createOscillator(ctx, hFreq, { ...instrument, pitchMult: 1 });
  harmOsc.frequency.setValueAtTime(hFreq, time);
  harmOsc.frequency.exponentialRampToValueAtTime(hEndFreq, time + duration);
  const harmGain = createEnvelopedGain(ctx, time, (tune.harmonicVolume ?? 0.1) * vol, duration, { ...instrument, decayMult: 1 });
  harmOsc.connect(harmGain);
  harmGain.connect(ctx.destination);
  oscillators.push(harmOsc);
  gainNodes.push(harmGain);
}

function makePlayback(
  oscillators: OscillatorNode[],
  gainNodes: GainNode[],
  onEnd?: () => void,
): SoundPlayback {
  let stopped = false;
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      for (const osc of oscillators) {
        try { osc.stop(); } catch { /* already stopped */ }
      }
      for (const gain of gainNodes) {
        try { gain.disconnect(); } catch { /* already disconnected */ }
      }
      onEnd?.();
    },
  };
}

// ── Click ── (noise burst with bandpass filter)

function clickFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument, 0.5);
    const decayConstant = (tune.meta?.decayConstant as number) ?? 35;
    const filterFreq = (tune.filterFreq ?? 3800) * instrument.pitchMult;
    const filterQ = tune.filterQ ?? 2.5;
    createNoiseBurstVoice(ctx, duration, time, vol, instrument, {
      decayConstant,
      filterFreq: filterFreq * instrument.filterFreq / 3800,
      filterQ: filterQ * instrument.q / 2.5,
    });
    return makePlayback([], [], options.onEnd);
  };
}

// ── Pop ── (frequency sweep oscillator)

function popFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument);
    const freq = (tune.frequency ?? 680) * instrument.pitchMult;
    const endFreq = (tune.endFrequency ?? 880) * instrument.pitchMult;
    const attack = tune.attack ?? 0.002;
    const decay = (tune.decay ?? 0.035) * instrument.decayMult;

    const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, vol * instrument.gainMult), time + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, time + attack + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration + 0.01);

    return makePlayback([osc], [gain], options.onEnd);
  };
}

// ── Toggle ── (noise click + tonal glide)

function toggleFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument, 0.4);
    const freq = (tune.frequency ?? 700) * instrument.pitchMult;
    const endFreq = (tune.endFrequency ?? 480) * instrument.pitchMult;
    const noiseGain = (tune.meta?.noiseGain as number) ?? 0.2;
    const toneGain = (tune.meta?.toneGain as number) ?? 0.22;

    // Layer 1: noise transient
    {
      const buf = createNoiseBuffer(ctx, 0.012);
      applyDecayToBuffer(buf, 80);
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const nf = createFilter(ctx, instrument.filterFreq, instrument.q);
      const ng = ctx.createGain();
      ng.gain.value = noiseGain * instrument.gainMult;
      ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      ns.start(time); ns.stop(time + 0.015);
    }

    // Layer 2: tonal glide
    const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);
    const toneGainNode = ctx.createGain();
    toneGainNode.gain.setValueAtTime(0.001, time);
    toneGainNode.gain.linearRampToValueAtTime(Math.max(0.001, toneGain * instrument.gainMult * vol), time + 0.003);
    toneGainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(toneGainNode);
    toneGainNode.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration + 0.01);

    return makePlayback([osc], [toneGainNode], options.onEnd);
  };
}

// ── Tick ── (short noise burst with highpass)

function tickFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument, 0.3);
    createNoiseBurstVoice(ctx, duration, time, vol, instrument, {
      decayConstant: 50,
      filterFreq: instrument.filterFreq * 1.5,
      filterQ: instrument.q,
      filterType: "highpass",
    });
    return makePlayback([], [], options.onEnd);
  };
}

// ── Sweep ── (frequency glide with optional harmonics)

function sweepFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument);
    const freq = (tune.frequency ?? 280) * instrument.pitchMult;
    const endFreq = (tune.endFrequency ?? 440) * instrument.pitchMult;
    const { oscillators, gainNodes } = createSweepVoices(ctx, time, vol, freq, endFreq, duration, instrument, tune);
    return makePlayback(oscillators, gainNodes, options.onEnd);
  };
}

// ── Rise ── (ascending sweep, optionally with harmonic + click layer)

function riseFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument);
    const freq = (tune.frequency ?? 320) * instrument.pitchMult;
    const endFreq = (tune.endFrequency ?? 480) * instrument.pitchMult;
    const { oscillators, gainNodes } = createSweepVoices(ctx, time, vol, freq, endFreq, duration, instrument, tune, true);
    return makePlayback(oscillators, gainNodes, options.onEnd);
  };
}

// ── Drop ── (descending sweep, same structure as rise)

function dropFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  // Drop is just a sweep going down — same implementation as rise with reversed freqs
  return riseFactory(tune, instrument);
}

// ── Chime ── (single tone with harmonic overtone)

function chimeFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument, 0.3);
    const freq = (tune.frequency ?? 587.33) * instrument.pitchMult;
    const { oscillators, gainNodes } = createSweepVoices(ctx, time, vol, freq, freq, duration, instrument, tune);
    return makePlayback(oscillators, gainNodes, options.onEnd);
  };
}

// ── Arpeggio ── (sequential notes with optional shimmer)

function arpeggioFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument);
    const notes = (tune.notes ?? [523.25, 659.25]).map((n) => n * instrument.pitchMult);
    const noteDuration = (tune.noteDuration ?? 0.1) * instrument.decayMult;
    const noteGap = tune.noteGap ?? 0.12;
    const finalRing = (tune.meta?.finalRing as number) ?? 0.25;
    const shimmerCents = (tune.meta?.shimmerCents as number) ?? 0;
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    for (let i = 0; i < notes.length; i++) {
      const noteTime = time + i * (noteDuration + noteGap);
      const ring = i === notes.length - 1 ? finalRing : noteDuration;
      const osc = createOscillator(ctx, notes[i], { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, noteTime, vol, ring, { ...instrument, decayMult: 1 });
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(noteTime); osc.stop(noteTime + ring + 0.05);
      oscillators.push(osc); gainNodes.push(gain);

      if (tune.harmonics && tune.harmonicRatio) {
        const harmOsc = createOscillator(ctx, notes[i] * tune.harmonicRatio, { ...instrument, pitchMult: 1 });
        const harmGain = createEnvelopedGain(ctx, noteTime, (tune.harmonicVolume ?? 0.1) * vol, ring, { ...instrument, decayMult: 1 });
        harmOsc.connect(harmGain); harmGain.connect(ctx.destination);
        harmOsc.start(noteTime); harmOsc.stop(noteTime + ring + 0.05);
        oscillators.push(harmOsc); gainNodes.push(harmGain);
      }

      if (shimmerCents > 0 && i === notes.length - 1) {
        const shimmerOsc = createOscillator(ctx, notes[i], { ...instrument, pitchMult: 1 }, shimmerCents);
        const shimmerGain = createEnvelopedGain(ctx, noteTime, vol * 0.25, ring, { ...instrument, decayMult: 1 });
        shimmerOsc.connect(shimmerGain); shimmerGain.connect(ctx.destination);
        shimmerOsc.start(noteTime); shimmerOsc.stop(noteTime + ring + 0.05);
        oscillators.push(shimmerOsc); gainNodes.push(shimmerGain);
      }
    }
    return makePlayback(oscillators, gainNodes, options.onEnd);
  };
}

// ── Chord ── (simultaneous notes)

function chordFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument);
    const notes = (tune.notes ?? [261.63, 329.63, 392.0]).map((n) => n * instrument.pitchMult);
    const normFactor = 1 / Math.sqrt(notes.length);
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    for (const freq of notes) {
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, time, vol * normFactor, duration, { ...instrument, decayMult: 1 });
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(time); osc.stop(time + duration + 0.05);
      oscillators.push(osc); gainNodes.push(gain);
    }
    return makePlayback(oscillators, gainNodes, options.onEnd);
  };
}

// ── Burst ── (noise with bandpass sweep)

function burstFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument, 0.5);
    createNoiseBurstVoice(ctx, duration, time, vol, instrument, {
      decayConstant: 30,
      filterFreq: instrument.filterFreq,
      filterQ: instrument.q,
      filterSweep: { start: instrument.filterFreq, end: instrument.filterFreq * 0.3 },
    });
    return makePlayback([], [], options.onEnd);
  };
}

// ── Pulse ── (repeating oscillator pattern)

function pulseFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol } = extractParams(ctx, tune, options, instrument);
    const freq = (tune.frequency ?? 440) * instrument.pitchMult;
    const count = tune.pulseCount ?? 3;
    const pulseDur = tune.duration / count;
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    for (let i = 0; i < count; i++) {
      const t = time + i * pulseDur;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, pulseDur * 0.6, { ...instrument, decayMult: 1 });
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(t); osc.stop(t + pulseDur);
      oscillators.push(osc); gainNodes.push(gain);
    }
    return makePlayback(oscillators, gainNodes, options.onEnd);
  };
}

// ── Wobble ── (oscillator + LFO frequency modulation)

function wobbleFactory(tune: BaseTune, instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const { time, vol, duration } = extractParams(ctx, tune, options, instrument);
    const freq = (tune.frequency ?? 440) * instrument.pitchMult;
    const modFreq = tune.modFreq ?? 8;
    const modDepth = tune.modDepth ?? 30;

    const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = modFreq;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = modDepth * instrument.pitchMult;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const gain = createEnvelopedGain(ctx, time, vol, duration, { ...instrument, decayMult: 1 });
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.05);
    lfo.start(time);
    lfo.stop(time + duration + 0.05);

    return makePlayback([osc, lfo], [gain], options.onEnd);
  };
}

// ── Factory Registry ──

const FACTORIES: Record<string, (tune: BaseTune, instrument: InstrumentConfig) => SoundSynthesizer> = {
  click: clickFactory,
  pop: popFactory,
  toggle: toggleFactory,
  tick: tickFactory,
  sweep: sweepFactory,
  rise: riseFactory,
  drop: dropFactory,
  chime: chimeFactory,
  arpeggio: arpeggioFactory,
  chord: chordFactory,
  burst: burstFactory,
  pulse: pulseFactory,
  wobble: wobbleFactory,
};

export function createSynthesizer(
  tune: BaseTune,
  instrument: InstrumentConfig,
): SoundSynthesizer {
  const factory = FACTORIES[tune.type];
  if (!factory) {
    // Fallback: silent no-op
    return (_ctx, options) => {
      options.onEnd?.();
      return { stop() {} };
    };
  }
  return factory(tune, instrument);
}
