/**
 * Sound Packs — 9 complete packs, each with custom hero sounds.
 * Every pack is a Record<SoundRole, SoundSynthesizer>.
 */

import type {
  InstrumentConfig,
  PlaySoundOptions,
  SoundPack,
  SoundPackName,
  SoundPlayback,
  SoundSynthesizer,
} from "./types";
import { INSTRUMENTS, createOscillator, createEnvelopedGain } from "./instruments";
import { ROLE_TUNES } from "./tunes";
import { createSynthesizer } from "./factory";

// ── Generic pack generator ──

function generateSoundPack(instrument: InstrumentConfig): SoundPack {
  const pack = {} as Record<string, SoundSynthesizer>;
  for (const role of Object.keys(ROLE_TUNES) as Array<keyof typeof ROLE_TUNES>) {
    pack[role] = createSynthesizer(ROLE_TUNES[role], instrument);
  }
  return pack as SoundPack;
}

// ── Helper for note-sequence hero sounds ──

type SeqOpts = { gap: number; dur: number; decayMult?: number; pad?: number; shimmerVol?: number; partials?: number[]; partialVol?: number; partialDur?: number };

function playSequence(
  ctx: AudioContext, time: number, vol: number, notes: number[],
  instr: InstrumentConfig, opts: SeqOpts,
): SoundPlayback {
  const oscs: OscillatorNode[] = [];
  const dm = opts.decayMult ?? 1;
  const pad = opts.pad ?? 0.5;
  for (let i = 0; i < notes.length; i++) {
    const freq = notes[i] * instr.pitchMult;
    const t = time + i * opts.gap;
    const conf = { ...instr, pitchMult: 1, decayMult: dm };
    const osc = createOscillator(ctx, freq, conf);
    const gain = createEnvelopedGain(ctx, t, vol, opts.dur, conf);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + opts.dur + pad);
    oscs.push(osc);
    if (opts.shimmerVol) {
      const sh = createOscillator(ctx, freq * 2.003, conf);
      const sg = createEnvelopedGain(ctx, t, vol * opts.shimmerVol, opts.dur, conf);
      sh.connect(sg); sg.connect(ctx.destination);
      sh.start(t); sh.stop(t + opts.dur + pad);
      oscs.push(sh);
    }
    if (opts.partials) {
      for (const partial of opts.partials) {
        const pdur = opts.partialDur ?? opts.dur;
        const p = createOscillator(ctx, freq * partial, conf);
        const pg = createEnvelopedGain(ctx, t, vol * (opts.partialVol ?? 0.08), pdur, conf);
        p.connect(pg); pg.connect(ctx.destination);
        p.start(t); p.stop(t + pdur + pad);
        oscs.push(p);
      }
    }
  }
  return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
}

// ── Helpers ──

/** Merge multiple playbacks into one (for layering). */
function mergePlayback(...pbs: SoundPlayback[]): SoundPlayback {
  return { stop() { for (const p of pbs) try { p.stop(); } catch {} } };
}

/** Play a single note with envelope, returns the oscillator. */
function playNote(ctx: AudioContext, t: number, freq: number, vol: number, dur: number,
  instr: InstrumentConfig, cents = 0): OscillatorNode {
  const o = createOscillator(ctx, freq * instr.pitchMult, { ...instr, pitchMult: 1 }, cents);
  const g = createEnvelopedGain(ctx, t, vol, dur, instr);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + dur + 0.3);
  return o;
}

/** Play multiple simultaneous notes (chord). Returns oscillators. */
function playChord(ctx: AudioContext, t: number, notes: number[], vol: number, dur: number,
  instr: InstrumentConfig, detune?: number): OscillatorNode[] {
  const oscs: OscillatorNode[] = [];
  const centsList = detune ? [-detune, detune] : [0];
  const factor = centsList.length;
  for (const freq of notes) {
    for (const cents of centsList) {
      oscs.push(playNote(ctx, t, freq, vol / factor, dur, instr, cents));
    }
  }
  return oscs;
}

/** Play a sequence of notes (arpeggio) starting at t+offset. Returns oscillators. */
function playArp(ctx: AudioContext, offset: number, notes: number[], vol: number, dur: number,
  gap: number, instr: InstrumentConfig): OscillatorNode[] {
  const oscs: OscillatorNode[] = [];
  for (let i = 0; i < notes.length; i++) {
    oscs.push(playNote(ctx, offset + i * gap, notes[i], vol, dur, instr));
  }
  return oscs;
}

/** Single note with crisp envelope (fast attack + exponential decay). */
function crispNote(ctx: AudioContext, t: number, freq: number, vol: number,
  instr: InstrumentConfig, noteDur: number): OscillatorNode {
  const o = createOscillator(ctx, freq * instr.pitchMult, { ...instr, pitchMult: 1 });
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(Math.max(0.001, vol * instr.gainMult), t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.001, t + noteDur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t); o.stop(t + noteDur + 0.03);
  return o;
}

// ── Custom complex hero sound builders (keep as named for readability) ──

function organicHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const base = playSequence(ctx, time, vol,
      [261.63, 392.0, 329.63, 440.0, 523.25], instrument, { gap: 0.14, dur: 0.3 });
    const body = playNote(ctx, time, 261.63 * 2.8, vol * 0.1, 0.6, instrument);
    return mergePlayback(base, { stop() { try { body.stop(); } catch {} } });
  };
}

function industrialHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.4 * (options.volume ?? 1);
    const oscs = [
      ...playChord(ctx, time, [164.81, 246.94, 329.63], vol * 0.8, 0.5, instrument),
      ...playArp(ctx, time + 0.3, [329.63, 392.0, 493.88, 659.25], vol, 0.15, 0.08, instrument),
    ];
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function industrialHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const oscs = [
      ...playChord(ctx, time, [164.81, 246.94], vol, 0.3, { ...instrument, decayMult: 0.6 }),
      playNote(ctx, time + 0.15, 329.63, vol * 0.8, 0.2, { ...instrument, decayMult: 0.6 }),
    ];
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function retroHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const oscs = [
      ...playChord(ctx, time, [220.0, 261.63, 329.63], vol * 0.5, 0.4, instrument, 6),
      ...playArp(ctx, time + 0.4, [440.0, 523.25, 659.25, 880.0], vol, 0.12, 0.08, { ...instrument, decayMult: 1.1 }),
    ];
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function retroHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const oscs = [
      ...playChord(ctx, time, [220.0, 261.63, 329.63], vol * 0.4, 0.25, instrument, 6),
      playNote(ctx, time + 0.2, 440.0, vol, 0.2, instrument),
    ];
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function crispHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      oscs.push(crispNote(ctx, time + i * 0.05, notes[i], vol, instrument, 0.12));
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function crispHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx, options) => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const notes = [523.25, 587.33, 783.99, 1046.5];
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      oscs.push(crispNote(ctx, time + i * 0.06, notes[i], vol, instrument, 0.1));
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

// ── Build all packs ──

type HeroSoundPair = {
  complete: SoundSynthesizer;
  milestone: SoundSynthesizer;
};

function mkSeq(vol: number, notes: number[], instr: InstrumentConfig, opts: SeqOpts): SoundSynthesizer {
  return (ctx, options) => playSequence(ctx, ctx.currentTime, vol * (options.volume ?? 1), notes, instr, opts);
}

const HERO_OVERRIDES: Record<SoundPackName, HeroSoundPair> = {
  soft: {
    complete: mkSeq(0.3, [329.63, 261.63, 392.0, 523.25], INSTRUMENTS.soft, { gap: 0.18, dur: 0.4, decayMult: 1.5, pad: 0.4 }),
    milestone: mkSeq(0.25, [329.63, 261.63], INSTRUMENTS.soft, { gap: 0.2, dur: 0.35, decayMult: 1.5, pad: 0.35 }),
  },
  aero: {
    complete: mkSeq(0.35, [293.66, 392.0, 440.0, 587.33, 783.99], INSTRUMENTS.aero, { gap: 0.12, dur: 0.35, shimmerVol: 0.25 }),
    milestone: mkSeq(0.3, [293.66, 440.0, 587.33], INSTRUMENTS.aero, { gap: 0.15, dur: 0.3, shimmerVol: 0.2 }),
  },
  arcade: {
    complete: mkSeq(0.4, [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98], INSTRUMENTS.arcade,
      { gap: 0.06, dur: 0.12, decayMult: 0.5, pad: 0.03 }),
    milestone: mkSeq(0.35, [392.0, 493.88, 587.33, 783.99], INSTRUMENTS.arcade,
      { gap: 0.08, dur: 0.12, decayMult: 0.5, pad: 0.03 }),
  },
  organic: {
    complete: organicHeroComplete(INSTRUMENTS.organic),
    milestone: mkSeq(0.3, [261.63, 392.0, 523.25], INSTRUMENTS.organic, { gap: 0.15, dur: 0.25, pad: 0.15 }),
  },
  glass: {
    complete: mkSeq(0.35, [659.25, 783.99, 987.77, 1046.5, 1318.51], INSTRUMENTS.glass,
      { gap: 0.1, dur: 0.4, decayMult: 1.2, pad: 0.8, partials: [2, 2.4], partialVol: 0.08, partialDur: 0.3 }),
    milestone: mkSeq(0.3, [392.0, 493.88, 659.25], INSTRUMENTS.glass,
      { gap: 0.12, dur: 0.35, decayMult: 1.2, pad: 0.45, shimmerVol: 0.15 }),
  },
  industrial: {
    complete: industrialHeroComplete(INSTRUMENTS.industrial),
    milestone: industrialHeroMilestone(INSTRUMENTS.industrial),
  },
  minimal: {
    complete: mkSeq(0.2, [261.63, 392.0, 523.25], INSTRUMENTS.minimal, { gap: 0.3, dur: 0.25, decayMult: 0.8, pad: 0.25 }),
    milestone: mkSeq(0.2, [196.0, 261.63], INSTRUMENTS.minimal, { gap: 0.25, dur: 0.2, decayMult: 0.8, pad: 0.2 }),
  },
  retro: {
    complete: retroHeroComplete(INSTRUMENTS.retro),
    milestone: retroHeroMilestone(INSTRUMENTS.retro),
  },
  crisp: {
    complete: crispHeroComplete(INSTRUMENTS.crisp),
    milestone: crispHeroMilestone(INSTRUMENTS.crisp),
  },
};

function buildPack(name: SoundPackName): SoundPack {
  const instrument = INSTRUMENTS[name];
  const pack = generateSoundPack(instrument);
  // Override hero sounds with hand-crafted versions
  pack["hero.complete"] = HERO_OVERRIDES[name].complete;
  pack["hero.milestone"] = HERO_OVERRIDES[name].milestone;
  return pack;
}

export const soundPacks: Record<SoundPackName, SoundPack> = {
  soft:       buildPack("soft"),
  aero:       buildPack("aero"),
  arcade:     buildPack("arcade"),
  organic:    buildPack("organic"),
  glass:      buildPack("glass"),
  industrial: buildPack("industrial"),
  minimal:    buildPack("minimal"),
  retro:      buildPack("retro"),
  crisp:      buildPack("crisp"),
};
