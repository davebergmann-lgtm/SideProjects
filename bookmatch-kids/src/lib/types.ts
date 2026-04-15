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

export type Group = {
  id: string;
  name: string;
  created_by: string | null;
  invite_code: string;
  tier: 'starter' | 'plus' | 'pro';
  max_families: number;
  created_at: string;
  expires_at: string | null;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  share_ratings: boolean;
  joined_at: string;
};

/** Row returned by the list_group_members RPC. */
export type GroupMemberWithProfile = {
  user_id: string;
  full_name: string | null;
  role: 'admin' | 'member';
  share_ratings: boolean;
  joined_at: string;
};

export type GroupListBook = {
  title: string;
  author: string;
  isbn: string | null;
  cover_image_url: string | null;
  google_books_id: string | null;
};

export type GroupList = {
  id: string;
  group_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  books: GroupListBook[];
  created_at: string;
};

/** Row returned by the group_ratings_feed RPC. */
export type GroupRatingFeedItem = {
  book_id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  loved_count: number;
  liked_count: number;
  disliked_count: number;
  dnf_count: number;
  total_count: number;
};

/** Row returned by the popular_books RPC. A globally-trending shortlist
 *  passed to Claude as a cold-start signal, not a hard constraint. */
export type PopularBook = {
  id: string;
  title: string;
  author: string | null;
  community_score: number;
  total_ratings: number;
};

/** Row returned by the lookup_group_by_invite RPC. */
export type GroupLookupResult = {
  id: string;
  name: string;
  tier: 'starter' | 'plus' | 'pro';
  max_families: number;
  member_count: number;
};
