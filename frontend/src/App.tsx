import { Container, Box } from '@mui/material';
import { CustomThemeProvider } from './store/ThemeContext';
import { GameProvider } from './store/GameContext';
import SudokuGame from './pages/SudokuGame.tsx';

function App() {
  console.log('App component loading...');
  return (
    <CustomThemeProvider>
      <GameProvider>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <SudokuGame />
          </Box>
        </Container>
      </GameProvider>
    </CustomThemeProvider>
  );
}

export default App;
