import { useState, useCallback } from 'react';
import { LandingScreen } from './components/screens/LandingScreen';
import { GameSetupScreen } from './components/screens/GameSetupScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { MultiplayerScreen } from './components/screens/MultiplayerScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { loadPlayer, updatePlayer, defaultPlayer } from './store/gameStore';

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [player, setPlayer] = useState(() => loadPlayer());
  const [gameConfig, setGameConfig] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [prevPlayer, setPrevPlayer] = useState(null);

  const handleStartSetup = (mode) => {
    setGameConfig({ mode });
    setScreen('setup');
  };

  const handleStartGame = (config) => {
    setGameConfig(prev => ({ ...prev, ...config }));
    setScreen('game');
  };

  const handleGameComplete = useCallback((results) => {
    setPrevPlayer({ ...player });
    let updatedPlayer = { ...player, gamesPlayed: player.gamesPlayed + 1 };
    results.forEach(result => {
      updatedPlayer = updatePlayer(updatedPlayer, result);
    });
    setPlayer(updatedPlayer);
    setGameResults(results);
    setScreen('results');
  }, [player]);

  const handleReset = () => {
    setPlayer({ ...defaultPlayer });
    setScreen('landing');
  };

  const activeConfig = gameConfig
    ? { ...gameConfig, mode: gameConfig.mode || 'solo' }
    : null;

  return (
    <div className="font-sans antialiased">
      {screen === 'landing' && (
        <LandingScreen
          player={player}
          onStart={handleStartSetup}
          onMultiplayer={() => setScreen('multiplayer')}
          onProfile={() => setScreen('profile')}
        />
      )}
      {screen === 'setup' && (
        <GameSetupScreen
          player={player}
          onStart={handleStartGame}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'game' && activeConfig && (
        <GameScreen
          config={activeConfig}
          player={player}
          onComplete={handleGameComplete}
          onQuit={() => setScreen('landing')}
        />
      )}
      {screen === 'results' && gameResults && (
        <ResultsScreen
          results={gameResults}
          player={player}
          previousPlayer={prevPlayer}
          onPlayAgain={() => setScreen('setup')}
          onHome={() => setScreen('landing')}
        />
      )}
      {screen === 'multiplayer' && (
        <MultiplayerScreen
          player={player}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen
          player={player}
          onBack={() => setScreen('landing')}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
