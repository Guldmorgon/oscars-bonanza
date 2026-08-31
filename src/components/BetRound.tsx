import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { Avatar } from './Avatar';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { burst } from '../lib/confetti';
import { useActionLock } from '../lib/useActionLock';

type Step = 'bet' | 'guess' | 'reveal';

interface Result {
  playerId: string;
  guess: number | null;
  bet: number;
  dist: number;
  won: boolean;
}

// This round changes scores, so it can reshuffle who becomes the top-2 finalists.
export function BetRound({ onHome }: { onHome: () => void }) {
  const betRound = useGame((s) => s.betRound);
  const players = useGame((s) => s.players);
  const awardPoints = useGame((s) => s.awardPoints);
  const recordBet = useGame((s) => s.recordBet);
  const goToFinal = useGame((s) => s.goToFinal);

  const capFor = (score: number) => Math.max(1000, score);

  const lock = useActionLock();
  const [step, setStep] = useState<Step>('bet');
  const [bets, setBets] = useState<Record<string, number>>(() =>
    Object.fromEntries(players.map((p) => [p.id, 1000])),
  );
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Result[]>([]);

  function setBet(id: string, val: number, score: number) {
    setBets((b) => ({ ...b, [id]: Math.max(0, Math.min(capFor(score), Math.round(val) || 0)) }));
  }

  function reveal() {
    if (lock()) return;
    const parsed: Result[] = players.map((p) => {
      const raw = guesses[p.id];
      const n = raw !== undefined && raw !== '' ? Number(raw) : NaN;
      const valid = !Number.isNaN(n);
      return {
        playerId: p.id,
        guess: valid ? n : null,
        bet: bets[p.id] ?? 0,
        dist: valid ? Math.abs(n - betRound.answer) : Infinity,
        won: false,
      };
    });

    const minDist = Math.min(...parsed.map((r) => r.dist));
    const anyWinner = Number.isFinite(minDist);

    // If nobody entered a guess there is no winner, so nobody should be charged
    // either — otherwise a skipped round silently drains every player's bet.
    if (!anyWinner) {
      sfx.wrong();
      setResults(parsed);
      setStep('reveal');
      return;
    }

    for (const r of parsed) r.won = r.dist === minDist;

    // Closest gains their bet; everyone else loses theirs (scores may go negative).
    for (const r of parsed) {
      recordBet(r.playerId, r.bet);
      const delta = r.won ? r.bet : -r.bet;
      if (delta !== 0) awardPoints(r.playerId, delta, { kind: 'bet' });
    }

    sfx.cash();
    burst();
    setResults(parsed);
    setStep('reveal');
  }

  const resById = (id: string) => results.find((r) => r.playerId === id);
  /** False when nobody entered a guess — then no bets were charged at all. */
  const anyGuessed = results.some((r) => r.guess !== null);

  return (
    <div className="overlay">
      <motion.div
        className="final"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <p className="final-title title-gradient">{S.bet.title}</p>
        <p style={{ marginTop: '-0.4rem', color: 'var(--ink-soft)' }}>{S.bet.subtitle}</p>

        {step === 'bet' && (
          <>
            <div className="clue-head">{S.bet.themeLabel}</div>
            <div className="clue-value">{betRound.theme || '—'}</div>
            <p className="hint">{S.bet.betPhase}</p>
            <div className="wager-grid">
              {players.map((p) => (
                <div className="wager-card" key={p.id}>
                  <Avatar player={p} />
                  <div className="score-meta grow">
                    <span className="score-name">{p.name}</span>
                    <span className="hint">
                      {S.bet.max} {capFor(p.score)}
                    </span>
                  </div>
                  <input
                    className="input"
                    style={{ width: '6rem', textAlign: 'center' }}
                    type="number"
                    min={0}
                    max={capFor(p.score)}
                    value={bets[p.id] ?? 0}
                    onChange={(e) => setBet(p.id, Number(e.target.value), p.score)}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-lg" onClick={() => setStep('guess')}>
              {S.bet.showQuestion} →
            </button>
          </>
        )}

        {step === 'guess' && (
          <>
            <div className="clue-prompt">{betRound.question || '—'}</div>
            <p className="hint">{S.bet.guessPhase}</p>
            <div className="wager-grid">
              {players.map((p) => (
                <div className="wager-card" key={p.id}>
                  <Avatar player={p} />
                  <span className="score-name grow">{p.name}</span>
                  <input
                    className="input"
                    style={{ width: '9rem', textAlign: 'center' }}
                    type="number"
                    placeholder={S.bet.guessPlaceholder}
                    value={guesses[p.id] ?? ''}
                    onChange={(e) => setGuesses((g) => ({ ...g, [p.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-lg" onClick={reveal}>
              {S.bet.reveal} →
            </button>
          </>
        )}

        {step === 'reveal' && (
          <>
            <div className="clue-head">{S.bet.answerLabel}</div>
            <div className="clue-answer">{betRound.answer.toLocaleString('sv-SE')}</div>
            {!anyGuessed && <p className="hint">{S.bet.noGuesses}</p>}
            <div className="final-score-grid">
              {players.map((p) => {
                const r = resById(p.id);
                if (!r) return null;
                return (
                  <div
                    className="final-score-card"
                    key={p.id}
                    style={
                      r.won
                        ? { borderColor: 'var(--mg-gold)', boxShadow: '0 0 0 2px var(--mg-gold)' }
                        : undefined
                    }
                  >
                    <Avatar player={p} size="lg" />
                    <span className="score-name">{p.name}</span>
                    <span className="hint">
                      {r.guess === null ? '—' : r.guess.toLocaleString('sv-SE')}
                    </span>
                    {anyGuessed && (
                      <span className={`pill ${r.won ? 'pill-plus' : 'pill-minus'}`}>
                        {r.won ? `${S.bet.closest} ${S.bet.won(r.bet)}` : S.bet.lost(r.bet)}
                      </span>
                    )}
                    <span className={`score-value${p.score < 0 ? ' neg' : ''}`}>
                      {p.score}
                    </span>
                  </div>
                );
              })}
            </div>
            <button className="btn btn-green btn-lg" onClick={goToFinal}>
              {S.bet.toFinal} →
            </button>
          </>
        )}

        <div className="clue-actions">
          <button className="btn btn-ghost" onClick={onHome}>
            {S.final.backToMenu}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
