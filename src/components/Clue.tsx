import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { Avatar } from './Avatar';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { flyPoints } from '../lib/fx';
import { useHotkeys, digitFromEvent } from '../lib/useHotkeys';
import { useActionLock } from '../lib/useActionLock';
import type { Player } from '../types';

export function Clue({ clueId }: { clueId: string }) {
  const boards = useGame((s) => s.boards);
  const found = useMemo(() => {
    for (const board of boards) {
      for (const category of board.categories) {
        const clue = category.clues.find((c) => c.id === clueId);
        if (clue) return { clue, category };
      }
    }
    return null;
  }, [boards, clueId]);
  const players = useGame((s) => s.players);
  const awardPoints = useGame((s) => s.awardPoints);
  const closeClue = useGame((s) => s.closeClue);
  const consumeClue = useGame((s) => s.consumeClue);

  const [revealed, setRevealed] = useState(false);
  const [shake, setShake] = useState(false);
  const [resolved, setResolved] = useState(false);

  // Ref-based lock: refs update synchronously, so this survives a fast double-click
  // in a way a useState guard cannot.
  const lock = useActionLock();

  // Any pending timers must die with the component.
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    },
    [],
  );

  // NOTE: hooks must run before the `!found` early return below.
  const clue = found?.clue;
  const category = found?.category;
  const effectiveValue = clue?.value ?? 0;
  const awardablePlayers: Player[] = players;

  function doReveal() {
    if (revealed) return;
    setRevealed(true);
    sfx.ding();
  }

  /** Close a clue nobody won — the tile is consumed as its own undoable action. */
  function closeUnanswered() {
    if (resolved || !clue) return;
    consumeClue(clue.id);
    closeClue();
  }

  function markCorrect(p: Player) {
    if (resolved || !clue || lock()) return;
    setResolved(true);
    // record the tile too, so undo makes it playable again
    awardPoints(p.id, effectiveValue, { clueId: clue.id, kind: 'clue' });
    sfx.correct();
    sfx.cash();
    burst();
    setRevealed(true);

    // The score bar is fixed above the overlay, so the target chip is already on
    // screen — fire the flying points straight away rather than deferring them.
    const src = document.querySelector(`[data-award-id="${p.id}"]`)?.getBoundingClientRect() ?? null;
    flyPoints(effectiveValue, src, p.id);

    later(() => closeClue(), 1100);
  }

  function markWrong(p: Player) {
    if (resolved || !clue || lock()) return;
    awardPoints(p.id, -effectiveValue, { kind: 'clue' });
    sfx.wrong();
    setShake(true);
    later(() => setShake(false), 500);
  }

  // Host shortcuts: Space/Enter = reveal, 1-9 = correct, Shift+1-9 = wrong, Esc = close.
  useHotkeys((e) => {
    if (!clue) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeUnanswered();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      doReveal();
      return;
    }
    const d = digitFromEvent(e);
    if (d !== null) {
      const p = awardablePlayers[d - 1];
      if (!p) return;
      e.preventDefault();
      if (e.shiftKey) markWrong(p);
      else markCorrect(p);
    }
  });

  if (!found || !clue || !category) return null;

  // Shrink the text for long content so it fits rather than scrolling out of view.
  // The answer counts too, since revealing it is what usually tips a clue over.
  const textLen = clue.prompt.length + (revealed ? clue.answer.length : 0);
  const textSizeClass = textLen > 230 ? ' text-xs' : textLen > 130 ? ' text-sm' : '';

  return (
    <div className="overlay">
      <motion.div
        className={`clue-card${shake ? ' shake' : ''}`}
        initial={{ rotateX: -90, opacity: 0, scale: 0.9 }}
        animate={{ rotateX: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <div className="cat-chip filled">{category.title}</div>
        <div className="rule" style={{ width: '100%' }} />
        <div className="clue-value">
          {effectiveValue}
        </div>

        <div className={`clue-panel${textSizeClass}`}>
          <div className="clue-panel-inner">
            {clue.imageDataUrl && <img className="clue-image" src={clue.imageDataUrl} alt="" />}
            <div className="clue-prompt">{clue.prompt || S.editor.emptyClue}</div>
            {revealed && <div className="clue-answer">{clue.answer || '—'}</div>}
          </div>
        </div>

        {!revealed && (
          <div className="clue-actions">
            <button className="btn btn-lg" onClick={doReveal}>
              {S.clue.reveal}
            </button>
          </div>
        )}

        <div className="clue-head">{S.clue.who}</div>
        <div className="award-row">
          {awardablePlayers.map((p, i) => (
            <div className="award-btn" key={p.id} data-award-id={p.id}>
              {i < 9 && <span className="key-badge">{i + 1}</span>}
              <Avatar player={p} />
              <span className="score-name">{p.name}</span>
              <div className="mini-actions">
                <button
                  className="pill pill-plus"
                  disabled={resolved}
                  onClick={() => markCorrect(p)}
                  title={S.clue.correct}
                >
                  +{effectiveValue}
                </button>
                <button
                  className="pill pill-minus"
                  disabled={resolved}
                  onClick={() => markWrong(p)}
                  title={S.clue.wrong}
                >
                  −{effectiveValue}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="clue-actions">
          <button className="btn btn-ghost" disabled={resolved} onClick={closeUnanswered}>
            {S.clue.noOne}
          </button>
        </div>

        <p className="key-hint">{S.clue.keyHint}</p>
      </motion.div>
    </div>
  );
}
