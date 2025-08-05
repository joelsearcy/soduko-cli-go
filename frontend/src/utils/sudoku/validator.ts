import type { Board, ValidationError, ValidationResult } from './types';

/**
 * Validates if placing a number at a specific position is allowed
 */
export function isValidMove(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let j = 0; j < 9; j++) {
    if (j !== col && board[row][j] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (i !== row && board[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (i !== row && j !== col && board[i][j] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates the entire board and returns detailed validation results
 */
export function validateBoard(board: Board): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if board is complete
  let isComplete = true;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        isComplete = false;
        break;
      }
    }
    if (!isComplete) break;
  }

  // Check rows
  for (let i = 0; i < 9; i++) {
    const seen = new Map<number, number>();
    for (let j = 0; j < 9; j++) {
      const val = board[i][j];
      if (val !== 0) {
        if (seen.has(val)) {
          const prevCol = seen.get(val)!;
          errors.push({
            row: i,
            col: j,
            message: `Duplicate ${val} in row ${i + 1} (also at column ${prevCol + 1})`,
          });
        } else {
          seen.set(val, j);
        }
      }
    }
  }

  // Check columns
  for (let j = 0; j < 9; j++) {
    const seen = new Map<number, number>();
    for (let i = 0; i < 9; i++) {
      const val = board[i][j];
      if (val !== 0) {
        if (seen.has(val)) {
          const prevRow = seen.get(val)!;
          errors.push({
            row: i,
            col: j,
            message: `Duplicate ${val} in column ${j + 1} (also at row ${prevRow + 1})`,
          });
        } else {
          seen.set(val, i);
        }
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, [number, number]>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          const val = board[row][col];
          if (val !== 0) {
            if (seen.has(val)) {
              const [prevRow, prevCol] = seen.get(val)!;
              errors.push({
                row,
                col,
                message: `Duplicate ${val} in 3x3 box (also at row ${prevRow + 1}, col ${prevCol + 1})`,
              });
            } else {
              seen.set(val, [row, col]);
            }
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    isComplete,
    errors,
  };
}

/**
 * Checks if a number placement is valid (basic validation)
 */
export function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let j = 0; j < 9; j++) {
    if (board[row][j] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = startRow; i < startRow + 3; i++) {
    for (let j = startCol; j < startCol + 3; j++) {
      if (board[i][j] === num) {
        return false;
      }
    }
  }

  return true;
}
