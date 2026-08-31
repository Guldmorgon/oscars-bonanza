import { useState, type ReactNode } from 'react';
import type { Round } from './types';
import { AnimatePresence } from 'framer-motion';
import { useGame } from './store/gameStore';
import { S } from './lib/strings';
import { sfx } from './lib/sound';
import { music } from './lib/music';
import { useHotkeys } from './lib/useHotkeys';
import { Home } from './components/Home';
import { Board } from './components/Board';
import { Clue } from './components/Clue';
import { BetRound } from './components/BetRound';
import { Final } from './components/Final';
import { Editor } from './components/Editor';
import { Settings } from './components/Settings';
import { Scoreboard } from './components/Scoreboard';
import { FlyingPoints } from './components/FlyingPoints';
import { ContestantIntro } from './components/ContestantIntro';
import { CategoryIntro } from './components/CategoryIntro';

export type View = 'home' | 'play' | 'edit' | 'settings';

/** Logo bar: back + gold wordmark on the left, optional badge on the right. */
function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            sfx.click();
            onBack();
          }}
        >
          ← {S.btn.back}
        </button>
        <h1 className="title-gradient">{title}</h1>
      </div>
      {right}
    </div>
  );
}

function PlayScreen({
  onHome,
  introDone,
  onIntroDone,
  catIntroDone,
  onCatIntroDone,
}: {
  onHome: () => void;
  introDone: boolean;
  onIntroDone: () => void;
  catIntroDone: Round[];
  onCatIntroDone: (round: Round) => void;
}) {
  const phase = useGame((s) => s.phase);
  const round = useGame((s) => s.round);
  const activeClueId = useGame((s) => s.activeClueId);
  const lastEvent = useGame((s) => s.history[s.history.length - 1]);
  const undoLast = useGame((s) => s.undoLast);

  // Contestant intros run once per session, and only on a game that hasn't started.
  // `introDone` lives in App (which stays mounted) so leaving Play doesn't reset it.
  const isFreshGame = useGame(
    (s) => s.round === 0 && s.revealedClueIds.length === 0 && s.players.every((p) => p.score === 0),
  );
  const hasPlayers = useGame((s) => s.players.length > 0);
  const showIntro = isFreshGame && hasPlayers && !introDone;

  // Category reveal: once per round per session. `catIntroDone` lives in App, but a
  // reload resets it while `round` persists — so also require the round to be
  // untouched, which keeps the cards from reappearing mid-game. Gated on `!showIntro`
  // because both overlays bind Space at the window level.
  const roundUntouched = useGame((s) => s.noCluesRevealed(round));
  const showCatIntro =
    phase === 'board' && !showIntro && !catIntroDone.includes(round) && roundUntouched;

  // Undo is scoped to the board/clue phases — the bet round and final drive their own
  // step state, so rewinding a score there would desync what's on screen. It's also off
  // while the category intro covers the board: `nextRound` keeps the previous round's
  // history, so a stray ⌘Z there would rewind a score the host can't see.
  const canUndo = !!lastEvent && !showCatIntro && (phase === 'board' || phase === 'clue');

  function doUndo() {
    if (!canUndo) return;
    sfx.click();
    undoLast();
  }

  useHotkeys((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      doUndo();
    }
  });

  const undoLabel = lastEvent
    ? `${lastEvent.playerName} ${lastEvent.delta > 0 ? '+' : '−'}${Math.abs(lastEvent.delta)}`
    : '';

  return (
    <>
      <TopBar
        title={S.appName}
        onBack={onHome}
        right={
          <div className="topbar-right">
            <button
              className="btn btn-ghost btn-sm"
              disabled={!canUndo}
              onClick={doUndo}
              title={canUndo ? S.undo.tooltip(undoLabel) : S.undo.none}
            >
              ↶ {S.undo.label}
              {canUndo && <span className="undo-what">{undoLabel}</span>}
            </button>
            <span className="round-badge">{round === 0 ? S.board.round1 : S.board.round2}</span>
          </div>
        }
      />
      <Board />
      <Scoreboard />
      {showIntro && <ContestantIntro onDone={onIntroDone} />}
      {showCatIntro && <CategoryIntro round={round} onDone={() => onCatIntroDone(round)} />}
      <AnimatePresence>
        {phase === 'clue' && activeClueId && <Clue key={activeClueId} clueId={activeClueId} />}
        {phase === 'bet' && <BetRound key="bet" onHome={onHome} />}
        {phase === 'final' && <Final key="final" onHome={onHome} />}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [introDone, setIntroDone] = useState(false);
  const [catIntroDone, setCatIntroDone] = useState<Round[]>([]);
  const backToBoard = useGame((s) => s.backToBoard);

  function goHome() {
    music.stopEvent();
    backToBoard();
    setView('home');
  }

  return (
    <div className="app">
      <FlyingPoints />
      {view === 'home' && <Home go={setView} />}

      {view === 'play' && (
        <PlayScreen
          onHome={goHome}
          introDone={introDone}
          onIntroDone={() => setIntroDone(true)}
          catIntroDone={catIntroDone}
          onCatIntroDone={(r) => setCatIntroDone((d) => (d.includes(r) ? d : [...d, r]))}
        />
      )}

      {view === 'edit' && (
        <>
          <TopBar title={S.editor.title} onBack={goHome} />
          <Editor />
        </>
      )}

      {view === 'settings' && (
        <>
          <TopBar title={S.settings.title} onBack={goHome} />
          <Settings />
        </>
      )}
    </div>
  );
}
