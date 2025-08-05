import type { Board } from './types';
import { isValidPlacement } from './validator';

/**
 * Solves a Sudoku board using backtracking algorithm
 */
export function solveBoard(board: Board): boolean {
  return solveBoardHelper(board, 0, 0, false);
}

/**
 * Helper function for solving board with optional randomization
 */
function solveBoardHelper(board: Board, row: number, col: number, randomize: boolean): boolean {
  if (row === 9) {
    return true;
  }

  let nextRow = row;
  let nextCol = col + 1;
  if (nextCol === 9) {
    nextRow++;
    nextCol = 0;
  }

  // Generate numbers 1-9, optionally randomized
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (randomize) {
    shuffleArray(nums);
  }

  // Skip filled cells
  if (board[row][col] !== 0) {
    return solveBoardHelper(board, nextRow, nextCol, randomize);
  }

  // Try each number
  for (const num of nums) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      if (solveBoardHelper(board, nextRow, nextCol, randomize)) {
        return true;
      }
      board[row][col] = 0;
    }
  }

  return false;
}

/**
 * Creates a completely filled valid Sudoku board
 */
export function createFilledBoard(): Board {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(0));
  fillBoard(board);
  return board;
}

/**
 * Fills an empty board with a valid solution
 */
function fillBoard(board: Board): boolean {
  return solveBoardHelper(board, 0, 0, true);
}

/**
 * Checks if a board has a unique solution
 */
export function hasUniqueSolution(board: Board): boolean {
  const boardCopy = board.map(row => [...row]);
  const counter = { count: 0 };
  countSolutions(boardCopy, 0, 0, counter);
  return counter.count === 1;
}

/**
 * Counts the number of possible solutions for a board
 */
function countSolutions(board: Board, row: number, col: number, counter: { count: number }): void {
  if (counter.count > 1) {
    return; // Early exit if we find more than one solution
  }

  if (row === 9) {
    counter.count++;
    return;
  }

  let nextRow = row;
  let nextCol = col + 1;
  if (nextCol === 9) {
    nextRow++;
    nextCol = 0;
  }

  if (board[row][col] !== 0) {
    countSolutions(board, nextRow, nextCol, counter);
    return;
  }

  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      countSolutions(board, nextRow, nextCol, counter);
      board[row][col] = 0;
    }
  }
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
 * Creates a deep copy of a board
 */
export function copyBoard(board: Board): Board {
  return board.map(row => [...row]);
}
