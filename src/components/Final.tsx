import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { Avatar } from './Avatar';
import { Podium, type PodiumEntry } from './Podium';
import { computeAwards } from '../lib/awards';
import { S } from '../lib/strings';
import { sfx } from '../lib/sound';
import { music } from '../lib/music';
import { burst, celebrate } from '../lib/confetti';
import { useActionLock } from '../lib/useActionLock';
import type { SurveyQuestion } from '../types';

type Step = 'intro' | 'input1' | 'handover' | 'input2' | 'reveal' | 'done';

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function matchPoints(q: SurveyQuestion, text: string): number {
  const n = norm(text);
  if (!n) return 0;
  const a = q.answers.find((ans) => norm(ans.text) === n);
  return a ? a.points : 0;
}

export function Final({ onHome }: { onHome: () => void }) {
  const questions = useGame((s) => s.final.questions);
  const players = useGame((s) => s.players);
  const awardPoints = useGame((s) => s.awardPoints);
  const beginFinal = useGame((s) => s.beginFinal);
  const stats = useGame((s) => s.stats);
  const preFinalStandings = useGame((s) => s.preFinalStandings);
  const resetGame = useGame((s) => s.resetGame);
  const backToBoard = useGame((s) => s.backToBoard);

  // Freeze the two finalists (top 2 by score) at mount; higher score goes first.
  const [finalistIds] = useState(() =>
    [...players]
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((p) => p.id),
  );
  const first = players.find((p) => p.id === finalistIds[0]);
  const second = players.find((p) => p.id === finalistIds[1]);

  const [step, setStep] = useState<Step>('intro');
  const [answers1, setAnswers1] = useState<Record<string, string>>({});
  const [answers2, setAnswers2] = useState<Record<string, string>>({});
  const [qi, setQi] = useState(0); // current question being revealed
  const [shown, setShown] = useState(0); // answers shown for current question: 0, 1, or 2
  const lock = useActionLock();

  useEffect(() => {
    void music.duckAndPlay('final', { loop: true });
    // whatever unmounts us, stop the loop and restore the background volume
    return () => music.stopEvent();
  }, []);

  // Guard both "not enough players" and "no questions authored" — without the second
  // check the reveal step dereferences questions[0] and throws.
  const blocked = !first || !second ? S.final.needTwo : questions.length === 0 ? S.final.needQuestions : null;
  if (blocked || !first || !second) {
    return (
      <div className="overlay">
        <motion.div className="final" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <p className="final-title title-gradient">{S.final.title}</p>
          <p style={{ color: 'var(--ink-soft)' }}>{blocked}</p>
          <button className="btn" onClick={onHome}>
            {S.final.backToMenu}
          </button>
        </motion.div>
      </div>
    );
  }

  // Reveal, alternating on each question: first player's answer, then second's,
  // then advance to the next question.
  function advance() {
    if (lock()) return;
    if (shown < 2) {
      const slot = shown; // 0 = first player, 1 = second player
      const q = questions[qi];
      const player = slot === 0 ? first! : second!;
      const text = (slot === 0 ? answers1 : answers2)[q.id] ?? '';
      const pts = matchPoints(q, text);
      awardPoints(player.id, pts, { kind: 'final' });
      if (pts > 0) {
        sfx.cash();
        burst();
      } else {
        sfx.wrong();
      }
      setShown(shown + 1);
    } else if (qi < questions.length - 1) {
      setQi(qi + 1);
      setShown(0);
    } else {
      finish();
    }
  }

  function finish() {
    sfx.fanfare();
    celebrate();
    void music.duckAndPlay('winner', { loop: true });
    setStep('done');
  }

  // input2 duplicate check (per question, P2 may not reuse P1's answer)
  const dupQuestion = questions.find(
    (q) => answers2[q.id] && norm(answers2[q.id]) === norm(answers1[q.id] ?? ''),
  );

  const maxScore = Math.max(first.score, second.score);
  const winners = [first, second].filter((p) => p.score === maxScore);

  // Podium: the two finalists take 1st/2nd on their final score. Only they can score in
  // the final, so 3rd goes to the best of the rest from the pre-final standings.
  const ranked = [first, second].sort((a, b) => b.score - a.score);
  const podium: PodiumEntry[] = [
    { player: ranked[0], score: ranked[0].score, place: 1 },
    { player: ranked[1], score: ranked[1].score, place: 2 },
  ];
  const third = preFinalStandings
    .filter((st) => !finalistIds.includes(st.playerId))
    .sort((a, b) => b.score - a.score)
    .map((st) => ({ st, player: players.find((p) => p.id === st.playerId) }))
    .find((x) => !!x.player);
  // no score shown for 3rd — their kr total isn't comparable to final-round points
  if (third?.player) {
    podium.push({ player: third.player, place: 3 });
  }

  const awards = computeAwards(players, stats);

  return (
    <div className="overlay">
      <motion.div
        className="final"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        {step !== 'done' && (
          <>
            <p className="final-title title-gradient">{S.final.title}</p>
            <p style={{ marginTop: '-0.4rem', color: 'var(--ink-soft)' }}>{S.final.subtitle}</p>
          </>
        )}

        {step === 'intro' && (
          <>
            <p style={{ color: 'var(--ink-soft)' }}>{S.final.intro}</p>
            <div className="final-vs">
              <FinalistBadge player={first} />
              <span className="vs">VS</span>
              <FinalistBadge player={second} />
            </div>
            <p className="hint">{S.final.goesFirst(first.name)}</p>
            <p className="hint">{S.final.resetNote}</p>
            <button
              className="btn btn-lg"
              onClick={() => {
                // snapshot the standings (for 3rd place) then zero the scores
                beginFinal();
                setStep('input1');
              }}
            >
              {S.final.start} →
            </button>
          </>
        )}

        {step === 'input1' && (
          <AnswerForm
            heading={S.final.turnOf(first.name)}
            questions={questions}
            answers={answers1}
            setAnswer={(qid, v) => setAnswers1((a) => ({ ...a, [qid]: v }))}
            onDone={() => setStep('handover')}
          />
        )}

        {step === 'handover' && (
          <>
            <p className="final-title title-gradient" style={{ fontSize: '2rem' }}>
              {S.final.handoverTitle}
            </p>
            <p style={{ color: 'var(--ink-soft)' }}>{S.final.handoverBody(second.name)}</p>
            <button className="btn btn-lg" onClick={() => setStep('input2')}>
              {S.final.handoverGo} →
            </button>
          </>
        )}

        {step === 'input2' && (
          <AnswerForm
            heading={S.final.turnOf(second.name)}
            note={S.final.hideNote}
            questions={questions}
            answers={answers2}
            setAnswer={(qid, v) => setAnswers2((a) => ({ ...a, [qid]: v }))}
            dupQuestionId={dupQuestion?.id}
            onDone={() => setStep('reveal')}
          />
        )}

        {step === 'reveal' && (
          <RevealView
            questions={questions}
            first={first}
            second={second}
            answers1={answers1}
            answers2={answers2}
            qi={qi}
            shown={shown}
            onAdvance={advance}
          />
        )}

        {step === 'done' && (
          <>
            {winners.length === 1 ? (
              <p className="winner-name title-gradient">{S.final.winner(winners[0].name)}</p>
            ) : (
              <p className="winner-name title-gradient">{S.final.tie}</p>
            )}

            <Podium entries={podium} />

            {awards.length > 0 && (
              <>
                <div className="clue-head" style={{ marginTop: '1.2rem' }}>
                  {S.awards.title}
                </div>
                <div className="awards-grid">
                  {awards.map((a) => (
                    <div className="award-card" key={a.title}>
                      <span className="award-title">{a.title}</span>
                      <span className="award-winner">{a.playerName}</span>
                      <span className="hint">{a.detail}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="clue-actions">
              <button
                className="btn"
                onClick={() => {
                  music.stopEvent();
                  resetGame();
                  backToBoard();
                }}
              >
                {S.final.playAgain}
              </button>
              <button className="btn btn-ghost" onClick={onHome}>
                {S.final.backToMenu}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function FinalistBadge({ player }: { player: { name: string; score: number; color: string; avatarDataUrl?: string; id: string } }) {
  return (
    <div className="finalist-badge">
      <Avatar player={player} size="lg" />
      <span className="score-name">{player.name}</span>
      <span className="score-value">
        {player.score}
      </span>
    </div>
  );
}

function AnswerForm({
  heading,
  note,
  questions,
  answers,
  setAnswer,
  dupQuestionId,
  onDone,
}: {
  heading: string;
  note?: string;
  questions: SurveyQuestion[];
  answers: Record<string, string>;
  setAnswer: (qid: string, v: string) => void;
  dupQuestionId?: string;
  onDone: () => void;
}) {
  return (
    <>
      <div className="clue-head">{heading}</div>
      {note && <p className="hint">{note}</p>}
      <div className="center-col" style={{ textAlign: 'left', margin: '1rem 0' }}>
        {questions.map((q, i) => (
          <div className="field" key={q.id}>
            <label>
              {S.final.questionOf(i + 1, questions.length)} · {q.prompt}
            </label>
            <input
              className="input"
              list={`dl-${q.id}`}
              placeholder={S.final.answerPlaceholder}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
            />
            <datalist id={`dl-${q.id}`}>
              {q.answers.map((a) => (
                <option key={a.id} value={a.text} />
              ))}
            </datalist>
            {dupQuestionId === q.id && <span className="dup-warn">{S.final.alreadyTaken}</span>}
          </div>
        ))}
      </div>
      <button className="btn btn-lg" disabled={!!dupQuestionId} onClick={onDone}>
        {S.btn.done} →
      </button>
    </>
  );
}

function RevealView({
  questions,
  first,
  second,
  answers1,
  answers2,
  qi,
  shown,
  onAdvance,
}: {
  questions: SurveyQuestion[];
  first: { id: string; name: string; score: number; color: string; avatarDataUrl?: string };
  second: { id: string; name: string; score: number; color: string; avatarDataUrl?: string };
  answers1: Record<string, string>;
  answers2: Record<string, string>;
  qi: number;
  shown: number;
  onAdvance: () => void;
}) {
  const q = questions[qi];
  const isLast = qi === questions.length - 1;

  const row = (player: typeof first, text: string, revealed: boolean) => {
    const pts = matchPoints(q, text);
    return (
      <div className={`reveal-row${revealed ? ' shown' : ''}`}>
        <Avatar player={player} />
        <span className="score-name grow">{player.name}</span>
        {revealed ? (
          <motion.span
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16 }}
            className="reveal-answer"
          >
            «{text || '—'}» ·{' '}
            <strong className={pts > 0 ? 'pts-good' : 'pts-zero'}>
              {pts} {S.final.points}
            </strong>
          </motion.span>
        ) : (
          <span className="reveal-answer hidden-answer">•••</span>
        )}
      </div>
    );
  };

  const label =
    shown < 2 ? `${S.final.reveal} →` : isLast ? S.final.finish : `${S.final.nextQuestion} →`;
  const green = shown === 2 && isLast;

  return (
    <>
      <div className="reveal-scores">
        <span>
          {first.name}: <strong>{first.score}</strong>
        </span>
        <span>
          {second.name}: <strong>{second.score}</strong>
        </span>
      </div>
      <div className="clue-head">{S.final.questionOf(qi + 1, questions.length)}</div>
      <div className="clue-prompt" style={{ fontSize: 'clamp(1.4rem,3vw,2.2rem)' }}>
        {q.prompt}
      </div>

      <div className="reveal-rows">
        {row(first, answers1[q.id] ?? '', shown >= 1)}
        {row(second, answers2[q.id] ?? '', shown >= 2)}
      </div>

      <button className={`btn btn-lg${green ? ' btn-green' : ''}`} onClick={onAdvance}>
        {label}
      </button>
    </>
  );
}
