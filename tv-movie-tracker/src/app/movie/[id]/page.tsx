"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getMovie, getTMDBImageUrl, type TMDBMovie } from "@/lib/tmdb";
import { useLists, type SavedShow } from "@/contexts/ListsContext";
import AddToListModal from "@/components/AddToListModal";

export default function MoviePage() {
  const params = useParams();
  const movieId = Number(params.id);
  const { getListsForShow } = useLists();

  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const m = await getMovie(movieId);
        setMovie(m);
      } catch {}
      setLoading(false);
    }
    load();
  }, [movieId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return <div className="text-center py-20 text-slate-400">Movie not found</div>;
  }

  const posterUrl = getTMDBImageUrl(movie.poster_path, "w500");
  const releaseYear = movie.release_date ? movie.release_date.split("-")[0] : "TBA";
  const releaseFormatted = movie.release_date
    ? new Date(movie.release_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBA";
  const genres = movie.genres?.map((g) => g.name) || [];
  const company = movie.production_companies?.[0]?.name || "";
  const listsWithMovie = getListsForShow(movie.id, "movie");

  const ratingColor =
    movie.vote_average >= 7
      ? "bg-green-500/20 text-green-400"
      : movie.vote_average >= 5
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-red-500/20 text-red-400";

  const statusColor =
    movie.status === "Released"
      ? "bg-green-500/20 text-green-400"
      : "bg-yellow-500/20 text-yellow-400";

  const savedItem: SavedShow = {
    id: movie.id,
    type: "movie",
    name: movie.title,
    network: company,
    airTime: releaseFormatted,
    status: movie.status || "Released",
    image: getTMDBImageUrl(movie.poster_path, "w185"),
    premiered: movie.release_date || null,
    genres,
    releaseDate: movie.release_date || null,
    overview: movie.overview || null,
    voteAverage: movie.vote_average || null,
    runtime: movie.runtime || null,
    addedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-[140px] h-[210px] sm:w-[200px] sm:h-[300px] flex-shrink-0 bg-[#1e293b] rounded-lg overflow-hidden mx-auto md:mx-0">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="200px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{movie.title}</h1>
            {movie.tagline && (
              <p className="text-slate-400 italic mt-1">{movie.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`px-2.5 py-1 rounded-md text-sm font-medium ${statusColor}`}>
                {movie.status}
              </span>
              {movie.vote_average > 0 && (
                <span className={`px-2.5 py-1 rounded-md text-sm font-medium flex items-center gap-1 ${ratingColor}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                  {movie.vote_average.toFixed(1)}/10
                </span>
              )}
              <span className="text-blue-400 font-medium text-lg">{releaseYear}</span>
            </div>
          </div>

          {/* Movie info */}
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Details</h3>
            <p className="text-lg">Released: {releaseFormatted}</p>
            {movie.runtime && (
              <p className="text-sm text-slate-400">Runtime: {movie.runtime} min</p>
            )}
            {company && (
              <p className="text-sm text-slate-400">Studio: {company}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              Save to List
            </button>
          </div>

          {listsWithMovie.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-400">In lists:</span>
              {listsWithMovie.map((l) => (
                <span key={l.id} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-sm">
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overview */}
      {movie.overview && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Overview</h3>
          <p className="text-slate-300 leading-relaxed">{movie.overview}</p>
        </div>
      )}

      {/* Genres */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <span key={g} className="px-3 py-1 bg-[#334155] rounded-full text-sm text-slate-300">
              {g}
            </span>
          ))}
        </div>
      )}

      {showModal && <AddToListModal show={savedItem} onClose={() => setShowModal(false)} />}
    </div>
  );
}
