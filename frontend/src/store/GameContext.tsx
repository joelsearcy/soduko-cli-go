import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { GameState, Board, Difficulty } from '../types';

// Initial state
const initialState: GameState = {
  board: Array(9).fill(null).map(() => Array(9).fill(0)),
  originalBoard: Array(9).fill(null).map(() => Array(9).fill(0)),
  mutableCells: Array(9).fill(null).map(() => Array(9).fill(true)),
  selectedCell: null,
  isHintMode: false,
  difficulty: 'easy',
  isLoading: false,
  error: null,
  moveCount: 0,
  isCompleted: false,
};

// Action types
type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOARD'; payload: { board: Board; originalBoard: Board } }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_SELECTED_CELL'; payload: { row: number; col: number } | null }
  | { type: 'SET_CELL_VALUE'; payload: { row: number; col: number; value: number } }
  | { type: 'TOGGLE_HINT_MODE' }
  | { type: 'CLEAR_CELL'; payload: { row: number; col: number } }
  | { type: 'SET_COMPLETION'; payload: boolean }
  | { type: 'RESET_GAME' };

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_BOARD':
      const { board, originalBoard } = action.payload;
      const mutableCells = originalBoard.map(row =>
        row.map(cell => cell === 0)
      );
      return {
        ...state,
        board: board.map(row => [...row]), // Deep copy
        originalBoard: originalBoard.map(row => [...row]), // Deep copy
        mutableCells,
        selectedCell: null,
        isLoading: false,
        error: null,
        moveCount: 0,
        isCompleted: false,
      };
    
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    
    case 'SET_SELECTED_CELL':
      return { ...state, selectedCell: action.payload };
    
    case 'SET_CELL_VALUE':
      const { row, col, value } = action.payload;
      if (!state.mutableCells[row][col]) return state; // Cell is not mutable
      
      const newBoard = state.board.map((boardRow, i) =>
        boardRow.map((cell, j) => (i === row && j === col ? value : cell))
      );
      return { 
        ...state, 
        board: newBoard, 
        moveCount: state.moveCount + 1 
      };
    
    case 'TOGGLE_HINT_MODE':
      return { ...state, isHintMode: !state.isHintMode };
    
    case 'CLEAR_CELL':
      const { row: clearRow, col: clearCol } = action.payload;
      if (!state.mutableCells[clearRow][clearCol]) return state; // Cell is not mutable
      
      const clearedBoard = state.board.map((boardRow, i) =>
        boardRow.map((cell, j) => (i === clearRow && j === clearCol ? 0 : cell))
      );
      return { 
        ...state, 
        board: clearedBoard, 
        moveCount: state.moveCount + 1 
      };
    
    case 'SET_COMPLETION':
      return { ...state, isCompleted: action.payload };
    
    case 'RESET_GAME':
      return {
        ...state,
        board: state.originalBoard.map(row => [...row]), // Reset to original
        selectedCell: null,
        error: null,
        moveCount: 0,
        isCompleted: false,
      };
    
    default:
      return state;
  }
};

// Context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Export action creators for convenience
export const gameActions = {
  setLoading: (loading: boolean): GameAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): GameAction => ({ type: 'SET_ERROR', payload: error }),
  setBoard: (board: Board, originalBoard: Board): GameAction => ({ 
    type: 'SET_BOARD', 
    payload: { board, originalBoard } 
  }),
  setDifficulty: (difficulty: Difficulty): GameAction => ({ type: 'SET_DIFFICULTY', payload: difficulty }),
  setSelectedCell: (cell: { row: number; col: number } | null): GameAction => ({ 
    type: 'SET_SELECTED_CELL', 
    payload: cell 
  }),
  setCellValue: (row: number, col: number, value: number): GameAction => ({ 
    type: 'SET_CELL_VALUE', 
    payload: { row, col, value } 
  }),
  toggleHintMode: (): GameAction => ({ type: 'TOGGLE_HINT_MODE' }),
  clearCell: (row: number, col: number): GameAction => ({ 
    type: 'CLEAR_CELL', 
    payload: { row, col } 
  }),
  setCompletion: (completed: boolean): GameAction => ({ type: 'SET_COMPLETION', payload: completed }),
  resetGame: (): GameAction => ({ type: 'RESET_GAME' }),
};
