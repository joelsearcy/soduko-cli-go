import type {
  GenerateBoardRequest,
  GenerateBoardResponse,
  ValidateBoardRequest,
  ValidateBoardResponse,
  HintRequest,
  HintResponse,
} from '../types';

// Mock boards for development
const MOCK_BOARDS = {
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  medium: [
    [0, 2, 0, 6, 0, 8, 0, 0, 0],
    [5, 8, 0, 0, 0, 9, 7, 0, 0],
    [0, 0, 0, 0, 4, 0, 0, 0, 0],
    [3, 7, 0, 0, 0, 0, 5, 0, 0],
    [6, 0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 8, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 9, 8, 0, 0, 0, 3, 6],
    [0, 0, 0, 3, 0, 6, 0, 9, 0],
  ],
  hard: [
    [0, 0, 0, 6, 0, 0, 4, 0, 0],
    [7, 0, 0, 0, 0, 3, 6, 0, 0],
    [0, 0, 0, 0, 9, 1, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 0, 1, 8, 0, 0, 0, 3],
    [0, 0, 0, 3, 0, 6, 0, 4, 5],
    [0, 4, 0, 2, 0, 0, 0, 6, 0],
    [9, 0, 3, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 1, 0, 0],
  ],
  expert: [
    [0, 0, 0, 0, 0, 0, 0, 1, 0],
    [4, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 6, 0, 2],
    [0, 0, 0, 0, 3, 0, 0, 7, 0],
    [5, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 8, 0, 0, 0],
    [0, 6, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 4, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
} as const;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockSudokuApiClient {
  async generateBoard(request: GenerateBoardRequest): Promise<GenerateBoardResponse> {
    await delay(500); // Simulate network delay
    
    const board = MOCK_BOARDS[request.difficulty];
    return {
      board: board.map(row => [...row]), // Deep copy
      difficulty: request.difficulty,
    };
  }

  async validateBoard(request: ValidateBoardRequest): Promise<ValidateBoardResponse> {
    await delay(200);
    
    const { board } = request;
    const errors: Array<{ row: number; col: number; message: string }> = [];
    
    // Check for completion
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
    
    // Basic validation logic (simplified)
    let isValid = true;
    
    // Check rows
    for (let i = 0; i < 9; i++) {
      const seen = new Set<number>();
      for (let j = 0; j < 9; j++) {
        const val = board[i][j];
        if (val !== 0) {
          if (seen.has(val)) {
            isValid = false;
            errors.push({
              row: i,
              col: j,
              message: `Duplicate ${val} in row ${i + 1}`,
            });
          }
          seen.add(val);
        }
      }
    }
    
    // Check columns
    for (let j = 0; j < 9; j++) {
      const seen = new Set<number>();
      for (let i = 0; i < 9; i++) {
        const val = board[i][j];
        if (val !== 0) {
          if (seen.has(val)) {
            isValid = false;
            errors.push({
              row: i,
              col: j,
              message: `Duplicate ${val} in column ${j + 1}`,
            });
          }
          seen.add(val);
        }
      }
    }
    
    return {
      isValid,
      isComplete,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async getHint(request: HintRequest): Promise<HintResponse> {
    await delay(300);
    
    const { board, row, col } = request;
    const validNumbers: number[] = [];
    const invalidNumbers: number[] = [];
    
    for (let num = 1; num <= 9; num++) {
      let isValid = true;
      
      // Check row
      for (let j = 0; j < 9; j++) {
        if (j !== col && board[row][j] === num) {
          isValid = false;
          break;
        }
      }
      
      // Check column
      if (isValid) {
        for (let i = 0; i < 9; i++) {
          if (i !== row && board[i][col] === num) {
            isValid = false;
            break;
          }
        }
      }
      
      // Check 3x3 box
      if (isValid) {
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
          for (let j = boxCol; j < boxCol + 3; j++) {
            if (i !== row && j !== col && board[i][j] === num) {
              isValid = false;
              break;
            }
          }
          if (!isValid) break;
        }
      }
      
      if (isValid) {
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
}

// Create and export a singleton instance
export const mockApiClient = new MockSudokuApiClient();

// Export the class for testing
export { MockSudokuApiClient };
