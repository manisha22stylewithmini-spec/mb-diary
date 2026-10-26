import type { Music } from '../types';

export interface MusicPreset {
  id: string;
  name: string;
  vibe: string;
}

/** Built-in tracks are generated live with the Web Audio API, so they need no files or licences. */
export const MUSIC_PRESETS: MusicPreset[] = [
  { id: 'calm', name: 'Calm focus', vibe: 'Soft ambient pads' },
  { id: 'lofi', name: 'Lo-fi chill', vibe: 'Warm keys, easy beat' },
  { id: 'upbeat', name: 'Upbeat pulse', vibe: 'Bright plucks, light groove' },
];

export interface Player {
  play(): Promise<void>;
  pause(): void;
  setVolume(v: number): void;
  dispose(): void;
  readonly playing: boolean;
  subscribe(fn: (playing: boolean) => void): () => void;
}

interface Engine {
  start(): Promise<void>;
  stop(): void;
  volume(v: number): void;
  destroy(): void;
}

/** Only one track plays at a time across the whole app. */
let active: Player | null = null;

function wrap(engine: Engine): Player {
  let playing = false;
  const subs = new Set<(p: boolean) => void>();
  const emit = (p: boolean) => {
    playing = p;
    subs.forEach((f) => f(p));
  };
  const self: Player = {
    async play() {
      if (active && active !== self) active.pause();
      await engine.start();
      active = self;
      emit(true);
    },
    pause() {
      engine.stop();
      if (active === self) active = null;
      emit(false);
    },
    setVolume: (v) => engine.volume(v),
    dispose() {
      self.pause();
      engine.destroy();
      subs.clear();
    },
    get playing() {
      return playing;
    },
    subscribe(fn) {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    },
  };
  return self;
}

/* ---------------- generated tracks ---------------- */

const hz = (n: number) => 440 * 2 ** ((n - 69) / 12);

interface Voices {
  tone(freq: number, t: number, dur: number, type: OscillatorType, gain: number, attack?: number): void;
  kick(t: number): void;
  hat(t: number, gain?: number): void;
  snare(t: number): void;
}

interface Track {
  bpm: number;
  /** steps are eighth notes */
  chordSteps: number;
  cutoff: number;
  chords: number[][];
  step(i: number, chord: number[], t: number, dur: number, v: Voices): void;
}

const TRACKS: Record<string, Track> = {
  calm: {
    bpm: 60,
    chordSteps: 8,
    cutoff: 1400,
    chords: [
      [48, 55, 59, 64],
      [45, 52, 60, 64],
      [41, 48, 57, 60],
      [43, 50, 59, 62],
    ],
    step(i, chord, t, _dur, v) {
      if (i !== 0) return;
      chord.forEach((n) => v.tone(hz(n), t, 6, 'triangle', 0.09, 1.6));
      v.tone(hz(chord[0] - 12), t, 5, 'sine', 0.16, 0.6);
    },
  },
  lofi: {
    bpm: 76,
    chordSteps: 8,
    cutoff: 1900,
    chords: [
      [50, 53, 57, 60],
      [43, 47, 53, 55],
      [48, 52, 55, 59],
      [45, 48, 52, 55],
    ],
    step(i, chord, t, _dur, v) {
      if (i === 0) {
        chord.forEach((n) => {
          v.tone(hz(n), t, 1.7, 'sine', 0.1, 0.02);
          v.tone(hz(n + 12), t, 1.1, 'triangle', 0.025, 0.02);
        });
        v.tone(hz(chord[0] - 12), t, 1.2, 'sine', 0.2, 0.02);
      }
      if (i === 0 || i === 5) v.kick(t);
      if (i === 4) v.snare(t);
      if (i % 2 === 1) v.hat(t, i % 4 === 1 ? 0.07 : 0.04);
    },
  },
  upbeat: {
    bpm: 108,
    chordSteps: 8,
    cutoff: 3200,
    chords: [
      [60, 64, 67, 72],
      [55, 62, 67, 71],
      [57, 60, 64, 69],
      [53, 60, 65, 69],
    ],
    step(i, chord, t, _dur, v) {
      const idx = [0, 1, 2, 3, 2, 1, 2, 3][i];
      v.tone(hz(chord[idx]), t, 0.4, 'triangle', 0.13, 0.008);
      if (i === 0 || i === 4) {
        v.tone(hz(chord[0] - 24), t, 0.55, 'sine', 0.26, 0.01);
        v.kick(t);
      }
      if (i % 2 === 1) v.hat(t, 0.06);
    },
  },
};

function synthEngine(presetId: string, volume: number): Engine {
  const track = TRACKS[presetId] ?? TRACKS.calm;
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let noise: AudioBuffer;
  let timer: number | undefined;
  let nextTime = 0;
  let step = 0;
  let level = volume;

  const ensure = () => {
    if (ctx) return ctx;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = (level / 100) * 0.55;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = track.cutoff;
    master.connect(lp);
    lp.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return ctx;
  };

  const voices = (c: AudioContext): Voices => ({
    tone(freq, t, dur, type, gain, attack = 0.01) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    kick(t) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 0.3);
    },
    hat(t, gain = 0.05) {
      const s = c.createBufferSource();
      s.buffer = noise;
      const hp = c.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 6000;
      const g = c.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      s.connect(hp);
      hp.connect(g);
      g.connect(master);
      s.start(t);
      s.stop(t + 0.08);
    },
    snare(t) {
      const s = c.createBufferSource();
      s.buffer = noise;
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1800;
      const g = c.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      s.connect(bp);
      bp.connect(g);
      g.connect(master);
      s.start(t);
      s.stop(t + 0.16);
    },
  });

  const tick = () => {
    if (!ctx) return;
    const dur = 60 / track.bpm / 2;
    const v = voices(ctx);
    while (nextTime < ctx.currentTime + 0.18) {
      const chordIdx = Math.floor(step / track.chordSteps) % track.chords.length;
      track.step(step % track.chordSteps, track.chords[chordIdx], nextTime, dur, v);
      nextTime += dur;
      step++;
    }
  };

  return {
    async start() {
      const c = ensure();
      await c.resume();
      nextTime = c.currentTime + 0.06;
      window.clearInterval(timer);
      timer = window.setInterval(tick, 40);
    },
    stop() {
      window.clearInterval(timer);
      timer = undefined;
      void ctx?.suspend();
    },
    volume(v) {
      level = v;
      if (ctx) master.gain.value = (v / 100) * 0.55;
    },
    destroy() {
      window.clearInterval(timer);
      void ctx?.close();
      ctx = null;
    },
  };
}

function mediaEngine(src: string, volume: number): Engine {
  const a = new Audio();
  a.src = src;
  a.loop = true;
  a.preload = 'none';
  a.volume = volume / 100;
  return {
    start: () => a.play(),
    stop: () => a.pause(),
    volume: (v) => {
      a.volume = v / 100;
    },
    destroy: () => {
      a.pause();
      a.removeAttribute('src');
      a.load();
    },
  };
}

/** Returns null when the page has no usable track configured. */
export function createPlayer(music: Music): Player | null {
  if (!music.enabled) return null;
  if (music.source === 'preset') return wrap(synthEngine(music.preset, music.volume));
  if (music.url.trim()) return wrap(mediaEngine(music.url.trim(), music.volume));
  return null;
}

export function trackLabel(music: Music): string {
  if (music.source === 'preset') return MUSIC_PRESETS.find((p) => p.id === music.preset)?.name ?? 'Music';
  return music.title.trim() || (music.source === 'upload' ? 'Uploaded track' : 'Custom track');
}
