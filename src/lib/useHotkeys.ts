import { useEffect, useRef } from 'react';

/**
 * Window-level keydown handler for host shortcuts.
 * Never fires while the host is typing in a field (editor, wagers, final answers).
 */
export function useHotkeys(handler: (e: KeyboardEvent) => void, enabled = true) {
  // keep the latest handler without re-binding the listener every render
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(e: KeyboardEvent) {
      // Auto-repeat fires ~15x/sec while a key is held. Every shortcut here is a
      // discrete action (undo, award, sound board), so a held key must not repeat it.
      if (e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) {
          return;
        }
      }
      ref.current(e);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}

/**
 * Number-row digit 1-9 from a key event, or null.
 *
 * Prefers `code` (physical key) so Shift+1 still reads as "1" on layouts where that
 * types '!' or '"' — e.g. a Swedish keyboard. Falls back to `key` for environments
 * that don't populate `code`.
 */
export function digitFromEvent(e: KeyboardEvent): number | null {
  const byCode = /^Digit([1-9])$/.exec(e.code);
  if (byCode) return Number(byCode[1]);
  if (/^[1-9]$/.test(e.key)) return Number(e.key);
  return null;
}
