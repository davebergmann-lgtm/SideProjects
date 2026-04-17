"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLists } from "@/contexts/ListsContext";
import { type TMDBMovie, getTMDBImageUrl, getMovieRecommendations, mapGenreIds } from "@/lib/tmdb";
import { searchShows, type Show } from "@/lib/tvmaze";

interface RecommendationItem {
  id: number;
  type: "show" | "movie";
  name: string;
  image: string | null;
  year: string;
  genres: string[];
  rating: string | null;
}

interface RecommendationsProps {
  searchQuery: string;
  topShowResult?: Show | null;
  topMovieResult?: TMDBMovie | null;
  hasSearched: boolean;
}

function showToRec(show: Show): RecommendationItem {
  return {
    id: show.id,
    type: "show",
    name: show.name,
    image: show.image?.medium || null,
    year: show.premiered ? show.premiered.split("-")[0] : "TBA",
    genres: show.genres.slice(0, 2),
    rating: show.rating?.average ? show.rating.average.toFixed(1) : null,
  };
}

function movieToRec(movie: TMDBMovie): RecommendationItem {
  return {
    id: movie.id,
    type: "movie",
    name: movie.title,
    image: getTMDBImageUrl(movie.poster_path, "w185"),
    year: movie.release_date ? movie.release_date.split("-")[0] : "TBA",
    genres: mapGenreIds(movie.genre_ids || []).slice(0, 2),
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
  };
}

export default function Recommendations({ searchQuery, topShowResult, topMovieResult, hasSearched }: RecommendationsProps) {
  const { lists } = useLists();
  const [recs, setRecs] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("");
  const lastFetchKey = useRef("");

  const allSavedMovieIds = new Set<number>();
  const allSavedShowIds = new Set<number>();
  lists.forEach((list) =>
    list.shows.forEach((s) => {
      if (s.type === "movie") allSavedMovieIds.add(s.id);
      else allSavedShowIds.add(s.id);
    })
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchSearchBasedRecs() {
      if (topMovieResult) {
        const fetchKey = `movie-${topMovieResult.id}`;
        if (fetchKey === lastFetchKey.current) return;
        lastFetchKey.current = fetchKey;

        setLoading(true);
        setLabel(`Because you searched "${searchQuery}"`);
        const movieRecs = await getMovieRecommendations(topMovieResult.id);
        if (cancelled) return;
        const items = movieRecs
          .filter((m) => !allSavedMovieIds.has(m.id))
          .slice(0, 6)
          .map(movieToRec);
        setRecs(items);
        setLoading(false);
      } else if (topShowResult) {
        const fetchKey = `show-${topShowResult.id}`;
        if (fetchKey === lastFetchKey.current) return;
        lastFetchKey.current = fetchKey;

        setLoading(true);
        setLabel(`Because you searched "${searchQuery}"`);
        const genres = topShowResult.genres.slice(0, 2);
        if (genres.length === 0) {
          setRecs([]);
          setLoading(false);
          return;
        }
        const results = await searchShows(genres.join(" ")).catch(() => []);
        if (cancelled) return;
        const items = results
          .map((r) => r.show)
          .filter((s) => s.id !== topShowResult.id && !allSavedShowIds.has(s.id))
          .slice(0, 6)
          .map(showToRec);
        setRecs(items);
        setLoading(false);
      }
    }

    async function fetchListBasedRecs() {
      const savedMovies = Array.from(allSavedMovieIds);
      const savedShows: { id: number; genres: string[] }[] = [];
      lists.forEach((list) =>
        list.shows.forEach((s) => {
          if (!s.type || s.type === "show") {
            savedShows.push({ id: s.id, genres: s.genres || [] });
          }
        })
      );

      if (savedMovies.length === 0 && savedShows.length === 0) {
        setRecs([]);
        return;
      }

      const fetchKey = `lists-${savedMovies.sort().join(",")}-${savedShows.map((s) => s.id).sort().join(",")}`;
      if (fetchKey === lastFetchKey.current) return;
      lastFetchKey.current = fetchKey;

      setLoading(true);
      setLabel("Based on your saved lists");

      const items: RecommendationItem[] = [];

      if (savedMovies.length > 0) {
        const randomMovieId = savedMovies[Math.floor(Math.random() * savedMovies.length)];
        const movieRecs = await getMovieRecommendations(randomMovieId);
        const filtered = movieRecs
          .filter((m) => !allSavedMovieIds.has(m.id))
          .slice(0, 4)
          .map(movieToRec);
        items.push(...filtered);
      }

      if (savedShows.length > 0) {
        const allGenres = savedShows.flatMap((s) => s.genres);
        const uniqueGenres = Array.from(new Set(allGenres));
        if (uniqueGenres.length > 0) {
          const searchTerm = uniqueGenres.slice(0, 2).join(" ");
          const results = await searchShows(searchTerm).catch(() => []);
          const filtered = results
            .map((r) => r.show)
            .filter((s) => !allSavedShowIds.has(s.id))
            .slice(0, 4)
            .map(showToRec);
          items.push(...filtered);
        }
      }

      if (!cancelled) {
        setRecs(items.slice(0, 6));
        setLoading(false);
      }
    }

    if (hasSearched && (topShowResult || topMovieResult)) {
      fetchSearchBasedRecs();
    } else if (!hasSearched) {
      fetchListBasedRecs();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, topShowResult?.id, topMovieResult?.id, hasSearched, lists]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-slate-400 py-4">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Finding recommendations...</span>
        </div>
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          You May Also Like
        </h3>
        {label && <p className="text-xs text-slate-500 mt-0.5">{label}</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {recs.map((rec) => (
          <Link
            key={`${rec.type}-${rec.id}`}
            href={rec.type === "movie" ? `/movie/${rec.id}` : `/show/${rec.id}`}
            className="group bg-[#1e293b] rounded-lg border border-[#334155] hover:border-blue-500/50 transition-all overflow-hidden"
          >
            <div className="relative w-full aspect-[2/3] bg-[#0f172a]">
              {rec.image ? (
                <Image
                  src={rec.image}
                  alt={rec.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path d="M19.5 6h-15v9h15V6z" />
                    <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H9.75v1.5H6a.75.75 0 000 1.5h12a.75.75 0 000-1.5h-3.75V18h6.375c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375zM3 4.875C3 4.668 3.168 4.5 3.375 4.5h17.25c.207 0 .375.168.375.375v11.25a.375.375 0 01-.375.375H3.375A.375.375 0 013 16.125V4.875z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                {rec.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-400">{rec.year}</span>
                {rec.rating && (
                  <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                    </svg>
                    {rec.rating}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#334155] text-slate-300">
                  {rec.type === "movie" ? "Movie" : "TV"}
                </span>
                {rec.genres[0] && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#334155] text-slate-300 truncate">
                    {rec.genres[0]}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
