import type { Board, HintResult } from './types';
import { isValidMove } from './validator';

/**
 * Generates hints for a specific cell position
 */
export function getHints(board: Board, row: number, col: number): HintResult {
  const validNumbers: number[] = [];
  const invalidNumbers: number[] = [];
  
  // Check each number from 1-9
  for (let num = 1; num <= 9; num++) {
    if (isValidMove(board, row, col, num)) {
      validNumbers.push(num);
    } else {
      invalidNumbers.push(num);
    }
  }
  
  return {
    validNumbers,
    invalidNumbers,
  };
}

/**
 * Gets a single hint (one valid number) for a cell
 */
export function getSingleHint(board: Board, row: number, col: number): number | null {
  const hints = getHints(board, row, col);
  
  if (hints.validNumbers.length === 0) {
    return null;
  }
  
  // Return a random valid number
  const randomIndex = Math.floor(Math.random() * hints.validNumbers.length);
  return hints.validNumbers[randomIndex];
}

/**
 * Finds the next logical move (cell with fewest possibilities)
 */
export function findBestMove(board: Board): { row: number; col: number; possibilities: number[] } | null {
  let bestCell: { row: number; col: number; possibilities: number[] } | null = null;
  let minPossibilities = 10;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const hints = getHints(board, row, col);
        if (hints.validNumbers.length < minPossibilities) {
          minPossibilities = hints.validNumbers.length;
          bestCell = {
            row,
            col,
            possibilities: hints.validNumbers,
          };
        }
      }
    }
  }
  
  return bestCell;
}

/**
 * Calculates the difficulty score of a board based on solving techniques needed
 */
export function calculateDifficultyScore(board: Board): number {
  let score = 0;
  
  // Count empty cells (more empty = harder)
  let emptyCells = 0;
  
  // Count cells with few possibilities
  let constrainedCells = 0;
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        emptyCells++;
        const hints = getHints(board, row, col);
        
        // Cells with very few possibilities add to difficulty
        if (hints.validNumbers.length <= 2) {
          constrainedCells++;
        }
        
        // Add to score based on constraint level
        score += (9 - hints.validNumbers.length);
      }
    }
  }
  
  // Factor in overall constraint level
  score += constrainedCells * 5;
  score += emptyCells * 2;
  
  return score;
}
