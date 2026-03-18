import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { MYTHOLOGIES, DIFFICULTY } from '../../data/questions';
import { xpForLevel } from '../../store/gameStore';

export function ResultsScreen({ results, player, previousPlayer, onPlayAgain, onHome }) {
  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;
  const xpEarned = results.reduce((s, r) => s + r.xpEarned, 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const leveled = player.level > previousPlayer.level;
  const perfect = correct === total;

  const grade = accuracy >= 90 ? { label: 'Oracle', icon: '💀', color: 'text-purple-400' }
    : accuracy >= 75 ? { label: 'Scholar', icon: '🔥', color: 'text-amber-400' }
    : accuracy >= 60 ? { label: 'Adept', icon: '⚡', color: 'text-blue-400' }
    : { label: 'Initiate', icon: '🌙', color: 'text-stone-400' };

  const xpToNext = xpForLevel(player.level + 1);
  const xpProgress = player.xp - xpForLevel(player.level);
  const xpNeeded = xpToNext - xpForLevel(player.level);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Header */}
      <div className="pt-10 pb-4 text-center px-6">
        {perfect ? (
          <div className="text-5xl mb-2 animate-bounce">💎</div>
        ) : (
          <div className="text-5xl mb-2">{grade.icon}</div>
        )}
        <h2 className={`text-3xl font-black ${grade.color}`}>
          {perfect ? 'PERFECT!' : grade.label}
        </h2>
        {leveled && (
          <div className="mt-2 bg-amber-900/50 border border-amber-500 rounded-xl px-4 py-2 inline-block">
            <span className="text-amber-400 font-bold">⬆ LEVEL UP! Now Level {player.level}</span>
          </div>
        )}
      </div>

      <main className="flex-1 px-5 max-w-lg mx-auto w-full space-y-4">
        {/* Score card */}
        <div className="bg-stone-900/80 rounded-2xl border border-stone-800 p-5">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <ScoreStat label="Correct" value={`${correct}/${total}`} color="text-emerald-400" />
            <ScoreStat label="Accuracy" value={`${accuracy}%`} color="text-amber-400" />
            <ScoreStat label="XP Earned" value={`+${xpEarned}`} color="text-purple-400" />
          </div>

          {/* XP Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Level {player.level}</span>
              <span>{xpProgress} / {xpNeeded} XP to Level {player.level + 1}</span>
            </div>
            <ProgressBar value={xpProgress} max={xpNeeded} color="amber" />
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-2">
          <h3 className="text-stone-400 text-xs uppercase tracking-wider font-semibold">Question Review</h3>
          {results.map((r, i) => {
            const mythInfo = MYTHOLOGIES[r.mythology?.toUpperCase()] || { emoji: '🌍', color: '#888' };
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                  r.isCorrect
                    ? 'bg-emerald-900/20 border-emerald-800/40'
                    : 'bg-red-900/20 border-red-800/40'
                }`}
              >
                <span className="text-base mt-0.5">{r.isCorrect ? '✓' : '✗'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-stone-300 truncate">{r.question.question}</div>
                  {!r.isCorrect && (
                    <div className="text-emerald-400 text-xs mt-0.5">
                      ✓ {String(r.question.answer)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span>{mythInfo.emoji}</span>
                  {r.xpEarned > 0 && (
                    <span className="text-amber-400 text-xs">+{r.xpEarned}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pb-6">
          <Button variant="primary" onClick={onPlayAgain} className="w-full">
            ⚔️ Play Again
          </Button>
          <Button variant="secondary" onClick={onHome} className="w-full">
            🏠 Home
          </Button>
        </div>
      </main>
    </div>
  );
}

function ScoreStat({ label, value, color }) {
  return (
    <div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-stone-500 text-xs">{label}</div>
    </div>
  );
}
