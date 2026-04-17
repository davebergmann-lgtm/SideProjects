"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import ShowCard from "@/components/ShowCard";
import MovieCard from "@/components/MovieCard";
import Recommendations from "@/components/Recommendations";
import { searchShows, type SearchResult } from "@/lib/tvmaze";
import { searchMovies, type TMDBMovie } from "@/lib/tmdb";

type Tab = "shows" | "movies";

export default function HomePage() {
  const [showResults, setShowResults] = useState<SearchResult[]>([]);
  const [movieResults, setMovieResults] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("shows");
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setLastQuery(query);
    try {
      const [shows, movies] = await Promise.all([
        searchShows(query).catch(() => [] as SearchResult[]),
        searchMovies(query).catch(() => [] as TMDBMovie[]),
      ]);
      setShowResults(shows);
      setMovieResults(movies);
      setHasSearched(true);
      // Auto-switch to tab with results if current tab is empty
      if (shows.length === 0 && movies.length > 0) setActiveTab("movies");
      else if (movies.length === 0 && shows.length > 0) setActiveTab("shows");
    } catch {
      setShowResults([]);
      setMovieResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const currentResults = activeTab === "shows" ? showResults : movieResults;
  const topShowResult = showResults.length > 0 ? showResults[0].show : null;
  const topMovieResult = movieResults.length > 0 ? movieResults[0] : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2 sm:space-y-3 pt-4 sm:pt-8">
        <h1 className="text-2xl sm:text-4xl font-bold">
          Find Your <span className="text-blue-400">Shows & Movies</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Search for any TV show or movie
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* Tabs */}
      {hasSearched && (
        <div className="flex justify-center">
          <div className="flex bg-[#1e293b] rounded-lg border border-[#334155] p-0.5">
            <button
              onClick={() => setActiveTab("shows")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "shows" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              TV Shows ({showResults.length})
            </button>
            <button
              onClick={() => setActiveTab("movies")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "movies" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Movies ({movieResults.length})
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activeTab === "shows" &&
          showResults.map((r) => <ShowCard key={r.show.id} show={r.show} />)}

        {activeTab === "movies" &&
          movieResults.map((m) => <MovieCard key={m.id} movie={m} />)}

        {hasSearched && currentResults.length === 0 && !isLoading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">No {activeTab === "shows" ? "TV shows" : "movies"} found</p>
            <p className="text-sm mt-1">Try a different search term or check the other tab</p>
          </div>
        )}
      </div>

      {/* Recommendations - below search results */}
      <Recommendations
        searchQuery={lastQuery}
        topShowResult={topShowResult}
        topMovieResult={topMovieResult}
        hasSearched={hasSearched}
      />
    </div>
  );
}
