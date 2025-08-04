import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Refresh,
  Help,
  HelpOutline,
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { useGame, gameActions } from '../store/GameContext';
import { useTheme } from '../store/ThemeContext';
import { SudokuApiClient } from '../api/client';
import SudokuBoard from '../components/SudokuBoard.tsx';
import type { Difficulty } from '../types';

const apiClient = new SudokuApiClient();

const SudokuGame = () => {
  const { state, dispatch } = useGame();
  const { mode, toggleTheme } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  // Check for game completion
  const checkGameCompletion = (board: number[][]) => {
    // Check if all cells are filled
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check if the solution is valid
    // Check rows
    for (let i = 0; i < 9; i++) {
      const seen = new Set();
      for (let j = 0; j < 9; j++) {
        if (seen.has(board[i][j])) return false;
        seen.add(board[i][j]);
      }
    }

    // Check columns
    for (let j = 0; j < 9; j++) {
      const seen = new Set();
      for (let i = 0; i < 9; i++) {
        if (seen.has(board[i][j])) return false;
        seen.add(board[i][j]);
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const seen = new Set();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const val = board[boxRow * 3 + i][boxCol * 3 + j];
            if (seen.has(val)) return false;
            seen.add(val);
          }
        }
      }
    }

    return true;
  };

  // Trigger confetti celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Additional confetti bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 }
      });
    }, 250);
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 }
      });
    }, 400);
  };

  // Check for completion whenever the board changes
  useEffect(() => {
    if (!state.isCompleted) {
      const isComplete = checkGameCompletion(state.board);
      if (isComplete) {
        dispatch(gameActions.setCompletion(true));
        triggerConfetti();
      }
    }
  }, [state.board, state.isCompleted, dispatch]);

  const handleNewGame = async (difficulty?: Difficulty) => {
    const targetDifficulty = difficulty || state.difficulty;
    
    try {
      setIsGenerating(true);
      dispatch(gameActions.setLoading(true));
      dispatch(gameActions.setError(null));
      
      const response = await apiClient.generateBoard({ difficulty: targetDifficulty });
      
      dispatch(gameActions.setBoard(response.board, response.board));
      dispatch(gameActions.setDifficulty(targetDifficulty));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate board';
      dispatch(gameActions.setError(errorMessage));
    } finally {
      setIsGenerating(false);
      dispatch(gameActions.setLoading(false));
    }
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    dispatch(gameActions.setDifficulty(difficulty));
    handleNewGame(difficulty);
  };

  const handleToggleHint = () => {
    dispatch(gameActions.toggleHintMode());
  };

  const handleReset = () => {
    dispatch(gameActions.resetGame());
  };

  // Initialize with a board on first load
  useState(() => {
    if (state.board.every(row => row.every(cell => cell === 0))) {
      handleNewGame();
    }
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Sudoku
        </Typography>
        <IconButton onClick={toggleTheme} color="inherit">
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {/* Difficulty Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={state.difficulty}
              label="Difficulty"
              onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
              disabled={isGenerating}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
              <MenuItem value="expert">Expert</MenuItem>
            </Select>
          </FormControl>

          {/* New Game Button */}
          <Button
            variant="contained"
            startIcon={isGenerating ? <CircularProgress size={16} /> : <Refresh />}
            onClick={() => handleNewGame()}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'New Game'}
          </Button>

          {/* Reset Button */}
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={state.isLoading}
          >
            Reset
          </Button>

          {/* Hint Mode Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={state.isHintMode}
                onChange={handleToggleHint}
                icon={<HelpOutline />}
                checkedIcon={<Help />}
              />
            }
            label="Hint Mode"
          />
        </Box>
      </Paper>

      {/* Error Display */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {/* Game Board */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <SudokuBoard />
      </Box>

      {/* Game Info */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Click on a cell to select it, then click a number 1-9 to fill it.
          {state.isHintMode && ' Hint mode will show invalid numbers in gray.'}
        </Typography>
        {state.moveCount > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Moves: {state.moveCount}
          </Typography>
        )}
      </Box>

      {/* Game Completion Dialog */}
      <Dialog
        open={state.isCompleted}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            textAlign: 'center',
            py: 3,
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h4" color="primary" gutterBottom>
            🎉 Congratulations! 🎉
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h5" gutterBottom>
            Solved in {state.moveCount} moves!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Great job completing the {state.difficulty} puzzle!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => handleNewGame()}
            size="large"
          >
            New Game
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => dispatch(gameActions.setCompletion(false))}
            size="large"
          >
            View Solution
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SudokuGame;
