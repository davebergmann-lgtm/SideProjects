// Characters organized by mythology
// Each character has 3+ outfits with color schemes for the avatar display
export const CHARACTERS = {
  greek: [
    {
      id: 'zeus',
      name: 'Zeus',
      title: 'King of Olympus',
      emoji: '🧔‍♂️',
      description: 'Ruler of the gods, wielder of lightning, father of gods and mortals.',
      outfits: [
        { id: 'thunderlord', name: 'Thunderlord', emoji: '⚡', primary: '#f59e0b', bg: '#451a03', accent: '#fbbf24', description: 'Draped in gold, crowned with lightning.' },
        { id: 'eagle_sovereign', name: 'Eagle Sovereign', emoji: '🦅', primary: '#60a5fa', bg: '#172554', accent: '#bfdbfe', description: 'White robes adorned with eagle feathers.' },
        { id: 'storm_bringer', name: 'Storm Bringer', emoji: '🌩️', primary: '#a78bfa', bg: '#2e1065', accent: '#ddd6fe', description: 'Cloaked in tempest clouds and violet light.' },
      ],
    },
    {
      id: 'athena',
      name: 'Athena',
      title: 'Goddess of Wisdom',
      emoji: '👩',
      description: 'Goddess of wisdom, war strategy, and crafts. Daughter of Zeus.',
      outfits: [
        { id: 'wisdom_aegis', name: "Wisdom's Aegis", emoji: '🛡️', primary: '#38bdf8', bg: '#0c2a3f', accent: '#7dd3fc', description: 'Bearing the sacred Aegis, adorned with silver.' },
        { id: 'warrior_regalia', name: 'Warrior Regalia', emoji: '⚔️', primary: '#2dd4bf', bg: '#0d2b28', accent: '#99f6e4', description: 'Full battle armor, spear in hand.' },
        { id: 'acropolis_robes', name: 'Acropolis Robes', emoji: '🏛️', primary: '#fbbf24', bg: '#1c1917', accent: '#fef08a', description: 'Flowing marble-white robes of the temple.' },
      ],
    },
  ],
  norse: [
    {
      id: 'odin',
      name: 'Odin',
      title: 'The Allfather',
      emoji: '🧙‍♂️',
      description: 'All-knowing ruler of Asgard, seeker of wisdom, master of runes.',
      outfits: [
        { id: 'wanderer', name: 'The Wanderer', emoji: '🐺', primary: '#a8a29e', bg: '#1c1917', accent: '#d6d3d1', description: 'Grey cloak, staff in hand, two ravens near.' },
        { id: 'allfather_armor', name: "Allfather's Armor", emoji: '👑', primary: '#818cf8', bg: '#1e1b4b', accent: '#c7d2fe', description: 'Royal armor of the gods, gold-trimmed.' },
        { id: 'raven_shroud', name: 'Raven Shroud', emoji: '🪶', primary: '#f59e0b', bg: '#0c0a09', accent: '#fde68a', description: 'Black as Huginn and Muninn, golden eye.' },
      ],
    },
    {
      id: 'thor',
      name: 'Thor',
      title: 'God of Thunder',
      emoji: '🧔',
      description: 'Son of Odin, wielder of Mjolnir, protector of mankind.',
      outfits: [
        { id: 'iron_champion', name: 'Iron Champion', emoji: '⚡', primary: '#f87171', bg: '#450a0a', accent: '#fca5a5', description: 'Red war armor, Mjolnir crackling with power.' },
        { id: 'stormbreaker', name: 'Stormbreaker', emoji: '🌪️', primary: '#60a5fa', bg: '#1e3a5f', accent: '#bfdbfe', description: 'Storm-blue, lightning etched across the chest.' },
        { id: 'mountain_warrior', name: 'Mountain Warrior', emoji: '🏔️', primary: '#78716c', bg: '#1c1917', accent: '#d6d3d1', description: 'Heavy furs and hammered iron plates.' },
      ],
    },
  ],
  egyptian: [
    {
      id: 'ra',
      name: 'Ra',
      title: 'The Sun God',
      emoji: '🫅',
      description: 'God of the sun, creator of all life, sailing the sky in his solar barque.',
      outfits: [
        { id: 'solar_pharaoh', name: 'Solar Pharaoh', emoji: '👑', primary: '#fbbf24', bg: '#451a03', accent: '#fef08a', description: 'Golden pharaonic regalia, sun disk crown.' },
        { id: 'falcon_crown', name: 'Falcon Crown', emoji: '🦅', primary: '#f9fafb', bg: '#1c1917', accent: '#fbbf24', description: 'White linen with the sacred falcon headdress.' },
        { id: 'horizon_lord', name: 'Horizon Lord', emoji: '🌅', primary: '#fb923c', bg: '#431407', accent: '#fed7aa', description: 'Sunset hues of orange and teal.' },
      ],
    },
    {
      id: 'isis',
      name: 'Isis',
      title: 'Mother of Magic',
      emoji: '👸',
      description: 'Goddess of magic, healing, and motherhood. Devoted protector of all.',
      outfits: [
        { id: 'star_weaver', name: 'Star Weaver', emoji: '⭐', primary: '#60a5fa', bg: '#172554', accent: '#fbbf24', description: 'Night-blue robes dotted with living stars.' },
        { id: 'wings_of_healing', name: 'Wings of Healing', emoji: '🦋', primary: '#2dd4bf', bg: '#042f2e', accent: '#99f6e4', description: 'Teal-white wings outstretched to shelter.' },
        { id: 'temple_priestess', name: 'Temple Priestess', emoji: '✨', primary: '#c084fc', bg: '#2e1065', accent: '#f0abfc', description: 'Amethyst and white linen, sacred staff.' },
      ],
    },
  ],
  hindu: [
    {
      id: 'vishnu',
      name: 'Vishnu',
      title: 'The Preserver',
      emoji: '🧘',
      description: 'Supreme preserver of the cosmos, blue-skinned deity of protection.',
      outfits: [
        { id: 'blue_cosmic', name: 'Blue Cosmic', emoji: '🌀', primary: '#60a5fa', bg: '#172554', accent: '#fbbf24', description: 'Brilliant blue form, four sacred arms raised.' },
        { id: 'lotus_lord', name: 'Lotus Lord', emoji: '🌸', primary: '#f472b6', bg: '#500724', accent: '#fbbf24', description: 'Seated on lotus, rose and gold adorned.' },
        { id: 'chakra_guardian', name: 'Chakra Guardian', emoji: '💠', primary: '#818cf8', bg: '#1e1b4b', accent: '#5eead4', description: 'Sudarshana chakra spinning in violet light.' },
      ],
    },
    {
      id: 'shiva',
      name: 'Shiva',
      title: 'The Destroyer',
      emoji: '🧘‍♂️',
      description: "God of destruction and transformation. Dancer at creation's end.",
      outfits: [
        { id: 'tandava_dancer', name: 'Tandava Dancer', emoji: '🔥', primary: '#fb923c', bg: '#431407', accent: '#fde68a', description: 'Dancing in the cosmic ring of fire.' },
        { id: 'ascetic_sage', name: 'Ascetic Sage', emoji: '🌙', primary: '#d6d3d1', secondary: '#0c0a09', accent: '#a8a29e', description: 'Pure white, crescent moon in matted hair.' },
        { id: 'cosmic_fire', name: 'Cosmic Fire', emoji: '🌋', primary: '#ef4444', bg: '#450a0a', accent: '#1c1917', description: 'Wreathed in flames, third eye blazing open.' },
      ],
    },
  ],
  japanese: [
    {
      id: 'amaterasu',
      name: 'Amaterasu',
      title: 'Goddess of the Sun',
      emoji: '👩‍🦳',
      description: 'Ruler of the heavens, bringer of light, sovereign goddess of the sun.',
      outfits: [
        { id: 'golden_kimono', name: 'Golden Kimono', emoji: '☀️', primary: '#fbbf24', bg: '#451a03', accent: '#fef9c3', description: 'Radiant gold kimono, sunburst obi.' },
        { id: 'mirror_shrine', name: 'Mirror Shrine', emoji: '🪞', primary: '#f1f5f9', bg: '#1e293b', accent: '#e11d48', description: 'White and crimson, holding Yata no Kagami.' },
        { id: 'sakura_goddess', name: 'Sakura Goddess', emoji: '🌸', primary: '#f9a8d4', bg: '#500724', accent: '#fde68a', description: 'Soft pink blossoms adorn the divine light.' },
      ],
    },
  ],
  celtic: [
    {
      id: 'morrigan',
      name: 'The Morrígan',
      title: 'Phantom Queen',
      emoji: '🧝‍♀️',
      description: 'Goddess of fate, war, and death. She who shapes the outcome of battles.',
      outfits: [
        { id: 'battle_crow', name: 'Battle Crow', emoji: '🖤', primary: '#dc2626', bg: '#0c0a09', accent: '#450a0a', description: 'Raven-black feathers, blood-red markings.' },
        { id: 'forest_specter', name: 'Forest Specter', emoji: '🌿', primary: '#4ade80', bg: '#052e16', accent: '#86efac', description: 'Cloaked in dark emerald and forest mist.' },
        { id: 'phantom_queen', name: 'Phantom Queen', emoji: '👑', primary: '#a78bfa', bg: '#2e1065', accent: '#ddd6fe', description: 'Pale queen, amethyst crown of shadows.' },
      ],
    },
  ],
  aztec: [
    {
      id: 'quetzalcoatl',
      name: 'Quetzalcoatl',
      title: 'Feathered Serpent',
      emoji: '🦸',
      description: 'The plumed serpent god of wind, air, learning, and the morning star.',
      outfits: [
        { id: 'feathered_serpent', name: 'Feathered Serpent', emoji: '🐍', primary: '#4ade80', bg: '#052e16', accent: '#fbbf24', description: 'Emerald feathers rippling with golden scales.' },
        { id: 'morning_star', name: 'Morning Star', emoji: '⭐', primary: '#60a5fa', bg: '#172554', accent: '#e2e8f0', description: 'Deep blue, Venus-bright at the dawning.' },
        { id: 'wind_priest', name: 'Wind Priest', emoji: '💨', primary: '#2dd4bf', bg: '#042f2e', accent: '#f1f5f9', description: 'White and teal, wind spirals carved across.' },
      ],
    },
  ],
  mesopotamian: [
    {
      id: 'inanna',
      name: 'Inanna',
      title: 'Queen of Heaven',
      emoji: '👸',
      description: 'Goddess of love, war, and power. Greatest of all Sumerian deities.',
      outfits: [
        { id: 'star_queen', name: 'Star Queen', emoji: '⭐', primary: '#a78bfa', bg: '#2e1065', accent: '#fbbf24', description: 'Lapis lazuli and gold, crown of eight stars.' },
        { id: 'war_goddess', name: 'War Goddess', emoji: '⚔️', primary: '#f87171', bg: '#450a0a', accent: '#fbbf24', description: 'Warrior regalia, battle standard raised high.' },
        { id: 'love_sovereign', name: 'Love Sovereign', emoji: '🌹', primary: '#f472b6', bg: '#500724', accent: '#fce7f3', description: 'Rose-silver descent robes from the heavens.' },
      ],
    },
  ],
  chinese: [
    {
      id: 'guan_yu',
      name: 'Guan Yu',
      title: 'God of War',
      emoji: '🥷',
      description: 'Deified general, god of war, righteousness, and brotherhood.',
      outfits: [
        { id: 'red_war_god', name: 'Red War God', emoji: '⚔️', primary: '#ef4444', bg: '#450a0a', accent: '#fbbf24', description: 'Crimson armor, Green Dragon Crescent Blade.' },
        { id: 'scholar_general', name: 'Scholar General', emoji: '📚', primary: '#4ade80', bg: '#052e16', accent: '#fbbf24', description: 'Green robes of both court and campaign.' },
        { id: 'dragon_scale', name: 'Dragon Scale', emoji: '🐉', primary: '#2dd4bf', bg: '#042f2e', accent: '#fde68a', description: 'Teal dragon-scale armor, gilded trim.' },
      ],
    },
  ],
  slavic: [
    {
      id: 'perun',
      name: 'Perun',
      title: 'God of Thunder',
      emoji: '🧔‍♂️',
      description: 'Slavic god of sky, thunder, lightning, storms, and sacred oaks.',
      outfits: [
        { id: 'thunder_oak', name: 'Thunder Oak', emoji: '🌳', primary: '#d97706', bg: '#1c0a00', accent: '#fbbf24', description: 'Oak bark armor, axe crackling with lightning.' },
        { id: 'storm_eagle', name: 'Storm Eagle', emoji: '🦅', primary: '#60a5fa', bg: '#172554', accent: '#bfdbfe', description: 'Eagle-blue cloak, storm light burning within.' },
        { id: 'iron_lightning', name: 'Iron Lightning', emoji: '⚡', primary: '#94a3b8', bg: '#0f172a', accent: '#e2e8f0', description: 'Iron grey, crackling with silver sparks.' },
      ],
    },
  ],
};

export const getCharacterById = (mythology, characterId) =>
  CHARACTERS[mythology]?.find(c => c.id === characterId) || null;

export const getOutfitById = (mythology, characterId, outfitId) => {
  const char = getCharacterById(mythology, characterId);
  return char?.outfits.find(o => o.id === outfitId) || null;
};

export const getDefaultCharacter = (unlockedMythologies) => {
  const myth = unlockedMythologies?.[0] || 'greek';
  const chars = CHARACTERS[myth];
  if (!chars?.length) return null;
  return {
    mythology: myth,
    characterId: chars[0].id,
    outfitId: chars[0].outfits[0].id,
  };
};
