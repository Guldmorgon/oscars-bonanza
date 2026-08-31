import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { useHotkeys } from '../lib/useHotkeys';
import type { Round } from '../types';

/**
 * Full-screen category reveal at the start of a round, one card at a time, so the
 * host can introduce each category to the room before the board appears.
 * Forward on space/enter/→/click, back on ←, Esc skips the rest.
 */
export function CategoryIntro({ round, onDone }: { round: Round; onDone: () => void }) {
  const categories = useGame((s) => s.boards[round]?.categories);
  const [i, setI] = useState(0);

  const count = categories?.length ?? 0;
  const isLast = i >= count - 1;

  function next() {
    if (isLast) {
      onDone();
      return;
    }
    sfx.whoosh();
    setI((n) => n + 1);
  }

  function prev() {
    if (i === 0) return;
    sfx.whoosh();
    setI((n) => n - 1);
  }

  useHotkeys((e) => {
    if (count === 0) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onDone();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      next();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  });

  // Nothing to introduce — an empty board already shows its own message.
  if (!categories || count === 0) return null;

  const category = categories[Math.min(i, count - 1)];

  return (
    <div className="overlay cat-intro-overlay" onClick={next}>
      <div className="cat-intro">
        <p className="cat-intro-kicker">{round === 0 ? S.board.round1 : S.board.round2}</p>

        {/* Keyed on the category: React remounts on each flip, which replays the
            enter animation. Enter-only, like the clue card — an AnimatePresence
            exit never completes here under StrictMode, which strands the old card. */}
        <motion.div
          className="cat-intro-card"
          key={category.id}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <span className="cat-intro-counter">{S.catIntro.counter(i + 1, count)}</span>
          <h2 className="cat-intro-name title-gradient">{category.title || '—'}</h2>
        </motion.div>

        {/* blur() after a click: these buttons outlive the card, so a button left
            focused would take the host's next Space/Enter as a native activation on
            top of the window shortcut and skip a category. */}
        <div className="cat-intro-nav">
          <button
            /* Hidden (not just disabled) on the first card: a disabled button still
               swallows the click, leaving a dead patch in the click-anywhere area. */
            className={`btn btn-ghost${i === 0 ? ' is-invisible' : ''}`}
            disabled={i === 0}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              prev();
            }}
          >
            ← {S.catIntro.back}
          </button>
          <button
            className="btn btn-lg"
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              next();
            }}
          >
            {isLast ? S.catIntro.start : `${S.catIntro.next} →`}
          </button>
        </div>

        <p className="hint">{S.catIntro.hint}</p>
      </div>
    </div>
  );
}
