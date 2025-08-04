import { useState } from 'react';
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
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Refresh,
  Help,
  HelpOutline,
} from '@mui/icons-material';
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
      </Box>
    </Box>
  );
};

export default SudokuGame;
