import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BetRound, Board, Category, Clue, FinalRound, Phase, Player, Round } from '../types';
import { idbStorage } from '../lib/storage';
import { uid, randomColor } from '../lib/id';
import {
  makeSeedBoard,
  makeSeedBoard2,
  makeSeedPlayers,
  makeSeedFinal,
  makeSeedBet,
} from '../lib/seed';

const VALUES = [100, 200, 300, 400, 500];
const VALUES_2 = [200, 400, 600, 800, 1000];

/** Where a score change came from — keeps the end-of-night stats honest. */
export type AwardKind = 'clue' | 'bet' | 'final';

/** Per-player tallies for the end-of-night awards. Survives the final's score reset. */
export interface PlayerStats {
  correct: number;
  wrong: number;
  earned: number;
  lost: number;
  bet: number;
  finalPoints: number;
}

export const emptyStats = (): PlayerStats => ({
  correct: 0,
  wrong: 0,
  earned: 0,
  lost: 0,
  bet: 0,
  finalPoints: 0,
});

/** One reversible score change, for the host's undo. */
export interface ScoreEvent {
  /** null = the tile was opened but nobody scored (still undoable). */
  playerId: string | null;
  playerName: string | null;
  delta: number;
  /** If the action also consumed a tile, undo makes it playable again. */
  clueId?: string;
  /** So undo can reverse the stats tally as well as the score. */
  kind: AwardKind;
}

/**
 * Shape-check a backup before it touches the store. Without this an import missing
 * `final` persists an undefined that then crashes on every subsequent load.
 */
export function isValidSaveData(d: unknown): d is SaveData {
  if (!d || typeof d !== 'object') return false;
  const x = d as Partial<SaveData>;
  return (
    Array.isArray(x.boards) &&
    x.boards.length > 0 &&
    x.boards.every((b) => Array.isArray(b?.categories)) &&
    Array.isArray(x.players) &&
    !!x.final &&
    Array.isArray(x.final.questions)
  );
}

/** Everything we back up / persist to a file. */
export interface SaveData {
  boards: Board[];
  players: Player[];
  final: FinalRound;
  betRound: BetRound;
}

interface GameState {
  boards: Board[]; // [Runda 1, Runda 2]
  players: Player[];
  final: FinalRound;
  betRound: BetRound;
  settings: { soundOn: boolean; musicOn: boolean };

  // --- transient session state (not part of a backup) ---
  phase: Phase;
  round: Round;
  activeClueId: string | null;
  revealedClueIds: string[];
  /** Stack of score changes the host can undo (most recent last). */
  history: ScoreEvent[];
  /** Per-player tallies for the end-of-night awards. */
  stats: Record<string, PlayerStats>;
  /** Scores captured just before the final zeroes them (used for 3rd place). */
  preFinalStandings: Array<{ playerId: string; score: number }>;

  // --- board editing (boardIndex selects Runda 1 or 2) ---
  setBoardName: (boardIndex: number, name: string) => void;
  addCategory: (boardIndex: number) => void;
  updateCategoryTitle: (boardIndex: number, catId: string, title: string) => void;
  deleteCategory: (boardIndex: number, catId: string) => void;
  updateClue: (boardIndex: number, catId: string, clueId: string, patch: Partial<Clue>) => void;

  // --- players ---
  addPlayer: () => void;
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  deletePlayer: (id: string) => void;

  // --- bet round editor ---
  setBetRound: (patch: Partial<BetRound>) => void;

  // --- final (survey editor) ---
  addFinalQuestion: () => void;
  updateFinalQuestion: (qId: string, prompt: string) => void;
  deleteFinalQuestion: (qId: string) => void;
  addFinalAnswer: (qId: string) => void;
  updateFinalAnswer: (qId: string, aId: string, patch: { text?: string; points?: number }) => void;
  deleteFinalAnswer: (qId: string, aId: string) => void;

  // --- settings ---
  setSound: (on: boolean) => void;
  setMusic: (on: boolean) => void;

  // --- scoring / session ---
  openClue: (clueId: string) => void;
  /** Clears the view only — does NOT mark the tile used. */
  closeClue: () => void;
  /** Marks a tile used as its own undoable action (nobody scored). */
  consumeClue: (clueId: string) => void;
  awardPoints: (
    playerId: string,
    amount: number,
    meta?: { clueId?: string; kind?: AwardKind },
  ) => void;
  recordBet: (playerId: string, amount: number) => void;
  undoLast: () => void;
  /** Snapshot the standings, then zero all scores for the final. */
  beginFinal: () => void;
  nextRound: () => void;
  goToBet: () => void;
  goToFinal: () => void;
  backToBoard: () => void;
  resetGame: () => void;

  // --- data management ---
  exportData: () => SaveData;
  importData: (data: SaveData) => void;
  reseed: () => void;

  // --- selectors / helpers ---
  allCluesRevealed: (round: Round) => boolean;
  /** True while a round is still untouched — used to gate the category intro. */
  noCluesRevealed: (round: Round) => boolean;
}

function freshCategory(index: number, values: number[]): Category {
  return {
    id: uid(),
    title: `Kategori ${index + 1}`,
    clues: values.map((value) => ({
      id: uid(),
      value,
      prompt: '',
      answer: '',
    })),
  };
}

/** Immutably map over one board in the boards array. */
function patchBoard(boards: Board[], boardIndex: number, fn: (b: Board) => Board): Board[] {
  return boards.map((b, i) => (i === boardIndex ? fn(b) : b));
}

function freshState() {
  return {
    boards: [makeSeedBoard(), makeSeedBoard2()],
    players: makeSeedPlayers(),
    final: makeSeedFinal(),
    betRound: makeSeedBet(),
    revealedClueIds: [],
    phase: 'board' as Phase,
    round: 0 as Round,
    activeClueId: null,
    history: [] as ScoreEvent[],
    stats: {} as Record<string, PlayerStats>,
    preFinalStandings: [] as Array<{ playerId: string; score: number }>,
  };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...freshState(),
      settings: { soundOn: true, musicOn: true },

      setBoardName: (boardIndex, name) =>
        set((s) => ({ boards: patchBoard(s.boards, boardIndex, (b) => ({ ...b, name })) })),

      addCategory: (boardIndex) =>
        set((s) => ({
          boards: patchBoard(s.boards, boardIndex, (b) => ({
            ...b,
            categories: [
              ...b.categories,
              freshCategory(b.categories.length, boardIndex === 0 ? VALUES : VALUES_2),
            ],
          })),
        })),

      updateCategoryTitle: (boardIndex, catId, title) =>
        set((s) => ({
          boards: patchBoard(s.boards, boardIndex, (b) => ({
            ...b,
            categories: b.categories.map((c) => (c.id === catId ? { ...c, title } : c)),
          })),
        })),

      deleteCategory: (boardIndex, catId) =>
        set((s) => ({
          boards: patchBoard(s.boards, boardIndex, (b) => ({
            ...b,
            categories: b.categories.filter((c) => c.id !== catId),
          })),
        })),

      updateClue: (boardIndex, catId, clueId, patch) =>
        set((s) => ({
          boards: patchBoard(s.boards, boardIndex, (b) => ({
            ...b,
            categories: b.categories.map((c) =>
              c.id === catId
                ? { ...c, clues: c.clues.map((cl) => (cl.id === clueId ? { ...cl, ...patch } : cl)) }
                : c,
            ),
          })),
        })),

      addPlayer: () =>
        set((s) => ({
          players: [
            ...s.players,
            { id: uid(), name: `Spelare ${s.players.length + 1}`, color: randomColor(), score: 0 },
          ],
        })),

      updatePlayer: (id, patch) =>
        set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      deletePlayer: (id) =>
        set((s) => {
          // Purge their traces too, or undo would offer to rewind a player who no
          // longer exists (and silently do nothing).
          const { [id]: _removed, ...stats } = s.stats;
          return {
            players: s.players.filter((p) => p.id !== id),
            stats,
            history: s.history.filter((h) => h.playerId !== id),
            preFinalStandings: s.preFinalStandings.filter((st) => st.playerId !== id),
          };
        }),

      addFinalQuestion: () =>
        set((s) => ({
          final: {
            questions: [...s.final.questions, { id: uid(), prompt: '', answers: [] }],
          },
        })),

      updateFinalQuestion: (qId, prompt) =>
        set((s) => ({
          final: {
            questions: s.final.questions.map((q) => (q.id === qId ? { ...q, prompt } : q)),
          },
        })),

      deleteFinalQuestion: (qId) =>
        set((s) => ({ final: { questions: s.final.questions.filter((q) => q.id !== qId) } })),

      addFinalAnswer: (qId) =>
        set((s) => ({
          final: {
            questions: s.final.questions.map((q) =>
              q.id === qId
                ? { ...q, answers: [...q.answers, { id: uid(), text: '', points: 0 }] }
                : q,
            ),
          },
        })),

      updateFinalAnswer: (qId, aId, patch) =>
        set((s) => ({
          final: {
            questions: s.final.questions.map((q) =>
              q.id === qId
                ? { ...q, answers: q.answers.map((a) => (a.id === aId ? { ...a, ...patch } : a)) }
                : q,
            ),
          },
        })),

      deleteFinalAnswer: (qId, aId) =>
        set((s) => ({
          final: {
            questions: s.final.questions.map((q) =>
              q.id === qId ? { ...q, answers: q.answers.filter((a) => a.id !== aId) } : q,
            ),
          },
        })),

      setBetRound: (patch) => set((s) => ({ betRound: { ...s.betRound, ...patch } })),

      setSound: (on) => set((s) => ({ settings: { ...s.settings, soundOn: on } })),
      setMusic: (on) => set((s) => ({ settings: { ...s.settings, musicOn: on } })),

      openClue: (clueId) => set({ activeClueId: clueId, phase: 'clue' }),

      // Only clears the view. Marking the tile used is a separate, explicit action
      // (`consumeClue`, or the `clueId` passed to `awardPoints`) so that consuming a
      // tile is always atomic with the action that caused it — otherwise an undo
      // landing between the two would leave the tile burned with no way back.
      closeClue: () => set({ phase: 'board', activeClueId: null }),

      consumeClue: (clueId) =>
        set((s) => {
          if (s.revealedClueIds.includes(clueId)) return {};
          return {
            revealedClueIds: [...s.revealedClueIds, clueId],
            history: [
              ...s.history,
              { playerId: null, playerName: null, delta: 0, clueId, kind: 'clue' as AwardKind },
            ],
          };
        }),

      awardPoints: (playerId, amount, meta) =>
        set((s) => {
          const player = s.players.find((p) => p.id === playerId);
          if (!player) return {};
          const players = s.players.map((p) =>
            p.id === playerId ? { ...p, score: p.score + amount } : p,
          );

          // Tally for the end-of-night awards. `kind` keeps the counts honest —
          // e.g. a positive final-round delta must not count as a correct clue.
          const kind: AwardKind = meta?.kind ?? 'clue';
          const prev = s.stats[playerId] ?? emptyStats();
          const next: PlayerStats = { ...prev };
          if (amount > 0) next.earned += amount;
          else if (amount < 0) next.lost += -amount;
          if (kind === 'final') {
            next.finalPoints += Math.max(0, amount);
          } else if (kind === 'clue') {
            // only actual clue answers count as right/wrong — a lost bet isn't a "fel"
            if (amount > 0) next.correct += 1;
            else if (amount < 0) next.wrong += 1;
          }
          const stats = { ...s.stats, [playerId]: next };

          // Consume the tile in the same update as the award, so undo can never land
          // between the two.
          const clueId = meta?.clueId;
          const revealedClueIds =
            clueId && !s.revealedClueIds.includes(clueId)
              ? [...s.revealedClueIds, clueId]
              : s.revealedClueIds;

          // Only clue actions are undoable. Bet/final awards still feed `stats`, but
          // rewinding them from the board later would desync those screens.
          const undoable = kind === 'clue' && (amount !== 0 || !!clueId);
          if (!undoable) return { players, stats, revealedClueIds };

          const event: ScoreEvent = {
            playerId,
            playerName: player.name,
            delta: amount,
            clueId,
            kind,
          };
          return { players, stats, revealedClueIds, history: [...s.history, event] };
        }),

      recordBet: (playerId, amount) =>
        set((s) => {
          const prev = s.stats[playerId] ?? emptyStats();
          return { stats: { ...s.stats, [playerId]: { ...prev, bet: Math.max(prev.bet, amount) } } };
        }),

      undoLast: () =>
        set((s) => {
          const last = s.history[s.history.length - 1];
          if (!last) return {};

          const revealedClueIds = last.clueId
            ? s.revealedClueIds.filter((id) => id !== last.clueId)
            : s.revealedClueIds;

          // tile-open-only entry: nothing to unwind but the tile itself
          if (last.playerId === null) {
            return { revealedClueIds, history: s.history.slice(0, -1) };
          }

          // roll the stats tally back too, so a misclick doesn't skew the awards
          const prev = s.stats[last.playerId] ?? emptyStats();
          const reverted: PlayerStats = { ...prev };
          if (last.delta > 0) reverted.earned = Math.max(0, reverted.earned - last.delta);
          else if (last.delta < 0) reverted.lost = Math.max(0, reverted.lost + last.delta);
          if (last.kind === 'final') {
            reverted.finalPoints = Math.max(0, reverted.finalPoints - Math.max(0, last.delta));
          } else if (last.kind === 'clue') {
            if (last.delta > 0) reverted.correct = Math.max(0, reverted.correct - 1);
            else if (last.delta < 0) reverted.wrong = Math.max(0, reverted.wrong - 1);
          }

          return {
            players: s.players.map((p) =>
              p.id === last.playerId ? { ...p, score: p.score - last.delta } : p,
            ),
            revealedClueIds, // if the action consumed a tile, make it playable again
            stats: { ...s.stats, [last.playerId]: reverted },
            history: s.history.slice(0, -1),
          };
        }),

      beginFinal: () =>
        set((s) => ({
          // Idempotent: after the first call every score is 0, so re-snapshotting
          // (e.g. host backs out of the final and restarts it) would wipe the
          // standings that 3rd place and finalist selection depend on.
          preFinalStandings: s.preFinalStandings.length
            ? s.preFinalStandings
            : s.players.map((p) => ({ playerId: p.id, score: p.score })),
          players: s.players.map((p) => ({ ...p, score: 0 })),
          history: [],
        })),

      nextRound: () => set({ round: 1, phase: 'board', activeClueId: null }),
      goToBet: () => set({ phase: 'bet', activeClueId: null }),
      goToFinal: () => set({ phase: 'final', activeClueId: null }),
      backToBoard: () => set({ phase: 'board', activeClueId: null }),

      resetGame: () =>
        set((s) => ({
          players: s.players.map((p) => ({ ...p, score: 0 })),
          revealedClueIds: [],
          phase: 'board',
          round: 0,
          activeClueId: null,
          history: [],
          stats: {},
          preFinalStandings: [],
        })),

      exportData: () => {
        const { boards, players, final, betRound } = get();
        return { boards, players, final, betRound };
      },

      importData: (data) =>
        set(() => ({
          boards: data.boards,
          players: (data.players ?? []).map((p) => ({ ...p, score: p.score ?? 0 })),
          final: data.final,
          betRound: data.betRound ?? makeSeedBet(),
          revealedClueIds: [],
          phase: 'board',
          round: 0,
          activeClueId: null,
          history: [],
          stats: {},
          preFinalStandings: [],
        })),

      reseed: () => set(() => freshState()),

      allCluesRevealed: (round) => {
        const { boards, revealedClueIds } = get();
        const board = boards[round];
        if (!board) return false;
        const revealed = new Set(revealedClueIds);
        const all = board.categories.flatMap((c) => c.clues);
        return all.length > 0 && all.every((c) => revealed.has(c.id));
      },

      noCluesRevealed: (round) => {
        const { boards, revealedClueIds } = get();
        const board = boards[round];
        if (!board) return false;
        const revealed = new Set(revealedClueIds);
        return board.categories.every((c) => c.clues.every((cl) => !revealed.has(cl.id)));
      },
    }),
    {
      name: 'obb-state',
      version: 3,
      storage: createJSONStorage(() => idbStorage),
      // Persist content + settings + session progress; drop the live view state.
      partialize: (s) => ({
        boards: s.boards,
        players: s.players,
        final: s.final,
        betRound: s.betRound,
        settings: s.settings,
        round: s.round,
        revealedClueIds: s.revealedClueIds,
        history: s.history,
        stats: s.stats,
        preFinalStandings: s.preFinalStandings,
      }),
      migrate: (persisted, version) => {
        // v1 had a single `board` + wager final — incompatible; discard & reseed.
        if (version < 2 || !persisted || !(persisted as { boards?: unknown }).boards) {
          return { ...freshState(), settings: { soundOn: true, musicOn: true } } as unknown as GameState;
        }
        // v2 → v3: bet round added. Keep everything, inject a default bet round.
        const p = persisted as Partial<GameState>;
        if (!p.betRound) p.betRound = makeSeedBet();
        return p as GameState;
      },
    },
  ),
);

export { VALUES, VALUES_2 };
