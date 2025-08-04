import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import DigitPopover from './DigitPopover';

interface SudokuCellProps {
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
  isMutable: boolean;
  onClick: (row: number, col: number) => void;
}

const SudokuCell = ({ value, row, col, isSelected, isMutable, onClick }: SudokuCellProps) => {
  const theme = useMUITheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Determine cell borders for 3x3 box separation
  const getBorderStyle = () => {
    const borderWidth = '2px';
    const borderColor = theme.palette.primary.main;
    const thinBorder = '1px solid';
    const thinBorderColor = theme.palette.divider;

    return {
      borderTop: row % 3 === 0 ? `${borderWidth} solid ${borderColor}` : `${thinBorder} ${thinBorderColor}`,
      borderLeft: col % 3 === 0 ? `${borderWidth} solid ${borderColor}` : `${thinBorder} ${thinBorderColor}`,
      borderRight: col === 8 ? `${borderWidth} solid ${borderColor}` : 'none',
      borderBottom: row === 8 ? `${borderWidth} solid ${borderColor}` : 'none',
    };
  };

  // Determine cell background color
  const getBackgroundColor = () => {
    if (isSelected) {
      return theme.palette.primary.light;
    }
    if (!isMutable) {
      return theme.palette.action.hover;
    }
    return theme.palette.background.paper;
  };

  // Determine text color
  const getTextColor = () => {
    if (isSelected) {
      return theme.palette.primary.contrastText;
    }
    if (!isMutable) {
      return theme.palette.text.primary;
    }
    return theme.palette.primary.main;
  };

  const handleCellClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick(row, col);
    
    if (isMutable) {
      setAnchorEl(event.currentTarget);
      setPopoverOpen(true);
    }
  };

  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        onClick={handleCellClick}
        sx={{
          width: 50,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackgroundColor(),
          cursor: isMutable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          ...getBorderStyle(),
          '&:hover': isMutable ? {
            backgroundColor: isSelected 
              ? theme.palette.primary.main 
              : theme.palette.action.hover,
          } : {},
        }}
      >
        <Typography
          variant="h6"
          fontWeight={isMutable ? 'normal' : 'bold'}
          color={getTextColor()}
          sx={{
            userSelect: 'none',
            fontSize: '1.25rem',
          }}
        >
          {value === 0 ? '' : value}
        </Typography>
      </Box>

      {/* Digit Selection Popover */}
      <DigitPopover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        row={row}
        col={col}
      />
    </>
  );
};

export default SudokuCell;
