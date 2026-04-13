import type { Rating, ReadingLevel } from './constants';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_tier: string;
  stripe_customer_id: string | null;
  created_at: string;
};

export type Child = {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  grade_level: string | null;
  reading_level: ReadingLevel | null;
  interests: string[];
  created_at: string;
};

export type Book = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  cover_image_url: string | null;
  google_books_id: string | null;
  open_library_id: string | null;
  community_score: number;
  total_ratings: number;
  created_at: string;
};

export type BookEntry = {
  id: string;
  child_id: string;
  book_id: string;
  rating: Rating;
  notes: string | null;
  added_by: string | null;
  created_at: string;
  book?: Book;
};

export type GoogleBookResult = {
  googleBooksId: string;
  title: string;
  authors: string[];
  isbn: string | null;
  coverImageUrl: string | null;
  description: string | null;
};

/** Raw shape Claude returns in the JSON array. */
export type RawRecommendation = {
  title: string;
  author: string;
  isbn?: string | null;
  match_reason: string;
  why_they_will_love_it: string;
  likely_availability?: 'library' | 'purchase' | 'both';
  series_starter?: boolean;
};

/** A recommendation after we enrich it with Google Books cover + id. */
export type RecommendedBook = RawRecommendation & {
  google_books_id: string | null;
  cover_image_url: string | null;
};

export type ReadingList = {
  id: string;
  child_id: string;
  generated_at: string;
  source_preference: 'free_first' | 'any';
  books: RecommendedBook[];
};
