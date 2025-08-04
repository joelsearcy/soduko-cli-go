import { useState, useEffect } from 'react';
import {
  Box,
  Popover,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close, Backspace } from '@mui/icons-material';
import { useGame, gameActions } from '../store/GameContext';
import { SudokuApiClient } from '../api/client';

const apiClient = new SudokuApiClient();

interface DigitPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  row: number;
  col: number;
}

const DigitPopover = ({ open, anchorEl, onClose, row, col }: DigitPopoverProps) => {
  const { state, dispatch } = useGame();
  const [validNumbers, setValidNumbers] = useState<number[]>([]);
  const [isLoadingHints, setIsLoadingHints] = useState(false);

  // Calculate valid numbers for current position
  const calculateValidNumbers = (board: number[][], row: number, col: number): number[] => {
    const valid: number[] = [];
    
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
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
          for (let j = startCol; j < startCol + 3; j++) {
            if (i !== row && j !== col && board[i][j] === num) {
              isValid = false;
              break;
            }
          }
          if (!isValid) break;
        }
      }
      
      if (isValid) {
        valid.push(num);
      }
    }
    
    return valid;
  };

  // Fetch hints when popover opens and hint mode is enabled
  useEffect(() => {
    if (open) {
      if (state.isHintMode) {
        const fetchHints = async () => {
          try {
            setIsLoadingHints(true);
            const hints = await apiClient.getHint({
              board: state.board,
              row,
              col,
            });
            setValidNumbers(hints.validNumbers);
          } catch (error) {
            console.error('Failed to fetch hints:', error);
            // If hints fail, fallback to local calculation
            setValidNumbers(calculateValidNumbers(state.board, row, col));
          } finally {
            setIsLoadingHints(false);
          }
        };
        fetchHints();
      } else {
        // When not in hint mode, calculate valid numbers locally
        setValidNumbers(calculateValidNumbers(state.board, row, col));
      }
    }
  }, [open, state.isHintMode, state.board, row, col]);

  const handleNumberClick = (number: number) => {
    // Only allow valid moves
    if (validNumbers.includes(number)) {
      dispatch(gameActions.setCellValue(row, col, number));
      onClose();
    }
  };

  const handleClear = () => {
    dispatch(gameActions.clearCell(row, col));
    onClose();
  };

  const isNumberValid = (number: number) => {
    return validNumbers.includes(number);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
    >
      <Paper sx={{ p: 2, minWidth: 200 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Select Number
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Loading indicator */}
        {isLoadingHints && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Number grid (3x3) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            mb: 2,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
            const isValid = isNumberValid(number);
            return (
              <IconButton
                key={number}
                onClick={() => handleNumberClick(number)}
                disabled={!isValid}
                sx={{
                  width: 50,
                  height: 50,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: isValid ? 'background.paper' : 'action.disabled',
                  color: isValid ? 'text.primary' : 'text.disabled',
                  '&:hover': {
                    backgroundColor: isValid ? 'primary.light' : 'action.disabled',
                  },
                  '&:disabled': {
                    color: 'text.disabled',
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {number}
                </Typography>
              </IconButton>
            );
          })}
        </Box>

        {/* Clear button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={handleClear}
            sx={{
              width: 50,
              height: 50,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Backspace />
          </IconButton>
        </Box>

        {/* Hint mode info - always present to prevent layout shift */}
        <Box sx={{ height: '20px', mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {state.isHintMode && !isLoadingHints && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Gray numbers are invalid for this cell
            </Typography>
          )}
        </Box>
      </Paper>
    </Popover>
  );
};

export default DigitPopover;
