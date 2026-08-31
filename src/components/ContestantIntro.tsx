import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { Avatar } from './Avatar';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { useHotkeys } from '../lib/useHotkeys';

const STEP_MS = 750;

/** Game-show style contestant reveal, one player at a time. Always skippable. */
export function ContestantIntro({ onDone }: { onDone: () => void }) {
  const players = useGame((s) => s.players);
  const [shown, setShown] = useState(0);

  const allShown = shown >= players.length;

  useEffect(() => {
    if (allShown) return;
    const t = window.setTimeout(() => {
      sfx.ding();
      setShown((n) => n + 1);
    }, STEP_MS);
    return () => window.clearTimeout(t);
  }, [shown, allShown]);

  useHotkeys((e) => {
    if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onDone();
    }
  });

  if (players.length === 0) return null;

  return (
    <div className="overlay intro-overlay" onClick={onDone}>
      <div className="intro">
        <p className="final-title title-gradient">{S.intro.title}</p>
        <p className="hint">{S.intro.skip}</p>

        <div className="intro-row">
          {players.map((p, i) => (
            <motion.div
              className="intro-card"
              key={p.id}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={i < shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Avatar player={p} size="xl" />
              <span className="intro-name">{p.name}</span>
            </motion.div>
          ))}
        </div>

        <button
          className="btn btn-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
        >
          {allShown ? S.intro.start : S.intro.skipBtn}
        </button>
      </div>
    </div>
  );
}
