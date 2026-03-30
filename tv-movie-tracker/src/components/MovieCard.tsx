"use client";

import Link from "next/link";
import Image from "next/image";
import { type TMDBMovie, getTMDBImageUrl, mapGenreIds } from "@/lib/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = getTMDBImageUrl(movie.poster_path, "w185");
  const year = movie.release_date ? movie.release_date.split("-")[0] : "TBA";
  const genres = mapGenreIds(movie.genre_ids || []);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="flex gap-3 sm:gap-4 bg-[#1e293b] rounded-lg border border-[#334155] hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden group"
    >
      <div className="relative w-[80px] sm:w-[100px] min-h-[112px] sm:min-h-[140px] flex-shrink-0 bg-[#0f172a]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="100px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zm1.5 0v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5A.375.375 0 003 5.625zm16.125-.375a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0021 7.125v-1.5a.375.375 0 00-.375-.375h-1.5zM21 9.375v1.5c0 .207-.168.375-.375.375h-1.5a.375.375 0 01-.375-.375v-1.5c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375zm0 3.75v1.5c0 .207-.168.375-.375.375h-1.5a.375.375 0 01-.375-.375v-1.5c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375zm0 3.75v1.5c0 .207-.168.375-.375.375h-1.5a.375.375 0 01-.375-.375v-1.5c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375zM4.875 18.75a.375.375 0 01-.375-.375v-1.5c0-.207.168-.375.375-.375h1.5c.207 0 .375.168.375.375v1.5c0 .207-.168.375-.375.375h-1.5zM3.375 12.75a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-1.5zm0-3.75a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 005.25 10.5V9a.375.375 0 00-.375-.375h-1.5z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <div className="py-2.5 sm:py-3 pr-3 sm:pr-4 flex flex-col justify-center min-w-0">
        <h3 className="font-semibold text-base sm:text-lg group-hover:text-blue-400 transition-colors truncate">
          {movie.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
          <span className="text-blue-400 font-medium">{year}</span>
          {rating && (
            <span className="text-yellow-400 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
              {rating}
            </span>
          )}
        </div>
        {movie.overview && (
          <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{movie.overview}</p>
        )}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {genres.slice(0, 3).map((g) => (
              <span key={g} className="px-2 py-0.5 bg-[#334155] rounded text-xs text-slate-300">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
