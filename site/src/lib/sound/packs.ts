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

// ── Custom hero sound builders per pack ──

function softHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const notes = [329.63, 261.63, 392.0, 523.25]; // E4 C4 G4 C5
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.18;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.4, { ...instrument, decayMult: 1.5 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
      oscs.push(osc);
      gains.push(gain);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function softHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.25 * (options.volume ?? 1);
    const notes = [329.63, 261.63]; // E4 C4
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.2;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.35, { ...instrument, decayMult: 1.5 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function aeroHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const notes = [293.66, 392.0, 440.0, 587.33, 783.99]; // D4 G4 A4 D5 G5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.12;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.35, instrument);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
      oscs.push(osc);
      // Shimmer octave
      const shimmer = createOscillator(ctx, freq * 2.003, { ...instrument, pitchMult: 1 });
      const sGain = createEnvelopedGain(ctx, t, vol * 0.25, 0.35, instrument);
      shimmer.connect(sGain);
      sGain.connect(ctx.destination);
      shimmer.start(t);
      shimmer.stop(t + 0.6);
      oscs.push(shimmer);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function aeroHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const notes = [293.66, 440.0, 587.33]; // D4 A4 D5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.15;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.3, instrument);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
      oscs.push(osc);
      const shimmer = createOscillator(ctx, freq * 2.003, { ...instrument, pitchMult: 1 });
      const sGain = createEnvelopedGain(ctx, t, vol * 0.2, 0.3, instrument);
      shimmer.connect(sGain);
      sGain.connect(ctx.destination);
      shimmer.start(t);
      shimmer.stop(t + 0.5);
      oscs.push(shimmer);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function arcadeHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.4 * (options.volume ?? 1);
    const notes = [392.0, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98]; // G4 B4 D5 G5 B5 D6 G6
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.06;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.12, { ...instrument, decayMult: 0.5 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function arcadeHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const notes = [392.0, 493.88, 587.33, 783.99]; // G4 B4 D5 G5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.08;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.12, { ...instrument, decayMult: 0.5 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function organicHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const notes = [261.63, 392.0, 329.63, 440.0, 523.25]; // C4 G4 E4 A4 C5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.14;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.3, instrument);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
      oscs.push(osc);
    }
    // Body harmonic
    const body = createOscillator(ctx, 261.63 * 2.8 * instrument.pitchMult, { ...instrument, pitchMult: 1 });
    const bodyGain = createEnvelopedGain(ctx, time, vol * 0.1, 0.6, instrument);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.start(time);
    body.stop(time + 0.8);
    oscs.push(body);
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function organicHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const notes = [261.63, 392.0, 523.25]; // C4 G4 C5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.15;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.25, instrument);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function glassHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const notes = [659.25, 783.99, 987.77, 1046.5, 1318.51]; // E5 G5 B5 C6 E6
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.1;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.4, { ...instrument, decayMult: 1.2 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
      oscs.push(osc);
      // Bell partials
      for (const partial of [2, 2.4]) {
        const p = createOscillator(ctx, freq * partial, { ...instrument, pitchMult: 1 });
        const pg = createEnvelopedGain(ctx, t, vol * 0.08, 0.3, { ...instrument, decayMult: 1.2 });
        p.connect(pg);
        pg.connect(ctx.destination);
        p.start(t);
        p.stop(t + 1.2);
        oscs.push(p);
      }
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function glassHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const notes = [392.0, 493.88, 659.25]; // G4 B4 E5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.12;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.35, { ...instrument, decayMult: 1.2 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.8);
      oscs.push(osc);
      // Octave shimmer
      const shimmer = createOscillator(ctx, freq * 2.003, { ...instrument, pitchMult: 1 });
      const sg = createEnvelopedGain(ctx, t, vol * 0.15, 0.3, { ...instrument, decayMult: 1.2 });
      shimmer.connect(sg);
      sg.connect(ctx.destination);
      shimmer.start(t);
      shimmer.stop(t + 0.8);
      oscs.push(shimmer);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function industrialHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.4 * (options.volume ?? 1);
    // Power chord: E3 B3 E4
    const chordNotes = [164.81, 246.94, 329.63];
    // Rising arpeggio: E4 G4 B4 E5
    const arpNotes = [329.63, 392.0, 493.88, 659.25];
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < chordNotes.length; i++) {
      const freq = chordNotes[i] * instrument.pitchMult;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, time, vol * 0.8, 0.5, { ...instrument, decayMult: 0.6 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.8);
      oscs.push(osc);
    }
    for (let i = 0; i < arpNotes.length; i++) {
      const freq = arpNotes[i] * instrument.pitchMult;
      const t = time + 0.3 + i * 0.08;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.15, { ...instrument, decayMult: 0.6 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function industrialHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const oscs: OscillatorNode[] = [];
    // Fifth: E3 B3
    for (const freq of [164.81, 246.94]) {
      const osc = createOscillator(ctx, freq * instrument.pitchMult, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, time, vol, 0.3, { ...instrument, decayMult: 0.6 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.5);
      oscs.push(osc);
    }
    // Octave stab: E4
    const stab = createOscillator(ctx, 329.63 * instrument.pitchMult, { ...instrument, pitchMult: 1 });
    const stabGain = createEnvelopedGain(ctx, time + 0.15, vol * 0.8, 0.2, { ...instrument, decayMult: 0.6 });
    stab.connect(stabGain);
    stabGain.connect(ctx.destination);
    stab.start(time + 0.15);
    stab.stop(time + 0.4);
    oscs.push(stab);
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function minimalHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.2 * (options.volume ?? 1);
    const notes = [261.63, 392.0, 523.25]; // C4 G4 C5
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.3;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.25, { ...instrument, decayMult: 0.8 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function minimalHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.2 * (options.volume ?? 1);
    const notes = [196.0, 261.63]; // G3 C4
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.25;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.2, { ...instrument, decayMult: 0.8 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function retroHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    // A minor chord: A3 C4 E4
    const chordNotes = [220.0, 261.63, 329.63];
    // Arpeggio tail: A4 C5 E5 A5
    const arpNotes = [440.0, 523.25, 659.25, 880.0];
    const oscs: OscillatorNode[] = [];
    // Detuned chord
    for (const freq of chordNotes) {
      for (const cents of [-6, 6]) {
        const osc = createOscillator(ctx, freq * instrument.pitchMult, { ...instrument, pitchMult: 1 }, cents);
        const gain = createEnvelopedGain(ctx, time, vol * 0.5, 0.4, instrument);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.8);
        oscs.push(osc);
      }
    }
    // Arpeggio tail
    for (let i = 0; i < arpNotes.length; i++) {
      const freq = arpNotes[i] * instrument.pitchMult;
      const t = time + 0.4 + i * 0.08;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = createEnvelopedGain(ctx, t, vol, 0.12, { ...instrument, decayMult: 1.1 });
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function retroHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    // A minor chord stab + A4 resolution
    const chordNotes = [220.0, 261.63, 329.63];
    const oscs: OscillatorNode[] = [];
    for (const freq of chordNotes) {
      for (const cents of [-6, 6]) {
        const osc = createOscillator(ctx, freq * instrument.pitchMult, { ...instrument, pitchMult: 1 }, cents);
        const gain = createEnvelopedGain(ctx, time, vol * 0.4, 0.25, instrument);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
        oscs.push(osc);
      }
    }
    // Resolution
    const res = createOscillator(ctx, 440.0 * instrument.pitchMult, { ...instrument, pitchMult: 1 });
    const resGain = createEnvelopedGain(ctx, time + 0.2, vol, 0.2, instrument);
    res.connect(resGain);
    resGain.connect(ctx.destination);
    res.start(time + 0.2);
    res.stop(time + 0.5);
    oscs.push(res);
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function crispHeroComplete(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.35 * (options.volume ?? 1);
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5 D5 E5 G5 A5 C6
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.05;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(Math.max(0.001, vol * instrument.gainMult), t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

function crispHeroMilestone(instrument: InstrumentConfig): SoundSynthesizer {
  return (ctx: AudioContext, options: PlaySoundOptions): SoundPlayback => {
    const time = ctx.currentTime;
    const vol = 0.3 * (options.volume ?? 1);
    const notes = [523.25, 587.33, 783.99, 1046.5]; // C5 D5 G5 C6
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i] * instrument.pitchMult;
      const t = time + i * 0.06;
      const osc = createOscillator(ctx, freq, { ...instrument, pitchMult: 1 });
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(Math.max(0.001, vol * instrument.gainMult), t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
      oscs.push(osc);
    }
    return { stop() { for (const o of oscs) try { o.stop(); } catch {} } };
  };
}

// ── Build all packs ──

type HeroSoundPair = {
  complete: SoundSynthesizer;
  milestone: SoundSynthesizer;
};

const HERO_OVERRIDES: Record<SoundPackName, HeroSoundPair> = {
  soft:       { complete: softHeroComplete(INSTRUMENTS.soft),       milestone: softHeroMilestone(INSTRUMENTS.soft) },
  aero:       { complete: aeroHeroComplete(INSTRUMENTS.aero),       milestone: aeroHeroMilestone(INSTRUMENTS.aero) },
  arcade:     { complete: arcadeHeroComplete(INSTRUMENTS.arcade),   milestone: arcadeHeroMilestone(INSTRUMENTS.arcade) },
  organic:    { complete: organicHeroComplete(INSTRUMENTS.organic), milestone: organicHeroMilestone(INSTRUMENTS.organic) },
  glass:      { complete: glassHeroComplete(INSTRUMENTS.glass),     milestone: glassHeroMilestone(INSTRUMENTS.glass) },
  industrial: { complete: industrialHeroComplete(INSTRUMENTS.industrial), milestone: industrialHeroMilestone(INSTRUMENTS.industrial) },
  minimal:    { complete: minimalHeroComplete(INSTRUMENTS.minimal), milestone: minimalHeroMilestone(INSTRUMENTS.minimal) },
  retro:      { complete: retroHeroComplete(INSTRUMENTS.retro),     milestone: retroHeroMilestone(INSTRUMENTS.retro) },
  crisp:      { complete: crispHeroComplete(INSTRUMENTS.crisp),     milestone: crispHeroMilestone(INSTRUMENTS.crisp) },
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
