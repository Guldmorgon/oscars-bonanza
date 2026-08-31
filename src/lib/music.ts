// Optional looping MP3 music. Drop files into `public/audio/`; any that are missing
// are silently skipped. `background.mp3` loops continuously so it's never quiet; event
// tracks (spin/final/winner/…) duck the background while they play.
//
// Everything is fully offline: each present file is fetched once and played from an
// in-memory object URL. Missing files (or a dev-server SPA fallback that returns HTML)
// are detected via content-type and ignored — no console errors.

import { useGame } from '../store/gameStore';

const FILES: Record<string, string> = {
  background: '/audio/background.mp3',
  final: '/audio/final.mp3',
  winner: '/audio/winner.mp3',
};

const BG_VOLUME = 0.5;
const BG_DUCKED = 0.12;

const cache: Record<string, HTMLAudioElement | undefined> = {};
let initPromise: Promise<void> | null = null;
let currentEvent: HTMLAudioElement | null = null;

function enabled(): boolean {
  return useGame.getState().settings.musicOn;
}

async function probe(url: string): Promise<HTMLAudioElement | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!/audio|mpeg|mp3|octet-stream/i.test(ct)) return null; // missing → HTML fallback
    const blob = await res.blob();
    const el = new Audio(URL.createObjectURL(blob));
    el.preload = 'auto';
    return el;
  } catch {
    return null;
  }
}

/** Probe + cache all present tracks. Idempotent. */
export function initMusic(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await Promise.all(
        Object.entries(FILES).map(async ([name, url]) => {
          const el = await probe(url);
          if (el) cache[name] = el;
        }),
      );
    })();
  }
  return initPromise;
}

function bg(): HTMLAudioElement | undefined {
  return cache.background;
}

export const music = {
  /** Start (or resume) the continuous background loop. Safe to call repeatedly. */
  async startBackground() {
    if (!enabled()) return; // don't fetch anything when music is switched off
    await initMusic();
    if (!enabled()) return;
    const b = bg();
    if (!b) return;
    b.loop = true;
    if (b.volume === 0) b.volume = BG_VOLUME;
    else if (!currentEvent) b.volume = BG_VOLUME;
    try {
      await b.play();
    } catch {
      /* autoplay blocked until a gesture — ignored */
    }
  },

  /** Play a moment-specific track, ducking the background while it plays. */
  async duckAndPlay(name: string, opts: { loop?: boolean } = {}) {
    if (!enabled()) return;
    await initMusic();
    if (!enabled()) return;

    const el = cache[name];
    if (!el) {
      // No track for this moment. Crucially we must still stop whatever was looping
      // and un-duck the background, otherwise (e.g. final.mp3 present but no
      // winner.mp3) the previous loop plays on over the next screen forever.
      this.stopEvent();
      return;
    }

    const b = bg();
    if (b) b.volume = BG_DUCKED;

    // stop any previous event track
    if (currentEvent && currentEvent !== el) {
      currentEvent.pause();
      currentEvent.currentTime = 0;
    }
    currentEvent = el;
    el.loop = !!opts.loop;
    el.currentTime = 0;
    el.volume = 0.8;
    el.onended = opts.loop
      ? null
      : () => {
          if (b) b.volume = BG_VOLUME;
          if (currentEvent === el) currentEvent = null;
        };
    try {
      await el.play();
    } catch {
      /* ignored */
    }
  },

  /** Stop the current event track and restore the background volume. */
  stopEvent() {
    if (currentEvent) {
      currentEvent.pause();
      currentEvent.currentTime = 0;
      currentEvent = null;
    }
    const b = bg();
    if (b) b.volume = BG_VOLUME;
  },

  /** React to the Music on/off setting. */
  setEnabled(on: boolean) {
    if (on) {
      void this.startBackground();
    } else {
      this.stopAll();
    }
  },

  stopAll() {
    for (const el of Object.values(cache)) el?.pause();
    currentEvent = null;
  },
};
