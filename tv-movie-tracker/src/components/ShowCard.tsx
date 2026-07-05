"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Show, Episode } from "@/lib/tvmaze";
import { getNetworkName, getAirTimeET } from "@/lib/tvmaze";

interface ShowCardProps {
  show: Show;
}

interface NextEpInfo {
  season: number;
  number: number | null;
  name: string;
  airdate: string;
  isSeasonPremiere: boolean;
}

function formatEpDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ShowCard({ show }: ShowCardProps) {
  const [nextEp, setNextEp] = useState<NextEpInfo | null>(null);
  const [nextEpLoaded, setNextEpLoaded] = useState(false);

  const network = getNetworkName(show);
  const airTime = getAirTimeET(show);

  useEffect(() => {
    const nextEpLink = show._links?.nextepisode?.href;
    if (!nextEpLink) {
      setNextEpLoaded(true);
      return;
    }

    let cancelled = false;
    fetch(nextEpLink)
      .then((res) => (res.ok ? res.json() : null))
      .then((ep: Episode | null) => {
        if (cancelled || !ep) return;
        setNextEp({
          season: ep.season,
          number: ep.number,
          name: ep.name,
          airdate: ep.airdate,
          isSeasonPremiere: ep.number === 1,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setNextEpLoaded(true);
      });

    return () => { cancelled = true; };
  }, [show._links?.nextepisode?.href]);

  const statusColor =
    show.status === "Running"
      ? "text-green-400"
      : show.status === "Ended"
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <Link
      href={`/show/${show.id}`}
      className="flex gap-4 bg-[#1e293b] rounded-lg border border-[#334155] hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden group"
    >
      <div className="relative w-[80px] sm:w-[100px] min-h-[112px] sm:min-h-[140px] flex-shrink-0 bg-[#0f172a]">
        {show.image?.medium ? (
          <Image
            src={show.image.medium}
            alt={show.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path d="M19.5 6h-15v9h15V6z" />
              <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H9.75v1.5H6a.75.75 0 000 1.5h12a.75.75 0 000-1.5h-3.75V18h6.375c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375zM3 4.875C3 4.668 3.168 4.5 3.375 4.5h17.25c.207 0 .375.168.375.375v11.25a.375.375 0 01-.375.375H3.375A.375.375 0 013 16.125V4.875z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <div className="py-2.5 sm:py-3 pr-3 sm:pr-4 flex flex-col justify-center min-w-0">
        <h3 className="font-semibold text-base sm:text-lg group-hover:text-blue-400 transition-colors truncate">
          {show.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
          <span className="text-blue-400 font-medium">{network}</span>
          <span className={`${statusColor} font-medium`}>{show.status}</span>
        </div>
        <p className="text-slate-400 text-sm mt-1">{airTime}</p>

        {/* Next episode / new season info */}
        {nextEpLoaded && nextEp && (
          <div className="mt-1.5">
            {nextEp.isSeasonPremiere ? (
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold uppercase">
                  New Season
                </span>
                <span className="text-xs text-slate-300">
                  S{nextEp.season} premieres {nextEp.airdate ? formatEpDate(nextEp.airdate) : "TBA"}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Next:</span>{" "}
                S{nextEp.season}E{nextEp.number} &ldquo;{nextEp.name}&rdquo;
                {nextEp.airdate ? ` – ${formatEpDate(nextEp.airdate)}` : " – TBA"}
              </p>
            )}
          </div>
        )}
        {nextEpLoaded && !nextEp && show.status !== "Ended" && show.status !== "Running" && (
          <p className="text-xs text-slate-500 mt-1.5">No upcoming episodes announced</p>
        )}

        {show.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {show.genres.slice(0, 3).map((g) => (
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
