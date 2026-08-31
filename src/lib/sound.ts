// Synthesized sound effects via the Web Audio API — no audio files, fully offline.
// Every effect respects the global sound setting (read lazily from the store).

import { useGame } from '../store/gameStore';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // Everything routes through one master gain so overlapping effects (or a
    // mashed sound-board key) attenuate instead of clipping at the destination.
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  // Browsers start the context suspended until a user gesture. Safari *rejects*
  // resume() off-gesture, so swallow it rather than leaving a floating rejection.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Output node for all effects (falls back to destination if setup failed). */
function out(ac: AudioContext): AudioNode {
  return master ?? ac.destination;
}

function enabled(): boolean {
  return useGame.getState().settings.soundOn;
}

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  start?: number; // offset seconds
  dur: number;
  gain?: number;
  glideTo?: number; // frequency to glide to
}

function tone(ac: AudioContext, o: ToneOpts) {
  const t0 = ac.currentTime + (o.start ?? 0);
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t0 + o.dur);
  const peak = o.gain ?? 0.2;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g).connect(out(ac));
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.02);
}

export const sfx = {
  /** Soft whoosh when opening a tile. */
  whoosh() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    tone(ac, { freq: 200, glideTo: 700, type: 'sine', dur: 0.25, gain: 0.15 });
  },

  /** Bright ding when the answer is revealed. */
  ding() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    tone(ac, { freq: 880, type: 'triangle', dur: 0.3, gain: 0.2 });
    tone(ac, { freq: 1320, type: 'sine', dur: 0.4, start: 0.02, gain: 0.12 });
  },

  /** Happy ascending arpeggio + coin — correct answer. */
  correct() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(ac, { freq: f, type: 'triangle', start: i * 0.08, dur: 0.18, gain: 0.22 }),
    );
  },

  /** Cha-ching for winnings. */
  cash() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    tone(ac, { freq: 1200, type: 'square', dur: 0.08, gain: 0.12 });
    tone(ac, { freq: 1600, type: 'square', start: 0.09, dur: 0.18, gain: 0.12 });
  },

  /** Descending buzzer — wrong answer. */
  wrong() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    tone(ac, { freq: 300, glideTo: 120, type: 'sawtooth', dur: 0.45, gain: 0.18 });
  },

  /** Triumphant fanfare — game winner. */
  fanfare() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    [523, 523, 659, 784, 784, 1047].forEach((f, i) =>
      tone(ac, { freq: f, type: 'triangle', start: i * 0.14, dur: 0.3, gain: 0.22 }),
    );
  },

  /** Soft click for UI selection. */
  click() {
    if (!enabled()) return;
    const ac = audio();
    if (!ac) return;
    tone(ac, { freq: 600, type: 'sine', dur: 0.06, gain: 0.1 });
  },
};

/** Call once on first user gesture to unlock audio on strict browsers. */
export function unlockAudio() {
  audio();
}
