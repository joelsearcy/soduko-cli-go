// TypeScript type definitions for the Sudoku application

// Import Sudoku utility types
import type {
  Board,
  Difficulty,
  ValidationError,
  ValidationResult,
  HintResult,
  GeneratedBoard,
} from '../utils/sudoku';

// Re-export for convenience
export type { Board, Difficulty, ValidationError, ValidationResult, HintResult, GeneratedBoard };

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

// Legacy API types for backward compatibility
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
  errors?: ValidationError[];
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
