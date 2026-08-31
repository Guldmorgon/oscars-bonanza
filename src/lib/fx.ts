// Transient visual effects. Deliberately kept out of the zustand store — this is
// throwaway animation state that should never be persisted.

export interface FlyEvent {
  id: number;
  amount: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

type Listener = (e: FlyEvent) => void;

let listeners: Listener[] = [];
let nextId = 1;

export function onFly(cb: Listener): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

/**
 * Send an awarded amount flying into a player's scoreboard chip.
 * Silently does nothing if the chip isn't on screen (e.g. mid-overlay).
 */
export function flyPoints(amount: number, from: DOMRect | null, playerId: string) {
  if (!from || amount === 0) return;
  // ids can come from an imported backup, so escape rather than interpolate raw
  const sel = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(playerId) : playerId;
  const target = document.querySelector(`[data-player-id="${sel}"]`);
  if (!target) return;

  const e: FlyEvent = {
    id: nextId++,
    amount,
    from: centre(from),
    to: centre(target.getBoundingClientRect()),
  };
  for (const l of listeners) l(e);
}
