import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { questions, DIFFICULTY, MYTHOLOGIES } from '../../data/questions';

// Lightweight in-browser multiplayer simulation using localStorage events
// In production, replace with Socket.io server
const ROOM_KEY = 'pantheon_room_';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function MultiplayerScreen({ player, onBack }) {
  const [mode, setMode] = useState('menu'); // menu | create | join | lobby | game | results
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [room, setRoom] = useState(null);
  const [myAnswers, setMyAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [players, setPlayers] = useState([]);
  const pollRef = useRef(null);

  const syncRoom = () => {
    try {
      const data = localStorage.getItem(ROOM_KEY + roomCode);
      if (data) setRoom(JSON.parse(data));
    } catch {}
  };

  const writeRoom = (update) => {
    try {
      const current = JSON.parse(localStorage.getItem(ROOM_KEY + roomCode) || '{}');
      const merged = { ...current, ...update };
      localStorage.setItem(ROOM_KEY + roomCode, JSON.stringify(merged));
      setRoom(merged);
    } catch {}
  };

  // Poll room state (simulates real-time)
  useEffect(() => {
    if (!roomCode || mode === 'menu' || mode === 'create') return;
    pollRef.current = setInterval(syncRoom, 1000);
    return () => clearInterval(pollRef.current);
  }, [roomCode, mode]);

  const createRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    const newRoom = {
      code,
      host: player.name,
      players: [{ name: player.name, xp: player.xp, level: player.level, score: 0 }],
      status: 'waiting', // waiting | playing | done
      questions: questions
        .filter(q => ['initiate', 'adept'].includes(q.difficulty))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(q => ({ ...q })),
      currentIndex: 0,
      answers: {},
    };
    localStorage.setItem(ROOM_KEY + code, JSON.stringify(newRoom));
    setRoom(newRoom);
    setMode('lobby');
  };

  const joinRoom = () => {
    const code = inputCode.toUpperCase().trim();
    const data = localStorage.getItem(ROOM_KEY + code);
    if (!data) {
      alert('Room not found. Make sure the host is on the same device/browser for this demo mode.');
      return;
    }
    const r = JSON.parse(data);
    if (r.status !== 'waiting') {
      alert('Game already in progress.');
      return;
    }
    const updated = {
      ...r,
      players: [...r.players.filter(p => p.name !== player.name),
        { name: player.name, xp: player.xp, level: player.level, score: 0 }],
    };
    localStorage.setItem(ROOM_KEY + code, JSON.stringify(updated));
    setRoom(updated);
    setRoomCode(code);
    setMode('lobby');
  };

  const startGame = () => {
    writeRoom({ status: 'playing', currentIndex: 0 });
    setMode('game');
  };

  const handleAnswer = (answer) => {
    if (revealed || !room) return;
    const currentQ = room.questions[currentIndex];
    setSelectedAnswer(answer);
    setRevealed(true);

    const isCorrect = answer === currentQ.answer;
    const xp = isCorrect ? currentQ.xp : 0;

    // Update my score in room
    const updatedPlayers = room.players.map(p =>
      p.name === player.name ? { ...p, score: (p.score || 0) + (isCorrect ? 100 : 0) } : p
    );
    writeRoom({ players: updatedPlayers });
    setMyAnswers(prev => [...prev, { isCorrect, xpEarned: xp }]);
  };

  const nextQuestion = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= room.questions.length) {
      setMode('results');
    } else {
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setRevealed(false);
    }
  };

  // ─── MENU ───
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <header className="pt-8 px-6 flex items-center gap-3">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-200 text-2xl">←</button>
          <h2 className="text-2xl font-black text-amber-400">Pantheon Battle</h2>
        </header>

        <main className="flex-1 px-6 py-8 max-w-sm mx-auto w-full space-y-4">
          <div className="bg-purple-900/30 border border-purple-700/40 rounded-2xl p-5 text-center space-y-2">
            <div className="text-4xl">👥</div>
            <p className="text-stone-300 text-sm">
              Share a room code with friends via <strong className="text-white">Zoom chat, WhatsApp, Teams,</strong> or any messaging app. Everyone joins on their own device while the host screen-shares.
            </p>
          </div>

          <Button variant="myth" size="xl" className="w-full" onClick={createRoom}>
            🏛️ Create Room (Host)
          </Button>

          <div className="text-center text-stone-600 text-sm">— or —</div>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter room code"
              maxLength={6}
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest font-bold text-amber-400 focus:outline-none focus:border-amber-500"
            />
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={inputCode.length < 4}
              onClick={joinRoom}
            >
              🚀 Join Room
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ─── LOBBY ───
  if (mode === 'lobby') {
    const isHost = room?.host === player.name;
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <header className="pt-8 px-6">
          <h2 className="text-2xl font-black text-amber-400">Game Lobby</h2>
        </header>

        <main className="flex-1 px-6 py-6 max-w-sm mx-auto w-full space-y-5">
          {/* Room code */}
          <div className="bg-stone-900 border border-amber-600/40 rounded-2xl p-5 text-center">
            <div className="text-stone-400 text-sm mb-1">Share this code</div>
            <div className="text-5xl font-black tracking-widest text-amber-400">{roomCode}</div>
            <div className="text-stone-500 text-xs mt-2">
              📋 Copy & paste into Zoom chat, WhatsApp, Teams...
            </div>
          </div>

          {/* Players */}
          <div className="space-y-2">
            <div className="text-stone-400 text-xs uppercase tracking-wider">Players ({room?.players?.length || 0})</div>
            {room?.players?.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-stone-900/60 rounded-xl px-4 py-2.5 border border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{i === 0 ? '👑' : '⚔️'}</span>
                  <span className="font-semibold">{p.name}</span>
                  {p.name === player.name && <span className="text-xs text-stone-500">(you)</span>}
                </div>
                <span className="text-amber-400 text-sm">Lv.{p.level}</span>
              </div>
            ))}
          </div>

          {isHost ? (
            <Button
              variant="primary"
              size="xl"
              className="w-full"
              disabled={!room?.players || room.players.length < 1}
              onClick={startGame}
            >
              ⚡ Start Battle!
            </Button>
          ) : (
            <div className="text-center text-stone-400 animate-pulse py-4">
              Waiting for host to start...
            </div>
          )}

          <Button variant="ghost" className="w-full" onClick={onBack}>Leave Room</Button>
        </main>
      </div>
    );
  }

  // ─── GAME ───
  if (mode === 'game' && room) {
    const currentQ = room.questions[currentIndex];
    if (!currentQ) return null;
    const mythInfo = MYTHOLOGIES[currentQ.mythology?.toUpperCase()] || { emoji: '🌍', color: '#888', name: 'Cross' };

    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <div className="px-4 pt-4 pb-2 flex justify-between items-center text-sm">
          <span className="text-stone-400">Q{currentIndex + 1}/{room.questions.length}</span>
          <div className="flex gap-3">
            {room.players.map(p => (
              <span key={p.name} className="text-xs">
                {p.name === player.name ? '⚔️' : '👤'} {p.score || 0}
              </span>
            ))}
          </div>
        </div>

        <main className="flex-1 px-5 py-3 flex flex-col max-w-2xl mx-auto w-full">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 self-start"
            style={{ backgroundColor: `${mythInfo.color}25`, color: mythInfo.color, border: `1px solid ${mythInfo.color}50` }}
          >
            {mythInfo.emoji} {mythInfo.name.toUpperCase()}
          </div>

          <div className="bg-stone-900/80 rounded-2xl p-5 mb-5 border border-stone-800">
            <p className="text-lg font-semibold">{currentQ.question}</p>
          </div>

          <div className="space-y-2.5 flex-1">
            {currentQ.type === 'true_false' ? (
              <div className="grid grid-cols-2 gap-3">
                {[true, false].map(val => (
                  <AnswerBtn
                    key={String(val)}
                    label={val ? 'TRUE' : 'FALSE'}
                    onClick={() => handleAnswer(val)}
                    state={!revealed ? 'default' : val === currentQ.answer ? 'correct' : val === selectedAnswer ? 'wrong' : 'default'}
                  />
                ))}
              </div>
            ) : (
              currentQ.options?.map(opt => (
                <AnswerBtn
                  key={opt}
                  label={opt}
                  onClick={() => handleAnswer(opt)}
                  state={!revealed ? 'default' : opt === currentQ.answer ? 'correct' : opt === selectedAnswer ? 'wrong' : 'default'}
                />
              ))
            )}
          </div>

          {revealed && (
            <>
              <div className={`mt-4 p-4 rounded-xl border text-sm ${selectedAnswer === currentQ.answer ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200' : 'bg-red-900/30 border-red-700/50 text-red-200'}`}>
                <strong>{selectedAnswer === currentQ.answer ? '✓ Correct! +100 pts' : '✗ Wrong.'}</strong>
                <br />{currentQ.explanation}
              </div>
              <Button variant="primary" size="lg" className="w-full mt-4" onClick={nextQuestion}>
                {currentIndex + 1 >= room.questions.length ? '🏆 Results' : 'Next →'}
              </Button>
            </>
          )}
        </main>
      </div>
    );
  }

  // ─── RESULTS ───
  if (mode === 'results' && room) {
    const myScore = room.players.find(p => p.name === player.name)?.score || 0;
    const sorted = [...(room.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <header className="pt-10 text-center px-6">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-3xl font-black text-amber-400">Pantheon Battle</h2>
          <p className="text-stone-400 text-sm">Final Standings</p>
        </header>

        <main className="flex-1 px-5 py-6 max-w-sm mx-auto w-full space-y-3">
          {sorted.map((p, i) => (
            <div
              key={p.name}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                i === 0 ? 'bg-amber-900/30 border-amber-600/50' : 'bg-stone-900/60 border-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
                <span className="font-bold">{p.name}</span>
                {p.name === player.name && <span className="text-stone-500 text-xs">(you)</span>}
              </div>
              <span className={`font-black text-lg ${i === 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                {p.score || 0} pts
              </span>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="primary" onClick={() => { setMode('menu'); setMyAnswers([]); setCurrentIndex(0); }}>
              Play Again
            </Button>
            <Button variant="secondary" onClick={onBack}>Home</Button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

function AnswerBtn({ label, onClick, state }) {
  const styles = {
    default: 'border-stone-700 bg-stone-900/60 text-stone-200 hover:border-amber-600 cursor-pointer',
    correct: 'border-emerald-500 bg-emerald-900/40 text-emerald-200 cursor-default',
    wrong: 'border-red-500 bg-red-900/40 text-red-200 opacity-70 cursor-default',
  };
  return (
    <button
      onClick={state === 'default' ? onClick : undefined}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${styles[state]}`}
    >
      {state === 'correct' && '✓ '}{state === 'wrong' && '✗ '}{label}
    </button>
  );
}
