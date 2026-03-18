// Simple state management using localStorage + React state
const STORAGE_KEY = 'pantheon_player';

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
};

export const loadPlayer = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultPlayer, ...JSON.parse(saved) } : { ...defaultPlayer };
  } catch {
    return { ...defaultPlayer };
  }
};

export const savePlayer = (player) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
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

  // Track mythologies answered
  if (result.mythology) {
    updated.mythologiesAnswered[result.mythology] =
      (updated.mythologiesAnswered[result.mythology] || 0) + 1;
  }

  // Unlock mythologies based on level
  const unlocks = { 5: 'egyptian', 10: 'hindu', 15: 'japanese', 20: 'celtic', 25: 'aztec', 30: 'mesopotamian', 35: 'chinese' };
  if (unlocks[updated.level] && !updated.unlockedMythologies.includes(unlocks[updated.level])) {
    updated.unlockedMythologies.push(unlocks[updated.level]);
    result.newUnlock = unlocks[updated.level];
  }

  savePlayer(updated);
  return updated;
};

export const resetPlayer = () => {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultPlayer };
};
