// Sudoku utility types
export type Board = number[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface ValidationError {
  row: number;
  col: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  isComplete: boolean;
  errors: ValidationError[];
}

export interface HintResult {
  validNumbers: number[];
  invalidNumbers: number[];
}

export interface GeneratedBoard {
  board: Board;
  originalBoard: Board;
  difficulty: Difficulty;
}

// Difficulty configuration
export const DIFFICULTY_CONFIG = {
  easy: { minClues: 41, maxClues: 46 },
  medium: { minClues: 35, maxClues: 40 },
  hard: { minClues: 29, maxClues: 34 },
  expert: { minClues: 22, maxClues: 27 },
} as const;
