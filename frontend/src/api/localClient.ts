import type { Board, Difficulty, ValidationResult, HintResult, GeneratedBoard } from '../utils/sudoku';
import { generateBoard, validateBoard, getHints } from '../utils/sudoku';

/**
 * Local Sudoku service that replaces API calls with direct function calls
 */
export class LocalSudokuService {
  /**
   * Generates a new Sudoku board
   */
  async generateNewBoard(difficulty: Difficulty): Promise<GeneratedBoard> {
    // Simulate async behavior for consistency with API
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = generateBoard(difficulty);
        resolve(result);
      }, 100); // Small delay to show loading state
    });
  }

  /**
   * Validates a board and returns validation results
   */
  async validateBoardAsync(board: Board): Promise<ValidationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = validateBoard(board);
        resolve(result);
      }, 50);
    });
  }

  /**
   * Gets hints for a specific cell
   */
  async getHintsAsync(board: Board, row: number, col: number): Promise<HintResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = getHints(board, row, col);
        resolve(result);
      }, 50);
    });
  }

  /**
   * Synchronous board generation for immediate use
   */
  generateBoardSync(difficulty: Difficulty): GeneratedBoard {
    return generateBoard(difficulty);
  }

  /**
   * Synchronous board validation
   */
  validateBoardSync(board: Board): ValidationResult {
    return validateBoard(board);
  }

  /**
   * Synchronous hints generation
   */
  getHintsSync(board: Board, row: number, col: number): HintResult {
    return getHints(board, row, col);
  }
}

// Export singleton instance
export const localSudokuService = new LocalSudokuService();
