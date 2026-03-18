// Multi-profile state management using localStorage
const PROFILES_KEY = 'pantheon_profiles';
const ACTIVE_PROFILE_KEY = 'pantheon_active_profile';
const playerKey = (name) => `pantheon_player_${name}`;

export const defaultPlayer = {
  name: 'Seeker',
  xp: 0,
  level: 1,
  streak: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  unlockedMythologies: ['greek', 'norse'],
  achievements: [],
  mythologiesAnswered: {},
  character: null, // { mythology, characterId, outfitId }
};

export const getProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
  } catch {
    return [];
  }
};

export const addProfile = (name) => {
  const profiles = getProfiles();
  if (!profiles.includes(name)) {
    profiles.push(name);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }
};

export const getActiveProfileName = () =>
  localStorage.getItem(ACTIVE_PROFILE_KEY) || null;

export const setActiveProfileName = (name) =>
  localStorage.setItem(ACTIVE_PROFILE_KEY, name);

export const loadPlayer = (name) => {
  try {
    const saved = localStorage.getItem(playerKey(name));
    return saved
      ? { ...defaultPlayer, ...JSON.parse(saved) }
      : { ...defaultPlayer, name };
  } catch {
    return { ...defaultPlayer, name };
  }
};

export const savePlayer = (player) => {
  try {
    localStorage.setItem(playerKey(player.name), JSON.stringify(player));
  } catch {}
};

export const xpForLevel = (level) => Math.floor(50 * Math.pow(level, 1.6));

export const calculateLevel = (xp) => {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
};

export const updatePlayer = (player, result) => {
  const updated = { ...player };
  updated.xp += result.xpEarned;
  updated.level = calculateLevel(updated.xp);
  updated.gamesPlayed += result.isGameComplete ? 1 : 0;
  updated.questionsAnswered += 1;
  updated.correctAnswers += result.isCorrect ? 1 : 0;
  updated.streak = result.isCorrect ? updated.streak + 1 : 0;
  updated.bestStreak = Math.max(updated.streak, updated.bestStreak);

  if (result.mythology) {
    updated.mythologiesAnswered[result.mythology] =
      (updated.mythologiesAnswered[result.mythology] || 0) + 1;
  }

  const unlocks = {
    5: 'egyptian', 10: 'hindu', 15: 'japanese',
    20: 'celtic', 25: 'aztec', 30: 'mesopotamian', 35: 'chinese', 40: 'slavic',
  };
  if (unlocks[updated.level] && !updated.unlockedMythologies.includes(unlocks[updated.level])) {
    updated.unlockedMythologies.push(unlocks[updated.level]);
    result.newUnlock = unlocks[updated.level];
  }

  savePlayer(updated);
  return updated;
};

export const resetPlayer = (name) => {
  localStorage.removeItem(playerKey(name));
  return { ...defaultPlayer, name };
};
