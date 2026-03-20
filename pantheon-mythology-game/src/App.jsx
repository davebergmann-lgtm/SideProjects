import { useState, useCallback } from 'react';
import { LandingScreen } from './components/screens/LandingScreen';
import { GameSetupScreen } from './components/screens/GameSetupScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { MultiplayerScreen } from './components/screens/MultiplayerScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ProfileSelectScreen } from './components/screens/ProfileSelectScreen';
import { CharacterCreationScreen } from './components/screens/CharacterCreationScreen';
import { InstructionsScreen } from './components/screens/InstructionsScreen';
import {
  loadPlayer, updatePlayer, savePlayer, defaultPlayer,
  getActiveProfileName, setActiveProfileName,
} from './store/gameStore';
import { savePlayerToCloud, loadPlayerFromCloud } from './store/cloudStore';

function getInitialScreen() {
  const active = getActiveProfileName();
  return active ? 'landing' : 'profileSelect';
}

function getInitialPlayer() {
  const active = getActiveProfileName();
  return active ? loadPlayer(active) : null;
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen);
  const [player, setPlayer] = useState(getInitialPlayer);
  const [gameConfig, setGameConfig] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [prevPlayer, setPrevPlayer] = useState(null);
  // Where to return after character creation ('landing' or 'profile')
  const [characterReturnTo, setCharacterReturnTo] = useState('landing');

  // cloudPlayer is provided when the cloud was consulted (new profile or cross-device login)
  const handleProfileSelect = (name, isNew, cloudPlayer) => {
    setActiveProfileName(name);
    // Use cloud data if provided, otherwise fall back to local cache
    const p = cloudPlayer || loadPlayer(name);
    setPlayer(p);

    // Background-sync existing local profiles against the cloud
    if (!isNew && !cloudPlayer) {
      loadPlayerFromCloud(name).then(remote => {
        if (remote) {
          savePlayer(remote); // update local cache
          setPlayer(remote);
        }
      });
    }

    if (isNew || !p.character) {
      setCharacterReturnTo('landing');
      setScreen('characterCreation');
    } else {
      setScreen('landing');
    }
  };

  const handleCharacterComplete = (character) => {
    const updated = { ...player, character };
    savePlayer(updated);
    savePlayerToCloud(updated); // fire-and-forget cloud sync
    setPlayer(updated);
    setScreen(characterReturnTo);
  };

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
    savePlayerToCloud(updatedPlayer); // fire-and-forget cloud sync
    setPlayer(updatedPlayer);
    setGameResults(results);
    setScreen('results');
  }, [player]);

  const handleReset = () => {
    const name = player.name;
    const fresh = { ...defaultPlayer, name };
    savePlayer(fresh);
    savePlayerToCloud(fresh); // sync reset to cloud
    setPlayer(fresh);
    setScreen('landing');
  };

  const handleSwitchProfile = () => {
    setPlayer(null);
    setActiveProfileName('');
    setScreen('profileSelect');
  };

  const activeConfig = gameConfig
    ? { ...gameConfig, mode: gameConfig.mode || 'solo' }
    : null;

  return (
    <div className="font-sans antialiased">
      {screen === 'profileSelect' && (
        <ProfileSelectScreen onSelect={handleProfileSelect} />
      )}
      {screen === 'characterCreation' && player && (
        <CharacterCreationScreen
          player={player}
          onComplete={handleCharacterComplete}
          onBack={characterReturnTo === 'profile' ? () => setScreen('profile') : null}
        />
      )}
      {screen === 'landing' && player && (
        <LandingScreen
          player={player}
          onStart={handleStartSetup}
          onMultiplayer={() => setScreen('multiplayer')}
          onProfile={() => setScreen('profile')}
          onInstructions={() => setScreen('instructions')}
        />
      )}
      {screen === 'instructions' && (
        <InstructionsScreen onBack={() => setScreen('landing')} />
      )}
      {screen === 'setup' && player && (
        <GameSetupScreen
          player={player}
          onStart={handleStartGame}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'game' && activeConfig && player && (
        <GameScreen
          config={activeConfig}
          player={player}
          onComplete={handleGameComplete}
          onQuit={() => setScreen('landing')}
        />
      )}
      {screen === 'results' && gameResults && player && (
        <ResultsScreen
          results={gameResults}
          player={player}
          previousPlayer={prevPlayer}
          onPlayAgain={() => setScreen('setup')}
          onHome={() => setScreen('landing')}
        />
      )}
      {screen === 'multiplayer' && player && (
        <MultiplayerScreen
          player={player}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'profile' && player && (
        <ProfileScreen
          player={player}
          onBack={() => setScreen('landing')}
          onReset={handleReset}
          onChangeCharacter={() => {
            setCharacterReturnTo('profile');
            setScreen('characterCreation');
          }}
          onSwitchProfile={handleSwitchProfile}
        />
      )}
    </div>
  );
}
