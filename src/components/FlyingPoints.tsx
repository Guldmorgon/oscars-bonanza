import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onFly, type FlyEvent } from '../lib/fx';

/** Renders awarded amounts flying from the clue into the player's scoreboard chip. */
export function FlyingPoints() {
  const [items, setItems] = useState<FlyEvent[]>([]);

  useEffect(
    () =>
      onFly((e) => {
        setItems((cur) => [...cur, e]);
        // matches the 0.85s flight below, so it doesn't sit frozen on the chip
        window.setTimeout(() => setItems((cur) => cur.filter((i) => i.id !== e.id)), 870);
      }),
    [],
  );

  return (
    <div className="fly-layer" aria-hidden="true">
      <AnimatePresence>
        {items.map((i) => (
          <motion.div
            key={i.id}
            className="fly-points"
            initial={{ x: i.from.x, y: i.from.y, scale: 1.4, opacity: 0 }}
            animate={{ x: i.to.x, y: i.to.y, scale: 0.6, opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.2, 0.7, 0.3, 1], times: [0, 0.15, 0.75, 1] }}
          >
            +{i.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
