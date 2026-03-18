import { useState } from 'react';
import { CHARACTERS, getCharacterById, getOutfitById } from '../../data/characters';
import { MYTHOLOGIES } from '../../data/questions';

const STEPS = ['Pantheon', 'Champion', 'Regalia'];

export function CharacterCreationScreen({ player, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [mythology, setMythology] = useState(null);
  const [character, setCharacter] = useState(null);
  const [outfit, setOutfit] = useState(null);

  const mythInfo = mythology ? MYTHOLOGIES[mythology.toUpperCase()] : null;
  const characters = mythology ? (CHARACTERS[mythology] || []) : [];
  const outfits = character ? character.outfits : [];

  const handleMythologySelect = (myth) => {
    if (!player.unlockedMythologies.includes(myth)) return;
    setMythology(myth);
    setCharacter(null);
    setOutfit(null);
    setStep(1);
  };

  const handleCharacterSelect = (char) => {
    setCharacter(char);
    setOutfit(null);
    setStep(2);
  };

  const handleOutfitSelect = (o) => {
    setOutfit(o);
  };

  const handleConfirm = () => {
    if (!mythology || !character || !outfit) return;
    onComplete({
      mythology,
      characterId: character.id,
      outfitId: outfit.id,
      // Denormalized for quick display
      emoji: character.emoji,
      name: character.name,
      outfitName: outfit.name,
      primary: outfit.primary,
      bg: outfit.bg,
      accent: outfit.accent,
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Header */}
      <header className="pt-7 px-5 pb-4">
        <div className="flex items-center gap-3 mb-5">
          {onBack && (
            <button onClick={onBack} className="text-stone-500 hover:text-stone-300 text-xl transition-colors">
              ←
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-amber-400 tracking-wide">Choose Your Champion</h1>
            <p className="text-stone-500 text-xs mt-0.5">
              {step === 0 && 'Select a pantheon'}
              {step === 1 && `Select your ${mythInfo?.name || ''} champion`}
              {step === 2 && `Choose ${character?.name}'s regalia`}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              onClick={() => { if (i < step) setStep(i); }}
              className="flex items-center gap-1.5 transition-all"
            >
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border transition-all ${
                i < step
                  ? 'bg-amber-500 border-amber-500 text-stone-950'
                  : i === step
                  ? 'border-amber-500 text-amber-400'
                  : 'border-stone-700 text-stone-600'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-amber-400' : i < step ? 'text-stone-400' : 'text-stone-600'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8">

        {/* Step 0: Choose Mythology */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {Object.values(MYTHOLOGIES).map(m => {
              const unlocked = player.unlockedMythologies.includes(m.id);
              const chars = CHARACTERS[m.id] || [];
              return (
                <button
                  key={m.id}
                  onClick={() => handleMythologySelect(m.id)}
                  disabled={!unlocked}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    unlocked
                      ? 'border-stone-700 bg-stone-900/60 hover:border-opacity-70 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'border-stone-800 bg-stone-900/30 opacity-40 cursor-not-allowed'
                  }`}
                  style={unlocked ? { borderColor: `${m.color}50` } : {}}
                >
                  <div className="text-3xl mb-2">{m.emoji}</div>
                  <div className="font-bold text-sm text-stone-100">{m.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {unlocked
                      ? `${chars.length} champion${chars.length !== 1 ? 's' : ''}`
                      : `Unlock at Lv.${m.unlockLevel}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 1: Choose Character */}
        {step === 1 && mythology && (
          <div className="space-y-3 mt-2">
            {characters.map(char => (
              <button
                key={char.id}
                onClick={() => handleCharacterSelect(char)}
                className={`w-full p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-[0.98] ${
                  character?.id === char.id
                    ? 'border-amber-500 bg-amber-900/20'
                    : 'border-stone-700 bg-stone-900/60 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Mini avatar */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl border-2 flex-shrink-0"
                    style={{
                      backgroundColor: char.outfits[0].bg,
                      borderColor: char.outfits[0].primary,
                    }}
                  >
                    {char.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-stone-100">{char.name}</div>
                    <div className="text-xs text-amber-400 font-semibold">{char.title}</div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">{char.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Choose Outfit */}
        {step === 2 && character && (
          <div className="space-y-4 mt-2">
            {/* Preview */}
            {outfit && (
              <CharacterPreview character={character} outfit={outfit} />
            )}

            {/* Outfit options */}
            <div className="space-y-2.5">
              {outfits.map(o => (
                <button
                  key={o.id}
                  onClick={() => handleOutfitSelect(o)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                    outfit?.id === o.id
                      ? 'scale-[1.02]'
                      : 'border-stone-700 bg-stone-900/60 hover:border-stone-500 hover:scale-[1.01]'
                  }`}
                  style={outfit?.id === o.id ? {
                    borderColor: o.primary,
                    backgroundColor: `${o.bg}`,
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border flex-shrink-0"
                      style={{ backgroundColor: o.bg, borderColor: `${o.primary}80` }}
                    >
                      {o.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-100">{o.name}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{o.description}</div>
                    </div>
                    {outfit?.id === o.id && (
                      <span style={{ color: o.primary }} className="font-black text-lg flex-shrink-0">✓</span>
                    )}
                  </div>
                  {/* Color swatch */}
                  <div className="flex gap-1.5 mt-2.5 ml-15 pl-[3.75rem]">
                    <div className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: o.primary }} />
                    <div className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: o.accent }} />
                    <div className="w-4 h-4 rounded-full border border-stone-700" style={{ backgroundColor: o.bg }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Confirm button */}
            {outfit && (
              <button
                onClick={handleConfirm}
                className="w-full py-4 font-black text-stone-950 rounded-xl transition-all active:scale-[0.98] text-base mt-2"
                style={{ backgroundColor: outfit.primary }}
              >
                Enter as {character.name} →
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function CharacterPreview({ character, outfit }) {
  return (
    <div
      className="rounded-2xl p-6 text-center border relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${outfit.primary}30 0%, ${outfit.bg} 70%)`,
        borderColor: `${outfit.primary}60`,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${outfit.primary} 0%, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl border-4 mb-3"
          style={{ borderColor: outfit.primary, backgroundColor: outfit.bg }}
        >
          {character.emoji}
        </div>
        <div className="font-black text-xl" style={{ color: outfit.primary }}>
          {character.name}
        </div>
        <div className="text-xs font-semibold mt-0.5" style={{ color: outfit.accent }}>
          {outfit.name}
        </div>
        <p className="text-xs text-stone-400 mt-2 italic">{outfit.description}</p>
      </div>
    </div>
  );
}
