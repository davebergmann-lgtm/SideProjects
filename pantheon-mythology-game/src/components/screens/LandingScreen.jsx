import { Button } from '../ui/Button';
import { MYTHOLOGIES } from '../../data/questions';

const MYTH_ICONS = Object.values(MYTHOLOGIES);

export function LandingScreen({ player, onStart, onMultiplayer, onProfile, onInstructions }) {
  const char = player.character;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 text-center relative">
        <div className="absolute top-4 left-4">
          <button
            onClick={onInstructions}
            className="w-9 h-9 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-200 hover:border-stone-500 transition-all text-sm font-bold"
            title="How to Play"
          >
            ?
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" onClick={onProfile}>
            {char ? (
              <span className="flex items-center gap-1.5">
                <CharacterDot char={char} />
                {player.name} · Lv.{player.level}
              </span>
            ) : (
              `${player.name} · Lv.${player.level}`
            )}
          </Button>
        </div>

        {/* Character avatar or default logo */}
        {char ? (
          <div className="flex flex-col items-center mb-1">
            <div
              className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-4xl mx-auto"
              style={{ borderColor: char.primary, backgroundColor: char.bg }}
            >
              {char.emoji}
            </div>
          </div>
        ) : (
          <div className="text-6xl mb-1">𓂀</div>
        )}
        <h1 className="text-5xl font-black tracking-widest text-amber-400 drop-shadow-lg">
          PANTHEON
        </h1>
        <p className="text-stone-400 text-sm tracking-widest mt-1 uppercase">
          The Ultimate Mythology Challenge
        </p>
        {char && (
          <p className="text-xs mt-1 font-semibold" style={{ color: char.accent }}>
            {char.name} · {char.outfitName}
          </p>
        )}
      </header>

      {/* Mythology ribbon */}
      <div className="flex justify-center gap-3 flex-wrap px-4 py-3">
        {MYTH_ICONS.map(m => (
          <div
            key={m.id}
            title={m.name}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all hover:scale-110 ${
              player.unlockedMythologies.includes(m.id)
                ? 'border-amber-500 bg-stone-800'
                : 'border-stone-700 bg-stone-900 opacity-40 grayscale'
            }`}
            style={{ borderColor: player.unlockedMythologies.includes(m.id) ? m.color : undefined }}
          >
            {m.emoji}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 -mt-4">
        {/* Game modes */}
        <div className="w-full max-w-sm grid grid-cols-1 gap-3">
          <GameModeCard
            icon="⚔️"
            title="Solo Quest"
            subtitle="Test your knowledge across mythologies"
            color="from-amber-900/60 to-stone-900/80"
            border="border-amber-700/40"
            onClick={() => onStart('solo')}
          />
          <GameModeCard
            icon="☀️"
            title="Daily Oracle"
            subtitle="Today's challenge — compete globally"
            color="from-yellow-900/60 to-stone-900/80"
            border="border-yellow-600/40"
            onClick={() => onStart('daily')}
          />
          <GameModeCard
            icon="⚡"
            title="Speed Myth"
            subtitle="Race the clock — time scales with difficulty"
            color="from-blue-900/60 to-stone-900/80"
            border="border-blue-700/40"
            onClick={() => onStart('speed')}
          />
          <GameModeCard
            icon="👥"
            title="Pantheon Battle"
            subtitle="Multiplayer — share a code via Zoom, Teams, or WhatsApp"
            color="from-purple-900/60 to-stone-900/80"
            border="border-purple-700/40"
            badge="LIVE"
            onClick={onMultiplayer}
          />
        </div>

        {/* Stats strip */}
        <div className="w-full max-w-sm bg-stone-900/60 rounded-xl p-3 border border-stone-800 flex justify-around text-center">
          <Stat label="Level" value={player.level} />
          <Stat label="XP" value={player.xp.toLocaleString()} />
          <Stat
            label="Correct"
            value={`${player.questionsAnswered > 0 ? Math.round((player.correctAnswers / player.questionsAnswered) * 100) : 0}%`}
          />
          <Stat label="Streak" value={`🔥${player.bestStreak}`} />
        </div>
      </main>

      <footer className="text-center text-stone-700 text-xs py-4">
        Spanning 10+ world mythologies · New questions added weekly
      </footer>
    </div>
  );
}

function CharacterDot({ char }) {
  return (
    <span
      className="inline-flex w-4 h-4 rounded-full items-center justify-center text-xs border"
      style={{ borderColor: char.primary, backgroundColor: char.bg }}
    >
      {char.emoji}
    </span>
  );
}

function GameModeCard({ icon, title, subtitle, color, border, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 cursor-pointer relative`}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-bold text-stone-100">{title}</div>
          <div className="text-xs text-stone-400">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-amber-400 font-bold text-sm">{value}</div>
      <div className="text-stone-500 text-xs">{label}</div>
    </div>
  );
}
