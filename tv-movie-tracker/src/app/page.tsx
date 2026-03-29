"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import ShowCard from "@/components/ShowCard";
import { searchShows, type SearchResult } from "@/lib/tvmaze";

export default function HomePage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const data = await searchShows(query);
      setResults(data);
      setHasSearched(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2 sm:space-y-3 pt-4 sm:pt-8">
        <h1 className="text-2xl sm:text-4xl font-bold">
          Find Your <span className="text-blue-400">Shows</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Search for any TV show or movie to see where and when it airs
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <div className="space-y-3">
        {results.map((r) => (
          <ShowCard key={r.show.id} show={r.show} />
        ))}

        {hasSearched && results.length === 0 && !isLoading && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg">No shows found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
