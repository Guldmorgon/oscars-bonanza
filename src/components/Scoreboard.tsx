import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { Avatar } from './Avatar';

export function Scoreboard() {
  const players = useGame((s) => s.players);
  if (players.length === 0) return null;

  const maxScore = Math.max(...players.map((p) => p.score));
  const someoneAhead = players.some((p) => p.score !== players[0].score) || players.length === 1;

  return (
    <div className="scoreboard">
      {players.map((p) => {
        const isLeader = someoneAhead && p.score === maxScore && maxScore > 0;
        return (
          <div
            key={p.id}
            data-player-id={p.id}
            className={`score-chip${isLeader ? ' leader' : ''}`}
          >
            <Avatar player={p} />
            <div className="score-meta">
              <span className="score-name">{p.name}</span>
              <motion.span
                key={p.score}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className={`score-value${p.score < 0 ? ' neg' : ''}`}
              >
                {p.score}
              </motion.span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
