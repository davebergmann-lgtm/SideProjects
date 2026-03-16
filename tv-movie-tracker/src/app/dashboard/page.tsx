"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLists } from "@/contexts/ListsContext";
import { getShow, getSchedule, getStreamingSchedule, type Show, type ScheduleEntry } from "@/lib/tvmaze";

interface ShowWithDetails {
  id: number;
  name: string;
  network: string;
  status: string;
  image: string | null;
  nextEpisode: string | null;
  nextEpisodeDate: string | null;
}

interface TonightShow {
  showId: number;
  showName: string;
  network: string;
  image: string | null;
  episodeName: string;
  season: number;
  episodeNumber: number | null;
  airtime: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime12h(time24: string): string {
  if (!time24) return "TBA";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}

export default function DashboardPage() {
  const { lists } = useLists();
  const [tonightShows, setTonightShows] = useState<TonightShow[]>([]);
  const [tomorrowShows, setTomorrowShows] = useState<TonightShow[]>([]);
  const [showDetails, setShowDetails] = useState<ShowWithDetails[]>([]);
  const [loadingTonight, setLoadingTonight] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const allShowIds = new Set<number>();
  lists.forEach((list) => list.shows.forEach((s) => allShowIds.add(s.id)));

  // Fetch "what's on tonight/tomorrow" by checking the TVMaze schedule
  useEffect(() => {
    if (allShowIds.size === 0) {
      setLoadingTonight(false);
      return;
    }

    let cancelled = false;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    async function fetchTonight() {
      try {
        const [tvToday, streamToday, tvTomorrow, streamTomorrow] = await Promise.all([
          getSchedule(todayStr, "US").catch(() => [] as ScheduleEntry[]),
          getStreamingSchedule(todayStr).catch(() => [] as ScheduleEntry[]),
          getSchedule(tomorrowStr, "US").catch(() => [] as ScheduleEntry[]),
          getStreamingSchedule(tomorrowStr).catch(() => [] as ScheduleEntry[]),
        ]);

        if (cancelled) return;

        const idsSet = allShowIds;

        const filterEntries = (entries: ScheduleEntry[]): TonightShow[] => {
          return entries
            .filter((e) => idsSet.has(e.show.id))
            .map((e) => ({
              showId: e.show.id,
              showName: e.show.name,
              network: e.show.network?.name || e.show.webChannel?.name || "Unknown",
              image: e.show.image?.medium || null,
              episodeName: e.name,
              season: e.season,
              episodeNumber: e.number,
              airtime: e.airtime,
            }));
        };

        // Dedupe by showId+season+episode
        const dedupe = (shows: TonightShow[]): TonightShow[] => {
          const seen = new Set<string>();
          return shows.filter((s) => {
            const key = `${s.showId}-${s.season}-${s.episodeNumber}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };

        setTonightShows(dedupe([...filterEntries(tvToday), ...filterEntries(streamToday)]).sort((a, b) => a.airtime.localeCompare(b.airtime)));
        setTomorrowShows(dedupe([...filterEntries(tvTomorrow), ...filterEntries(streamTomorrow)]).sort((a, b) => a.airtime.localeCompare(b.airtime)));
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoadingTonight(false);
      }
    }

    fetchTonight();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists]);

  // Fetch show status details
  useEffect(() => {
    if (allShowIds.size === 0) {
      setLoadingStatus(false);
      return;
    }

    let cancelled = false;

    async function fetchStatuses() {
      const ids = Array.from(allShowIds);
      const details: ShowWithDetails[] = [];

      for (let i = 0; i < ids.length; i += 8) {
        const batch = ids.slice(i, i + 8);
        const results = await Promise.allSettled(
          batch.map((id) => fetch(`https://api.tvmaze.com/shows/${id}?embed=nextepisode`).then((r) => r.json()))
        );
        if (cancelled) return;

        results.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const show = result.value;
          const nextEp = show._embedded?.nextepisode;
          details.push({
            id: show.id,
            name: show.name,
            network: show.network?.name || show.webChannel?.name || "Unknown",
            status: show.status,
            image: show.image?.medium || null,
            nextEpisode: nextEp ? `S${nextEp.season}E${nextEp.number}: ${nextEp.name}` : null,
            nextEpisodeDate: nextEp?.airdate || null,
          });
        });
      }

      if (!cancelled) {
        setShowDetails(details);
        setLoadingStatus(false);
      }
    }

    fetchStatuses();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists]);

  const statusGroups = {
    Running: showDetails.filter((s) => s.status === "Running"),
    "In Development": showDetails.filter((s) => s.status === "In Development"),
    "To Be Determined": showDetails.filter((s) => s.status === "To Be Determined"),
    Ended: showDetails.filter((s) => s.status === "Ended"),
  };

  const statusColors: Record<string, string> = {
    Running: "text-green-400",
    "In Development": "text-yellow-400",
    "To Be Determined": "text-orange-400",
    Ended: "text-red-400",
  };

  const statusBgColors: Record<string, string> = {
    Running: "bg-green-500/10 border-green-500/20",
    "In Development": "bg-yellow-500/10 border-yellow-500/20",
    "To Be Determined": "bg-orange-500/10 border-orange-500/20",
    Ended: "bg-red-500/10 border-red-500/20",
  };

  if (allShowIds.size === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">No saved shows yet</p>
        <p className="text-sm mt-1">Save some shows to your lists to see your dashboard</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 mt-3 inline-block">
          Search for shows
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* What's On Tonight / Tomorrow */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          What&apos;s On Tonight
        </h2>
        {loadingTonight ? (
          <div className="flex items-center gap-2 text-slate-400 py-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Checking schedules...
          </div>
        ) : tonightShows.length === 0 && tomorrowShows.length === 0 ? (
          <p className="text-slate-500 py-4">None of your saved shows air today or tomorrow.</p>
        ) : (
          <div className="space-y-4">
            {tonightShows.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Today</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tonightShows.map((show, i) => (
                    <Link
                      key={`${show.showId}-${i}`}
                      href={`/show/${show.showId}`}
                      className="flex gap-3 bg-[#1e293b] rounded-lg border border-[#334155] p-3 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-[#0f172a]">
                        {show.image ? (
                          <Image src={show.image} alt={show.showName} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">TV</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{show.showName}</p>
                        <p className="text-xs text-blue-400">{show.network}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          S{show.season}E{show.episodeNumber}: {show.episodeName}
                        </p>
                        <p className="text-xs text-slate-500">{formatTime12h(show.airtime)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {tomorrowShows.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Tomorrow</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tomorrowShows.map((show, i) => (
                    <Link
                      key={`${show.showId}-${i}`}
                      href={`/show/${show.showId}`}
                      className="flex gap-3 bg-[#1e293b] rounded-lg border border-[#334155] p-3 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-[#0f172a]">
                        {show.image ? (
                          <Image src={show.image} alt={show.showName} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">TV</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{show.showName}</p>
                        <p className="text-xs text-blue-400">{show.network}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          S{show.season}E{show.episodeNumber}: {show.episodeName}
                        </p>
                        <p className="text-xs text-slate-500">{formatTime12h(show.airtime)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Show Status Dashboard */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Show Status Overview</h2>
        {loadingStatus ? (
          <div className="flex items-center gap-2 text-slate-400 py-4">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading show statuses...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(statusGroups) as [string, ShowWithDetails[]][]).map(([status, shows]) => (
                <div
                  key={status}
                  className={`rounded-lg border p-4 text-center ${statusBgColors[status] || "bg-[#1e293b] border-[#334155]"}`}
                >
                  <p className={`text-2xl font-bold ${statusColors[status] || "text-white"}`}>{shows.length}</p>
                  <p className="text-xs text-slate-400 mt-1">{status}</p>
                </div>
              ))}
            </div>

            {/* Show lists by status */}
            {(Object.entries(statusGroups) as [string, ShowWithDetails[]][]).map(([status, shows]) => {
              if (shows.length === 0) return null;
              return (
                <div key={status}>
                  <h3 className={`text-sm font-medium mb-2 uppercase tracking-wide ${statusColors[status]}`}>
                    {status} ({shows.length})
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {shows
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((show) => (
                        <Link
                          key={show.id}
                          href={`/show/${show.id}`}
                          className="flex gap-3 bg-[#1e293b] rounded-lg border border-[#334155] p-3 hover:border-blue-500/30 transition-colors"
                        >
                          <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-[#0f172a]">
                            {show.image ? (
                              <Image src={show.image} alt={show.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">TV</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{show.name}</p>
                            <p className="text-xs text-blue-400">{show.network}</p>
                            {show.nextEpisode ? (
                              <p className="text-xs text-slate-400 mt-1">
                                Next: {show.nextEpisode}
                                {show.nextEpisodeDate && (
                                  <span className="text-slate-500"> ({formatDate(show.nextEpisodeDate)})</span>
                                )}
                              </p>
                            ) : status === "Running" ? (
                              <p className="text-xs text-slate-500 mt-1">No upcoming episode scheduled</p>
                            ) : null}
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
