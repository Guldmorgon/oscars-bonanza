import { motion } from 'framer-motion';
import { Avatar } from './Avatar';
import { Trophy } from './icons';
import { S } from '../lib/strings';
import type { Player } from '../types';

export interface PodiumEntry {
  player: Player;
  /** Final-round points. Omitted for 3rd place, whose kr score isn't comparable. */
  score?: number;
  /** 1 = winner. */
  place: number;
}

const HEIGHTS: Record<number, string> = { 1: '9rem', 2: '6.5rem', 3: '5rem' };

/** Classic 2nd–1st–3rd arrangement, players rising into place. */
export function Podium({ entries }: { entries: PodiumEntry[] }) {
  const byPlace = (n: number) => entries.find((e) => e.place === n);
  // left-to-right: 2nd, 1st, 3rd (omit any that don't exist)
  const ordered = [byPlace(2), byPlace(1), byPlace(3)].filter(Boolean) as PodiumEntry[];

  return (
    <div className="podium">
      {ordered.map((e, i) => (
        <motion.div
          className={`podium-col${e.place === 1 ? ' first' : ''}`}
          key={e.player.id}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.25 * i }}
        >
          {e.place === 1 && <Trophy size={64} />}
          <Avatar player={e.player} size="lg" />
          <span className="podium-name">{e.player.name}</span>
          {e.score !== undefined && (
            <span className="podium-score">
              {e.score} {S.final.points}
            </span>
          )}
          <div className="podium-block" style={{ height: HEIGHTS[e.place] }}>
            <span className="podium-place">{e.place}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
