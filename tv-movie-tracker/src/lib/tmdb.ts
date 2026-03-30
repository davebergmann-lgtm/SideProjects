const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime: number | null;
  status: string;
  tagline: string;
  production_companies?: { id: number; name: string }[];
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

export function getTMDBImageUrl(path: string | null, size = "w185"): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function mapGenreIds(ids: number[]): string[] {
  return ids.map((id) => GENRE_MAP[id]).filter(Boolean);
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const res = await fetch(`/api/tmdb?action=search&q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data: TMDBSearchResult = await res.json();
  return data.results || [];
}

export async function getMovie(id: number): Promise<TMDBMovie | null> {
  const res = await fetch(`/api/tmdb?action=movie&id=${id}`);
  if (!res.ok) return null;
  return res.json();
}
