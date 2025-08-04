import { Box, Paper } from '@mui/material';
import { useGame, gameActions } from '../store/GameContext';
import SudokuCell from './SudokuCell.tsx';

const SudokuBoard = () => {
  const { state, dispatch } = useGame();

  const handleCellClick = (row: number, col: number) => {
    // Only allow selection of mutable cells
    if (state.mutableCells[row][col]) {
      dispatch(gameActions.setSelectedCell({ row, col }));
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'inline-block',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(9, 1fr)',
          gap: '1px',
          backgroundColor: 'divider',
          border: 2,
          borderColor: 'primary.main',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {state.board.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              value={value}
              row={rowIndex}
              col={colIndex}
              isSelected={
                state.selectedCell?.row === rowIndex &&
                state.selectedCell?.col === colIndex
              }
              isMutable={state.mutableCells[rowIndex][colIndex]}
              onClick={handleCellClick}
            />
          ))
        )}
      </Box>
    </Paper>
  );
};

export default SudokuBoard;
