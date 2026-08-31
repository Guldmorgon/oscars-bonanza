import { useRef } from 'react';

/**
 * Guards a one-shot host action against accidental double-fire.
 *
 * Returns a function that reports `true` when the action should be IGNORED because
 * it ran moments ago. A ref is used rather than `useState` because refs update
 * synchronously — a state guard is still stale during a fast double-click, and for
 * buttons whose action changes after the first press (e.g. the board footer going
 * from "next round" to "to the bet round") that would skip a whole round.
 */
export function useActionLock(ms = 400) {
  const last = useRef(0);
  return () => {
    const now = Date.now();
    if (now - last.current < ms) return true;
    last.current = now;
    return false;
  };
}
