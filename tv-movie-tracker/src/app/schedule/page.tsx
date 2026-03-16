"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSchedule, getStreamingSchedule, type ScheduleEntry } from "@/lib/tvmaze";

function formatDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SchedulePage() {
  const [dateOffset, setDateOffset] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"tv" | "streaming">("tv");

  const currentDate = formatDate(dateOffset);

  useEffect(() => {
    setLoading(true);
    const fetcher = source === "tv" ? getSchedule : getStreamingSchedule;
    fetcher(currentDate, "US")
      .then((data) => {
        // Sort by time
        data.sort((a, b) => (a.airtime || "").localeCompare(b.airtime || ""));
        setSchedule(data);
      })
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, [currentDate, source]);

  const dayLabel =
    dateOffset === 0 ? "Today" : dateOffset === 1 ? "Tomorrow" : dateOffset === -1 ? "Yesterday" : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">TV Schedule</h1>

      {/* Date navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateOffset((d) => d - 1)}
            className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-colors"
          >
            &larr;
          </button>
          <div className="text-center min-w-[200px]">
            <div className="font-semibold">{formatDisplayDate(currentDate)}</div>
            {dayLabel && <div className="text-sm text-blue-400">{dayLabel}</div>}
          </div>
          <button
            onClick={() => setDateOffset((d) => d + 1)}
            className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#334155] transition-colors"
          >
            &rarr;
          </button>
          {dateOffset !== 0 && (
            <button
              onClick={() => setDateOffset(0)}
              className="px-3 py-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex bg-[#1e293b] rounded-lg border border-[#334155] p-0.5">
          <button
            onClick={() => setSource("tv")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              source === "tv" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            TV Networks
          </button>
          <button
            onClick={() => setSource("streaming")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              source === "streaming" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Streaming
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No shows scheduled for this date</div>
      ) : (
        <div className="space-y-2">
          {schedule.map((entry) => (
            <Link
              key={entry.id}
              href={`/show/${entry.show.id}`}
              className="flex gap-3 bg-[#1e293b] rounded-lg border border-[#334155] hover:border-blue-500/50 transition-all overflow-hidden group"
            >
              <div className="relative w-[60px] min-h-[80px] flex-shrink-0 bg-[#0f172a]">
                {entry.show.image?.medium ? (
                  <Image
                    src={entry.show.image.medium}
                    alt={entry.show.name}
                    fill
                    className="object-cover"
                    sizes="60px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#334155]" />
                )}
              </div>
              <div className="py-2 pr-3 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold group-hover:text-blue-400 transition-colors truncate">
                      {entry.show.name}
                    </h3>
                    <p className="text-sm text-slate-400 truncate">
                      S{entry.season}E{entry.number || "?"}: {entry.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-blue-400 font-medium">
                      {entry.airtime || "TBA"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.show.network?.name || entry.show.webChannel?.name || ""}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <p className="text-center text-sm text-slate-500 pt-2">
            {schedule.length} shows scheduled
          </p>
        </div>
      )}
    </div>
  );
}
