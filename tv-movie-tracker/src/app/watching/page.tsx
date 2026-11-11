"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLists } from "@/contexts/ListsContext";
import { getShowEpisodes, type Episode } from "@/lib/tvmaze";

interface ShowBacklog {
  showId: number;
  showName: string;
  image: string | null;
  network: string;
  /** Aired-but-unwatched episodes, oldest first */
  unwatched: Episode[];
  /** Most recent air date among unwatched episodes */
  latestAirdate: string;
  airedCount: number;
  watchedCount: number;
}

type SortMode = "recent" | "count" | "name";

function formatDate(dateStr: string): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysAgo(dateStr: string): string {
  if (!dateStr) return "";
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((now.getTime() - then.getTime()) / 86400000);
  if (diff <= 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

export default function WatchingPage() {
  const { lists, watched, markEpisodesWatched } = useLists();
  const [backlogs, setBacklogs] = useState<ShowBacklog[]>([]);
  const [episodeCache, setEpisodeCache] = useState<Record<number, Episode[]>>({});
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  // Collect saved TV shows (movies have no episodes to track)
  const savedShows: { id: number; name: string; image: string | null; network: string }[] = [];
  const seen = new Set<number>();
  lists.forEach((list) =>
    list.shows.forEach((s) => {
      if ((!s.type || s.type === "show") && !seen.has(s.id)) {
        seen.add(s.id);
        savedShows.push({ id: s.id, name: s.name, image: s.image, network: s.network });
      }
    })
  );

  const savedShowsKey = savedShows.map((s) => s.id).sort((a, b) => a - b).join(",");

  // Fetch episode lists for all saved shows (batched to stay under TVMaze rate limits)
  useEffect(() => {
    if (savedShows.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      const ids = savedShows.map((s) => s.id);
      const cache: Record<number, Episode[]> = {};

      for (let i = 0; i < ids.length; i += 6) {
        const batch = ids.slice(i, i + 6);
        const results = await Promise.allSettled(batch.map((id) => getShowEpisodes(id)));
        if (cancelled) return;

        results.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            cache[batch[idx]] = result.value;
          }
        });
      }

      if (!cancelled) {
        setEpisodeCache(cache);
        setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedShowsKey]);

  // Recompute backlogs whenever episodes or watched state change
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const result: ShowBacklog[] = [];

    savedShows.forEach((show) => {
      const episodes = episodeCache[show.id];
      if (!episodes) return;

      const aired = episodes.filter((ep) => Boolean(ep.airdate) && ep.airdate <= today);
      if (aired.length === 0) return;

      const watchedIds = new Set(watched[show.id] || []);
      const unwatched = aired
        .filter((ep) => !watchedIds.has(ep.id))
        .sort((a, b) => a.airdate.localeCompare(b.airdate));

      if (unwatched.length === 0) return;

      result.push({
        showId: show.id,
        showName: show.name,
        image: show.image,
        network: show.network,
        unwatched,
        latestAirdate: unwatched[unwatched.length - 1].airdate,
        airedCount: aired.length,
        watchedCount: aired.length - unwatched.length,
      });
    });

    setBacklogs(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeCache, watched, savedShowsKey]);

  const sorted = [...backlogs].sort((a, b) => {
    if (sortMode === "recent") return b.latestAirdate.localeCompare(a.latestAirdate);
    if (sortMode === "count") return b.unwatched.length - a.unwatched.length;
    return a.showName.localeCompare(b.showName);
  });

  const totalUnwatched = backlogs.reduce((sum, b) => sum + b.unwatched.length, 0);

  const markNextWatched = useCallback(
    (showId: number, episodeId: number) => {
      markEpisodesWatched(showId, [episodeId]);
    },
    [markEpisodesWatched]
  );

  const markShowCaughtUp = useCallback(
    (backlog: ShowBacklog) => {
      markEpisodesWatched(backlog.showId, backlog.unwatched.map((ep) => ep.id));
    },
    [markEpisodesWatched]
  );

  if (savedShows.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">No saved shows yet</p>
        <p className="text-sm mt-1">Save some TV shows to track what you&apos;ve watched</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-3 inline-block">
          Search for shows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Up Next</h1>
          <p className="text-slate-400 text-sm mt-1">
            {loading
              ? "Checking your shows..."
              : totalUnwatched === 0
              ? "You're all caught up."
              : `${totalUnwatched} unwatched episode${totalUnwatched === 1 ? "" : "s"} across ${backlogs.length} show${backlogs.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {!loading && backlogs.length > 1 && (
          <div className="flex bg-[#1e293b] rounded-lg border border-[#334155] p-0.5">
            {([
              { key: "recent", label: "Newest" },
              { key: "count", label: "Most behind" },
              { key: "name", label: "A–Z" },
            ] as { key: SortMode; label: string }[]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortMode(opt.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  sortMode === opt.key ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : backlogs.length === 0 ? (
        <div className="text-center py-16 bg-[#1e293b] rounded-lg border border-[#334155]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-12 h-12 mx-auto text-green-500 mb-3">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-medium">All caught up</p>
          <p className="text-sm text-slate-400 mt-1">
            You&apos;ve watched every released episode of your saved shows.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((backlog) => {
            const next = backlog.unwatched[0];
            const progressPct = Math.round((backlog.watchedCount / backlog.airedCount) * 100);
            return (
              <div
                key={backlog.showId}
                className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden flex gap-3 sm:gap-4"
              >
                <Link href={`/show/${backlog.showId}`} className="relative w-[70px] sm:w-[90px] flex-shrink-0 bg-[#0f172a]">
                  {backlog.image ? (
                    <Image
                      src={backlog.image}
                      alt={backlog.showName}
                      fill
                      className="object-cover"
                      sizes="90px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      TV
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0 py-3 pr-3 sm:pr-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <Link href={`/show/${backlog.showId}`} className="min-w-0 group">
                      <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors">
                        {backlog.showName}
                      </h3>
                      <p className="text-xs text-blue-400">{backlog.network}</p>
                    </Link>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-semibold whitespace-nowrap">
                      {backlog.unwatched.length} unwatched
                    </span>
                  </div>

                  {/* Next unwatched episode */}
                  <div className="mt-2 text-sm">
                    <span className="text-slate-300 font-medium">
                      S{next.season}E{next.number}
                    </span>{" "}
                    <span className="text-slate-400">{next.name}</span>
                    <span className="text-slate-500 text-xs ml-1.5">
                      {formatDate(next.airdate)} · {daysAgo(next.airdate)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#0f172a] rounded-full overflow-hidden max-w-[200px]">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {backlog.watchedCount}/{backlog.airedCount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      onClick={() => markNextWatched(backlog.showId, next.id)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      Watched S{next.season}E{next.number}
                    </button>
                    {backlog.unwatched.length > 1 && (
                      <button
                        onClick={() => markShowCaughtUp(backlog)}
                        className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] text-slate-300 rounded-md text-xs font-medium transition-colors"
                      >
                        Mark all {backlog.unwatched.length} watched
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
