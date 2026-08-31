// End-of-night "silly awards", computed from the per-player tallies.
import type { PlayerStats } from '../store/gameStore';
import type { Player } from '../types';
import { S } from './strings';

export interface Award {
  title: string;
  playerId: string;
  playerName: string;
  detail: string;
}

type Pick = {
  title: string;
  /** Value to maximise; the award is skipped when the best value is 0. */
  value: (s: PlayerStats) => number;
  detail: (s: PlayerStats) => string;
};

const PICKS: Pick[] = [
  {
    title: S.awards.sharpshooter,
    value: (s) => s.correct,
    detail: (s) => `${s.correct} rätt`,
  },
  {
    title: S.awards.mostWrong,
    value: (s) => s.wrong,
    detail: (s) => `${s.wrong} fel`,
  },
  {
    title: S.awards.risktaker,
    value: (s) => s.bet,
    detail: (s) => `satsade ${s.bet}`,
  },
  {
    title: S.awards.surveyKing,
    value: (s) => s.finalPoints,
    detail: (s) => `${s.finalPoints} poäng i finalen`,
  },
];

/**
 * One winner per award, highest value wins; ties go to the first player listed.
 * Awards with no data at all (best value 0) are skipped.
 */
export function computeAwards(players: Player[], stats: Record<string, PlayerStats>): Award[] {
  const out: Award[] = [];
  for (const pick of PICKS) {
    let best: { player: Player; s: PlayerStats } | null = null;
    for (const p of players) {
      const s = stats[p.id];
      if (!s) continue;
      if (!best || pick.value(s) > pick.value(best.s)) best = { player: p, s };
    }
    if (!best || pick.value(best.s) <= 0) continue;
    out.push({
      title: pick.title,
      playerId: best.player.id,
      playerName: best.player.name,
      detail: pick.detail(best.s),
    });
  }
  return out;
}
