import { useState } from 'react';
import { getProfiles, addProfile, loadPlayer } from '../../store/gameStore';

export function ProfileSelectScreen({ onSelect }) {
  const [profiles] = useState(() => getProfiles());
  const [creating, setCreating] = useState(profiles.length === 0);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { setError('Please enter a name'); return; }
    if (name.length < 2) { setError('Name must be at least 2 characters'); return; }
    if (name.length > 20) { setError('Name must be 20 characters or less'); return; }
    if (profiles.includes(name)) { setError('That name is already taken'); return; }
    addProfile(name);
    onSelect(name, true); // true = new profile, show character creation
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="text-7xl mb-4 drop-shadow-lg">𓂀</div>
      <h1 className="text-5xl font-black tracking-widest text-amber-400 mb-1">PANTHEON</h1>
      <p className="text-stone-500 text-xs tracking-widest uppercase mb-10">
        {profiles.length === 0 ? 'Begin Your Journey' : 'Choose Your Seeker'}
      </p>

      <div className="w-full max-w-sm space-y-3">
        {/* Existing profiles */}
        {!creating && profiles.length > 0 && (
          <>
            {profiles.map(name => {
              const p = loadPlayer(name);
              const emoji = p.character
                ? (import.meta.env.DEV, p.character.emoji || '⚡')
                : '⚡';
              return (
                <ProfileCard
                  key={name}
                  name={name}
                  level={p.level}
                  xp={p.xp}
                  character={p.character}
                  onClick={() => onSelect(name, false)}
                />
              );
            })}
            <button
              onClick={() => { setCreating(true); setError(''); }}
              className="w-full px-5 py-3.5 border border-dashed border-stone-700 rounded-2xl text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-all text-sm mt-1"
            >
              + Create New Profile
            </button>
          </>
        )}

        {/* Create new profile form */}
        {creating && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wider mb-2 block">
                Your Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-base"
              />
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>
            <button
              onClick={handleCreate}
              className="w-full px-5 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-all active:scale-[0.98] text-base"
            >
              Begin Your Journey →
            </button>
            {profiles.length > 0 && (
              <button
                onClick={() => { setCreating(false); setError(''); setNewName(''); }}
                className="w-full text-stone-500 hover:text-stone-300 text-sm transition-colors py-1"
              >
                ← Back to profiles
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-stone-700 text-xs mt-10 text-center max-w-xs">
        Each profile saves its own progress on this device. Share the link with friends — they'll create their own profile on their device.
      </p>
    </div>
  );
}

function ProfileCard({ name, level, xp, character, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 bg-stone-900/80 border border-stone-800 rounded-2xl hover:border-amber-600/60 hover:bg-stone-800/80 transition-all active:scale-[0.98] group"
    >
      <div className="flex items-center gap-4">
        <CharacterBadge character={character} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-stone-100 truncate">{name}</div>
          <div className="text-xs text-amber-400">Level {level} · {xp.toLocaleString()} XP</div>
        </div>
        <span className="text-stone-600 group-hover:text-stone-400 transition-colors text-lg">→</span>
      </div>
    </button>
  );
}

// Small avatar badge for profile cards
function CharacterBadge({ character, size = 'sm' }) {
  const s = size === 'sm' ? 'w-11 h-11 text-2xl' : 'w-14 h-14 text-3xl';
  const color = character?.primary || '#78716c';
  const bg = character?.bg || '#1c1917';
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center border-2 flex-shrink-0`}
      style={{ borderColor: color, backgroundColor: bg }}
    >
      {character?.emoji || '⚡'}
    </div>
  );
}
