import { CustomThemeProvider } from './store/ThemeContext';
import { GameProvider } from './store/GameContext';
import SudokuGame from './pages/SudokuGame.tsx';

function App() {
  console.log('App component loading...');
  return (
    <CustomThemeProvider>
      <GameProvider>
        <SudokuGame />
      </GameProvider>
    </CustomThemeProvider>
  );
}

export default App;
