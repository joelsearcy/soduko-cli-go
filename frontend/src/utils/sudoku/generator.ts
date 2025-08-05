import type { Board, Difficulty, GeneratedBoard } from './types';
import { DIFFICULTY_CONFIG } from './types';
import { createFilledBoard, hasUniqueSolution, copyBoard } from './solver';

/**
 * Generates a new Sudoku puzzle with the specified difficulty
 */
export function generateBoard(difficulty: Difficulty): GeneratedBoard {
  // Start with a completely filled board
  const filledBoard = createFilledBoard();
  
  // Create a working copy to remove cells from
  const puzzleBoard = copyBoard(filledBoard);
  
  // Remove cells according to difficulty
  removeCells(puzzleBoard, difficulty);
  
  return {
    board: copyBoard(puzzleBoard), // Current state (what player sees)
    originalBoard: copyBoard(puzzleBoard), // Initial puzzle state
    difficulty,
  };
}

/**
 * Removes cells from a filled board to create a puzzle
 */
function removeCells(board: Board, difficulty: Difficulty): void {
  const config = DIFFICULTY_CONFIG[difficulty];
  const targetClues = Math.floor(Math.random() * (config.maxClues - config.minClues + 1)) + config.minClues;
  const totalCells = 81;
  const cellsToRemove = totalCells - targetClues;
  
  // Create array of all cell positions
  const positions: number[] = [];
  for (let i = 0; i < totalCells; i++) {
    positions.push(i);
  }
  
  // Shuffle positions to randomize removal
  shuffleArray(positions);
  
  let removed = 0;
  let attempts = 0;
  const maxAttempts = totalCells * 2; // Prevent infinite loops
  
  for (let i = 0; i < positions.length && removed < cellsToRemove && attempts < maxAttempts; i++) {
    attempts++;
    const pos = positions[i];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    
    // Skip if already empty
    if (board[row][col] === 0) {
      continue;
    }
    
    // Save original value
    const originalValue = board[row][col];
    
    // Temporarily remove the cell
    board[row][col] = 0;
    
    // Check if the puzzle still has a unique solution
    const boardCopy = copyBoard(board);
    if (hasUniqueSolution(boardCopy)) {
      // Keep the cell removed
      removed++;
    } else {
      // Restore the cell if removing it creates multiple solutions
      board[row][col] = originalValue;
    }
  }
  
  // If we couldn't remove enough cells while maintaining uniqueness,
  // we still have a valid puzzle, just potentially easier than intended
  console.log(`Generated ${difficulty} puzzle with ${81 - countEmptyCells(board)} clues`);
}

/**
 * Counts empty cells in a board
 */
function countEmptyCells(board: Board): number {
  let count = 0;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Validates that a generated board is solvable
 */
export function isBoardSolvable(board: Board): boolean {
  return hasUniqueSolution(board);
}
