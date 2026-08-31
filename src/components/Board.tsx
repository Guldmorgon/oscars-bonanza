import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { useActionLock } from '../lib/useActionLock';

export function Board() {
  const boards = useGame((s) => s.boards);
  const round = useGame((s) => s.round);
  const revealed = useGame((s) => s.revealedClueIds);
  const openClue = useGame((s) => s.openClue);
  const nextRound = useGame((s) => s.nextRound);
  const goToBet = useGame((s) => s.goToBet);
  const allRevealed = useGame((s) => s.allCluesRevealed(round));
  const lock = useActionLock();

  const board = boards[round];
  const revealedSet = new Set(revealed);
  const cols = board ? board.categories.length : 0;

  if (!board || cols === 0) {
    return (
      <div className="board-wrap">
        <p className="home-info" style={{ margin: 'auto' }}>
          {S.board.empty}
        </p>
      </div>
    );
  }

  const isLastRound = round === boards.length - 1;
  const gridCols = { gridTemplateColumns: `repeat(${cols}, 1fr)` };

  // Locked: this button's action changes after the first press (next round -> bet
  // round), so an accidental double-click would otherwise skip a whole round.
  function advance() {
    if (lock()) return;
    sfx.correct();
    if (isLastRound) goToBet();
    else nextRound();
  }

  let footerLabel: string;
  if (!allRevealed) {
    footerLabel = isLastRound ? `${S.board.toBet} →` : `${S.board.toRound2} →`;
  } else {
    footerLabel = isLastRound ? `${S.board.round2Done} →` : `${S.board.round1Done} →`;
  }

  return (
    <div className="board-wrap">
      <div className="board-head" style={gridCols}>
        {board.categories.map((cat) => (
          <div className="cat-chip" key={cat.id}>
            {cat.title || '—'}
          </div>
        ))}
      </div>
      <div className="rule" />

      <div className="board" style={gridCols}>
        {board.categories.map((cat) => (
          <div className="board-col" key={cat.id}>
            {cat.clues.map((clue) => {
              const used = revealedSet.has(clue.id);
              return (
                <motion.button
                  key={clue.id}
                  className={`tile${used ? ' used' : ''}`}
                  disabled={used}
                  whileTap={used ? undefined : { scale: 0.96 }}
                  onClick={() => {
                    if (used) return;
                    sfx.whoosh();
                    openClue(clue.id);
                  }}
                >
                  {!used && <span className="tile-value">{clue.value}</span>}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="board-footer">
        <button className={`btn ${allRevealed ? 'btn-green' : 'btn-ghost'}`} onClick={advance}>
          {footerLabel}
        </button>
      </div>
    </div>
  );
}
