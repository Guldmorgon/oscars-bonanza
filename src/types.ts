// Core data model for Oscars Stora Bonanza

export interface Player {
  id: string;
  name: string;
  /** Base64 data URL of the (resized) profile picture, or undefined for a colored initial. */
  avatarDataUrl?: string;
  /** Fallback avatar color when no picture is set. */
  color: string;
  score: number;
}

export interface Clue {
  id: string;
  value: number;
  /** The clue shown to the players. */
  prompt: string;
  /** The correct answer, revealed by the host. */
  answer: string;
  /** Optional image shown together with the prompt. */
  imageDataUrl?: string;
}

export interface Category {
  id: string;
  title: string;
  clues: Clue[];
}

export interface Board {
  id: string;
  name: string;
  categories: Category[];
}

// --- Survey-style ("Family Feud") final ---

/** One accepted answer to a survey question, worth `points` (its survey %). */
export interface SurveyAnswer {
  id: string;
  text: string;
  points: number;
}

export interface SurveyQuestion {
  id: string;
  prompt: string;
  answers: SurveyAnswer[];
}

export interface FinalRound {
  questions: SurveyQuestion[];
}

// --- Betting ("closest guess") round, between Round 2 and the Final ---
export interface BetRound {
  /** Hint shown before the question, so players can gauge their bet. */
  theme: string;
  /** The numeric-answer question, revealed after bets are placed. */
  question: string;
  /** The correct numeric answer; closest guess wins. */
  answer: number;
}

export type Phase = 'board' | 'clue' | 'bet' | 'final';

/** Round index: 0 = Runda 1 (100–500), 1 = Runda 2 (double, 200–1000). */
export type Round = 0 | 1;
