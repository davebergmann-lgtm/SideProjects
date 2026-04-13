export const READING_LEVELS = [
  { value: 'beginner', label: 'Beginner (pre-K–K)', hint: 'Picture books, early letters' },
  { value: 'early', label: 'Early Reader (1st–2nd)', hint: 'Short chapters, large text' },
  { value: 'middle_grade', label: 'Middle Grade (3rd–5th)', hint: 'Chapter books, longer stories' },
  { value: 'tween', label: 'Tween (6th–8th)', hint: 'Longer novels, complex themes' },
  { value: 'ya', label: 'Young Adult (9th+)', hint: 'Teen fiction, mature themes' },
] as const;

export type ReadingLevel = (typeof READING_LEVELS)[number]['value'];

export const INTERESTS = [
  'animals',
  'adventure',
  'fantasy',
  'magic',
  'dragons',
  'mystery',
  'humor',
  'science',
  'space',
  'history',
  'sports',
  'friendship',
  'family',
  'school',
  'superheroes',
  'fairy tales',
  'dinosaurs',
  'robots',
  'horror',
  'mythology',
  'graphic novels',
  'non-fiction',
  'poetry',
  'realistic fiction',
] as const;

export const RATINGS = [
  { value: 'loved', label: 'Loved it', emoji: '❤️' },
  { value: 'liked', label: 'Liked it', emoji: '👍' },
  { value: 'disliked', label: 'Not for me', emoji: '👎' },
  { value: 'dnf', label: "Didn't finish", emoji: '⏭️' },
] as const;

export type Rating = (typeof RATINGS)[number]['value'];

export const MAX_CHILDREN = 3;
