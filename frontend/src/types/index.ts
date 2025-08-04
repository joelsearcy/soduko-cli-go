// TypeScript type definitions for the Sudoku application

export type Board = number[][];

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface GameState {
  board: Board;
  originalBoard: Board;
  mutableCells: boolean[][];
  selectedCell: { row: number; col: number } | null;
  isHintMode: boolean;
  difficulty: Difficulty;
  isLoading: boolean;
  error: string | null;
  moveCount: number;
  isCompleted: boolean;
}

export interface GameStats {
  boardsSolved: number;
  boardsAbandoned: number;
  currentStreak: number;
  bestTime: number | null;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface GenerateBoardRequest {
  difficulty: Difficulty;
}

export interface GenerateBoardResponse {
  board: Board;
  difficulty: Difficulty;
}

export interface ValidateBoardRequest {
  board: Board;
}

export interface ValidateBoardResponse {
  isValid: boolean;
  isComplete: boolean;
  errors?: Array<{
    row: number;
    col: number;
    message: string;
  }>;
}

export interface HintRequest {
  board: Board;
  row: number;
  col: number;
}

export interface HintResponse {
  validNumbers: number[];
  invalidNumbers: number[];
}
