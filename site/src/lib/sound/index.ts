/**
 * Sound system — public API.
 */

export type {
  SoundCategory,
  SoundRole,
  SoundPackName,
  OscillatorWaveform,
  InstrumentConfig,
  TuneType,
  BaseTune,
  PlaySoundOptions,
  SoundPlayback,
  SoundSynthesizer,
  SoundSource,
  SoundPack,
  SensoryConfig,
} from "./types";

export { ALL_SOUND_ROLES, SOUND_CATEGORIES } from "./types";
export {
  getAudioContext,
  closeAudioContext,
  clearBufferCache,
  playSound,
  ensureResumed,
} from "./engine";
export { INSTRUMENTS } from "./instruments";
export { ROLE_TUNES } from "./tunes";
export { createSynthesizer } from "./factory";
export { soundPacks } from "./packs";
export {
  soundPlay,
  soundConfigure,
  soundConfig,
  soundEnabled,
  initSoundSystem,
  destroySoundSystem,
} from "./singleton";
