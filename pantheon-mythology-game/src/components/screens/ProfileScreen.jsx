import { useState } from 'react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { MYTHOLOGIES, ACHIEVEMENTS } from '../../data/questions';
import { xpForLevel } from '../../store/gameStore';

function resetPlayer(name) {
  try { localStorage.removeItem(`pantheon_player_${name}`); } catch {}
}

export function ProfileScreen({ player, onBack, onReset, onChangeCharacter, onSwitchProfile }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const xpToNext = xpForLevel(player.level + 1);
  const xpProgress = player.xp - xpForLevel(player.level);
  const xpNeeded = xpToNext - xpForLevel(player.level);
  const accuracy = player.questionsAnswered > 0
    ? Math.round((player.correctAnswers / player.questionsAnswered) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <header className="pt-8 px-6 flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-200 text-2xl">←</button>
        <h2 className="text-2xl font-black text-amber-400">Profile</h2>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto w-full space-y-5 pb-10">
        {/* Avatar & Level */}
        <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-5 text-center">
          {player.character ? (
            <div
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-5xl mx-auto mb-2"
              style={{
                borderColor: player.character.primary,
                backgroundColor: player.character.bg,
              }}
            >
              {player.character.emoji}
            </div>
          ) : (
            <div className="text-6xl mb-2">𓂀</div>
          )}
          <div className="text-2xl font-black text-stone-100">{player.name}</div>
          {player.character && (
            <div className="text-xs font-semibold mt-0.5" style={{ color: player.character.accent }}>
              {player.character.name} · {player.character.outfitName}
            </div>
          )}
          <div className="text-amber-400 text-lg font-bold mt-1">Level {player.level} Seeker</div>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>XP Progress</span>
              <span>{xpProgress.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
            </div>
            <ProgressBar value={xpProgress} max={xpNeeded} color="amber" />
          </div>

          {onChangeCharacter && (
            <button
              onClick={onChangeCharacter}
              className="mt-3 text-xs text-stone-500 hover:text-amber-400 transition-colors border border-stone-700 hover:border-amber-600/50 rounded-full px-3 py-1"
            >
              ✦ Change Champion
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total XP" value={player.xp.toLocaleString()} icon="⭐" />
          <StatCard label="Games Played" value={player.gamesPlayed} icon="⚔️" />
          <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" />
          <StatCard label="Best Streak" value={`🔥 ${player.bestStreak}`} icon="🔥" />
          <StatCard label="Questions" value={player.questionsAnswered} icon="📜" />
          <StatCard label="Correct" value={player.correctAnswers} icon="✓" />
        </div>

        {/* Unlocked Mythologies */}
        <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
          <h3 className="text-stone-400 text-xs uppercase tracking-wider font-semibold mb-3">
            Pantheons Unlocked
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(MYTHOLOGIES).map(m => {
              const unlocked = player.unlockedMythologies.includes(m.id);
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    unlocked
                      ? 'border-opacity-50 text-stone-200'
                      : 'border-stone-800 text-stone-600 opacity-40'
                  }`}
                  style={unlocked ? { borderColor: m.color, backgroundColor: `${m.color}20`, color: m.color } : {}}
                >
                  <span>{m.emoji}</span>
                  <span>{m.name}</span>
                  {!unlocked && <span className="text-stone-600"> (Lv.{m.unlockLevel})</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mythology breakdown */}
        {Object.keys(player.mythologiesAnswered || {}).length > 0 && (
          <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-4">
            <h3 className="text-stone-400 text-xs uppercase tracking-wider font-semibold mb-3">
              Questions by Mythology
            </h3>
            <div className="space-y-2">
              {Object.entries(player.mythologiesAnswered)
                .sort((a, b) => b[1] - a[1])
                .map(([myth, count]) => {
                  const m = MYTHOLOGIES[myth.toUpperCase()];
                  const max = Math.max(...Object.values(player.mythologiesAnswered));
                  return (
                    <div key={myth} className="flex items-center gap-2 text-sm">
                      <span className="w-5 text-center">{m?.emoji || '🌍'}</span>
                      <span className="text-stone-400 w-24 truncate text-xs">{m?.name || 'Cross-Myth'}</span>
                      <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / max) * 100}%`, backgroundColor: m?.color || '#888' }}
                        />
                      </div>
                      <span className="text-stone-500 text-xs w-4 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Switch Profile */}
        {onSwitchProfile && (
          <Button variant="ghost" size="sm" onClick={onSwitchProfile} className="w-full">
            Switch Profile
          </Button>
        )}

        {/* Reset */}
        <div className="pt-1">
          {!confirmReset ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)} className="w-full">
              Reset Progress
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-red-400 text-sm text-center">Are you sure? All progress will be lost.</p>
              <div className="flex gap-2">
                <Button variant="danger" className="flex-1" onClick={() => { resetPlayer(player.name); onReset(); }}>
                  Yes, Reset
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-stone-900/60 rounded-xl border border-stone-800 p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-black text-stone-100">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}
