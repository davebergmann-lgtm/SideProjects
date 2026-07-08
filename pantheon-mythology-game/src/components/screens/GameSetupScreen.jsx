import { useState } from 'react';
import { Button } from '../ui/Button';
import { MYTHOLOGIES, DIFFICULTY } from '../../data/questions';

export function GameSetupScreen({ player, onStart, onBack }) {
  const [selectedMythologies, setSelectedMythologies] = useState(['greek', 'norse', 'cross']);
  const [selectedDifficulty, setSelectedDifficulty] = useState('initiate');
  const [questionCount, setQuestionCount] = useState(10);

  const toggleMythology = (id) => {
    setSelectedMythologies(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(m => m !== id) : prev
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <header className="pt-8 px-6 flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-200 text-2xl">←</button>
        <h2 className="text-2xl font-black text-amber-400">Game Setup</h2>
      </header>

      <main className="flex-1 px-6 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Mythology Selection */}
        <section>
          <h3 className="text-stone-300 font-semibold mb-3 uppercase tracking-wider text-sm">
            Choose Mythologies
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {/* Cross-myth always available */}
            <MythButton
              myth={{ id: 'cross', name: 'Cross-Myth', emoji: '🌍', color: '#888' }}
              selected={selectedMythologies.includes('cross')}
              unlocked={true}
              onClick={() => toggleMythology('cross')}
            />
            {Object.values(MYTHOLOGIES).map(m => (
              <MythButton
                key={m.id}
                myth={m}
                selected={selectedMythologies.includes(m.id)}
                unlocked={player.unlockedMythologies.includes(m.id)}
                unlockLevel={m.unlockLevel}
                onClick={() => {
                  if (player.unlockedMythologies.includes(m.id)) toggleMythology(m.id);
                }}
              />
            ))}
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <h3 className="text-stone-300 font-semibold mb-3 uppercase tracking-wider text-sm">
            Difficulty
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(DIFFICULTY).map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDifficulty === d.id
                    ? 'border-amber-500 bg-amber-900/30'
                    : 'border-stone-700 bg-stone-900/50 hover:border-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{d.icon}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: d.color }}>{d.name}</div>
                    <div className="text-xs text-stone-500">×{d.xpMultiplier} XP</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Question Count */}
        <section>
          <h3 className="text-stone-300 font-semibold mb-3 uppercase tracking-wider text-sm">
            Questions
          </h3>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map(n => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                  questionCount === n
                    ? 'border-amber-500 bg-amber-900/30 text-amber-400'
                    : 'border-stone-700 bg-stone-900/50 text-stone-400 hover:border-stone-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <Button
          variant="primary"
          size="xl"
          className="w-full"
          onClick={() => onStart({ mythologies: selectedMythologies, difficulty: selectedDifficulty, count: questionCount })}
        >
          ⚔️ Begin Quest
        </Button>
      </main>
    </div>
  );
}

function MythButton({ myth, selected, unlocked, unlockLevel, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative ${
        selected && unlocked
          ? 'border-amber-500 bg-amber-900/30'
          : unlocked
          ? 'border-stone-700 bg-stone-900/50 hover:border-stone-500'
          : 'border-stone-800 bg-stone-900/30 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="text-xl">{myth.emoji}</div>
      <div className="text-xs text-stone-400 mt-0.5 truncate">{myth.name}</div>
      {!unlocked && (
        <div className="absolute -top-1 -right-1 bg-stone-700 text-stone-300 text-xs px-1 rounded">
          Lv.{unlockLevel}
        </div>
      )}
    </button>
  );
}
