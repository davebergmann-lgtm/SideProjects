import { useState } from 'react';
import { getProfiles, addProfile, loadPlayer, savePlayer, defaultPlayer } from '../../store/gameStore';
import { findOrCreatePlayer } from '../../store/cloudStore';
import { firebaseConfigured } from '../../config/firebase';

export function ProfileSelectScreen({ onSelect }) {
  const [profiles] = useState(() => getProfiles());
  const [creating, setCreating] = useState(profiles.length === 0);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) { setError('Please enter a name'); return; }
    if (name.length < 2) { setError('Name must be at least 2 characters'); return; }
    if (name.length > 20) { setError('Name must be 20 characters or less'); return; }

    setLoading(true);
    setError('');

    const newPlayerData = { ...defaultPlayer, name };
    const result = await findOrCreatePlayer(name, newPlayerData);

    if (result.error === 'NETWORK_ERROR') {
      setError('Could not connect to the cloud. Check your connection and try again.');
      setLoading(false);
      return;
    }

    const { player, isNew } = result;

    // Cache to localStorage and register in local profile list
    addProfile(name);
    savePlayer(player);

    // isNew=false means they're loading an existing cloud save (another device login)
    onSelect(name, isNew, player);
  };

  const handleSelectExisting = async (name) => {
    // Load from localStorage immediately for responsiveness
    const localPlayer = loadPlayer(name);
    onSelect(name, false, localPlayer);

    // Cloud sync happens in the background (App.jsx handles it)
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
        {/* Existing local profiles */}
        {!creating && profiles.length > 0 && (
          <>
            {profiles.map(name => {
              const p = loadPlayer(name);
              return (
                <ProfileCard
                  key={name}
                  name={name}
                  level={p.level}
                  xp={p.xp}
                  character={p.character}
                  onClick={() => handleSelectExisting(name)}
                />
              );
            })}
            <button
              onClick={() => { setCreating(true); setError(''); }}
              className="w-full px-5 py-3.5 border border-dashed border-stone-700 rounded-2xl text-stone-500 hover:text-stone-300 hover:border-stone-500 transition-all text-sm mt-1"
            >
              + Add Profile / Load from Another Device
            </button>
          </>
        )}

        {/* Create / load profile form */}
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
                onKeyDown={e => e.key === 'Enter' && !loading && handleCreate()}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                disabled={loading}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-base disabled:opacity-50"
              />
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
              {!error && firebaseConfigured && (
                <p className="text-stone-600 text-xs mt-1.5">
                  Usernames are globally unique — your progress syncs across devices.
                </p>
              )}
              {!firebaseConfigured && (
                <p className="text-amber-700 text-xs mt-1.5">
                  ⚠ Cloud sync not configured — progress saves locally only.
                </p>
              )}
            </div>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full px-5 py-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl transition-all active:scale-[0.98] text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  {firebaseConfigured ? 'Connecting...' : 'Starting...'}
                </>
              ) : (
                'Begin Your Journey →'
              )}
            </button>
            {profiles.length > 0 && (
              <button
                onClick={() => { setCreating(false); setError(''); setNewName(''); }}
                disabled={loading}
                className="w-full text-stone-500 hover:text-stone-300 text-sm transition-colors py-1 disabled:opacity-50"
              >
                ← Back to profiles
              </button>
            )}
          </div>
        )}
      </div>

      <p className="text-stone-700 text-xs mt-10 text-center max-w-xs">
        {firebaseConfigured
          ? 'Your progress is saved to the cloud. Play on any device using the same name.'
          : 'Each profile saves its own progress on this device.'}
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
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
