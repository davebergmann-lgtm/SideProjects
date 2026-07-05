"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  getShow,
  getShowEpisodes,
  getNetworkName,
  getAirTimeET,
  stripHtml,
  type Show,
  type Episode,
} from "@/lib/tvmaze";
import { useLists, type SavedShow } from "@/contexts/ListsContext";
import AddToListModal from "@/components/AddToListModal";

export default function ShowPage() {
  const params = useParams();
  const showId = Number(params.id);
  const { getListsForShow } = useLists();

  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming");

  useEffect(() => {
    async function load() {
      try {
        const [s, eps] = await Promise.all([getShow(showId), getShowEpisodes(showId)]);
        setShow(s);
        setEpisodes(eps);
      } catch {}
      setLoading(false);
    }
    load();
  }, [showId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!show) {
    return <div className="text-center py-20 text-slate-400">Show not found</div>;
  }

  const network = getNetworkName(show);
  const airTime = getAirTimeET(show);
  const summary = stripHtml(show.summary);
  const listsWithShow = getListsForShow(show.id);

  const today = new Date().toISOString().split("T")[0];
  const upcomingEpisodes = episodes.filter((ep) => ep.airdate >= today);
  const displayEpisodes = activeTab === "upcoming" ? upcomingEpisodes : episodes;
  const nextEpisode = upcomingEpisodes.length > 0 ? upcomingEpisodes[0] : null;
  const isNewSeason = nextEpisode?.number === 1;

  // Group episodes by season
  const seasons = new Map<number, Episode[]>();
  displayEpisodes.forEach((ep) => {
    const s = ep.season;
    if (!seasons.has(s)) seasons.set(s, []);
    seasons.get(s)!.push(ep);
  });

  const savedShow: SavedShow = {
    id: show.id,
    name: show.name,
    network,
    airTime,
    status: show.status,
    image: show.image?.medium || null,
    premiered: show.premiered,
    genres: show.genres,
    addedAt: new Date().toISOString(),
  };

  const statusColor =
    show.status === "Running"
      ? "bg-green-500/20 text-green-400"
      : show.status === "Ended"
      ? "bg-red-500/20 text-red-400"
      : "bg-yellow-500/20 text-yellow-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-[140px] h-[196px] sm:w-[200px] sm:h-[280px] flex-shrink-0 bg-[#1e293b] rounded-lg overflow-hidden mx-auto md:mx-0">
          {show.image?.original ? (
            <Image
              src={show.image.original}
              alt={show.name}
              fill
              className="object-cover"
              sizes="200px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                <path d="M19.5 6h-15v9h15V6z" />
                <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H9.75v1.5H6a.75.75 0 000 1.5h12a.75.75 0 000-1.5h-3.75V18h6.375c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375zM3 4.875C3 4.668 3.168 4.5 3.375 4.5h17.25c.207 0 .375.168.375.375v11.25a.375.375 0 01-.375.375H3.375A.375.375 0 013 16.125V4.875z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{show.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className={`px-2.5 py-1 rounded-md text-sm font-medium ${statusColor}`}>
                {show.status}
              </span>
              <span className="text-blue-400 font-medium text-lg">{network}</span>
              {show.type && <span className="text-slate-400">({show.type})</span>}
            </div>
          </div>

          {/* Air schedule info */}
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Schedule</h3>
            <p className="text-lg">{airTime}</p>
            {show.premiered && (
              <p className="text-sm text-slate-400">
                Premiered: {new Date(show.premiered).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
            {show.ended && (
              <p className="text-sm text-slate-400">
                Ended: {new Date(show.ended).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
            {show.averageRuntime && (
              <p className="text-sm text-slate-400">Runtime: {show.averageRuntime} min</p>
            )}
          </div>

          {/* Next episode banner */}
          {nextEpisode && (
            <div className={`rounded-lg border p-3 ${
              isNewSeason
                ? "bg-purple-500/10 border-purple-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isNewSeason ? (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold uppercase">
                    New Season
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold uppercase">
                    Next Episode
                  </span>
                )}
              </div>
              <p className="font-medium">
                S{nextEpisode.season}E{String(nextEpisode.number || 0).padStart(2, "0")}: {nextEpisode.name}
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                {nextEpisode.airdate
                  ? new Date(nextEpisode.airdate + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Date TBA"}
                {nextEpisode.airtime ? ` at ${nextEpisode.airtime}` : ""}
              </p>
            </div>
          )}

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
            {show.officialSite && (
              <a
                href={show.officialSite}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#334155] hover:bg-[#475569] rounded-lg font-medium transition-colors"
              >
                Official Site
              </a>
            )}
            {show.externals.imdb && (
              <a
                href={`https://www.imdb.com/title/${show.externals.imdb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg font-medium transition-colors"
              >
                IMDb
              </a>
            )}
          </div>

          {listsWithShow.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-400">In lists:</span>
              {listsWithShow.map((l) => (
                <span key={l.id} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-sm">
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Summary</h3>
          <p className="text-slate-300 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Genres */}
      {show.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {show.genres.map((g) => (
            <span key={g} className="px-3 py-1 bg-[#334155] rounded-full text-sm text-slate-300">
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Episodes */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-bold">Episodes</h2>
          <div className="flex bg-[#1e293b] rounded-lg border border-[#334155] p-0.5">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "upcoming" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Upcoming ({upcomingEpisodes.length})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({episodes.length})
            </button>
          </div>
        </div>

        {displayEpisodes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-[#1e293b] rounded-lg border border-[#334155]">
            {activeTab === "upcoming"
              ? "No upcoming episodes scheduled"
              : "No episodes found"}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(seasons.entries())
              .sort(([a], [b]) => (activeTab === "upcoming" ? a - b : b - a))
              .map(([season, eps]) => (
                <div key={season} className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden">
                  <div className="px-4 py-3 bg-[#334155]/50 font-semibold">Season {season}</div>
                  <div className="divide-y divide-[#334155]">
                    {eps.map((ep) => {
                      const isToday = ep.airdate === today;
                      const isFuture = ep.airdate > today;
                      return (
                        <div
                          key={ep.id}
                          className={`px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 ${
                            isToday ? "bg-blue-500/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-sm font-mono shrink-0">
                                E{String(ep.number || 0).padStart(2, "0")}
                              </span>
                              <span className="font-medium truncate">{ep.name}</span>
                              {isToday && (
                                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium shrink-0">
                                  TODAY
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-sm ${isFuture || isToday ? "text-blue-400" : "text-slate-400"}`}>
                              {ep.airdate
                                ? new Date(ep.airdate + "T00:00:00").toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "TBA"}
                            </div>
                            {ep.airtime && (
                              <div className="text-xs text-slate-500">{ep.airtime}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showModal && <AddToListModal show={savedShow} onClose={() => setShowModal(false)} />}
    </div>
  );
}
