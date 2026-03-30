"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLists } from "@/contexts/ListsContext";
import { getShow, type Show } from "@/lib/tvmaze";

interface CalendarShow {
  id: number;
  name: string;
  network: string;
  time: string;
  image: string | null;
  status: string;
}

type DaySchedule = Record<string, CalendarShow[]>;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CalendarPage() {
  const { lists } = useLists();
  const [schedule, setSchedule] = useState<DaySchedule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allShowIds = new Set<number>();
    lists.forEach((list) => list.shows.forEach((s) => {
      if (!s.type || s.type === "show") allShowIds.add(s.id);
    }));

    if (allShowIds.size === 0) {
      setSchedule({});
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSchedules() {
      setLoading(true);
      setError(null);
      const dayMap: DaySchedule = {};
      DAYS.forEach((d) => (dayMap[d] = []));

      const ids = Array.from(allShowIds);
      // Fetch in batches of 8 to avoid hammering the API
      for (let i = 0; i < ids.length; i += 8) {
        const batch = ids.slice(i, i + 8);
        const results = await Promise.allSettled(batch.map((id) => getShow(id)));
        if (cancelled) return;

        results.forEach((result) => {
          if (result.status !== "fulfilled") return;
          const show: Show = result.value;
          if (show.status === "Ended") return; // Skip ended shows

          const networkName = show.network?.name || show.webChannel?.name || "Unknown";
          const calShow: CalendarShow = {
            id: show.id,
            name: show.name,
            network: networkName,
            time: show.schedule.time || "TBA",
            image: show.image?.medium || null,
            status: show.status,
          };

          if (show.schedule.days.length === 0) {
            // No scheduled day — put in a special bucket handled below
            return;
          }
          show.schedule.days.forEach((day) => {
            if (dayMap[day]) {
              dayMap[day].push(calShow);
            }
          });
        });
      }

      // Sort each day by time
      DAYS.forEach((day) => {
        dayMap[day].sort((a, b) => a.time.localeCompare(b.time));
      });

      if (!cancelled) {
        setSchedule(dayMap);
        setLoading(false);
      }
    }

    fetchSchedules().catch(() => {
      if (!cancelled) {
        setError("Failed to load schedule data");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [lists]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    let text = "MY WEEKLY TV SCHEDULE\n";
    text += "=".repeat(40) + "\n\n";
    DAYS.forEach((day) => {
      const shows = schedule[day] || [];
      text += `${day.toUpperCase()}\n`;
      text += "-".repeat(20) + "\n";
      if (shows.length === 0) {
        text += "  (no shows)\n";
      } else {
        shows.forEach((s) => {
          const time = s.time === "TBA" ? "TBA" : formatTime12h(s.time);
          text += `  ${time.padEnd(10)} ${s.name} (${s.network})\n`;
        });
      }
      text += "\n";
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tv-schedule.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalShows = DAYS.reduce((sum, day) => sum + (schedule[day]?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Weekly Calendar</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your saved shows organized by air day (ended shows excluded)
          </p>
        </div>
        {!loading && totalShows > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportText}
              className="px-3 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded-lg text-sm font-medium transition-colors border border-[#334155]"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                Export .txt
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded-lg text-sm font-medium transition-colors border border-[#334155] print:hidden"
            >
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.75v.75c0 .966-.784 1.75-1.75 1.75h-6.5A1.75 1.75 0 015 15.75V15h-.75A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.749-.107 1.126-.153V2.75zm1.5 0v3.379a49.71 49.71 0 017 0V2.75a.25.25 0 00-.25-.25h-6.5a.25.25 0 00-.25.25zm-1.079 7.19a1.237 1.237 0 112.474 0 1.237 1.237 0 01-2.474 0zM6.5 15.75v-3.5h7v3.5a.25.25 0 01-.25.25h-6.5a.25.25 0 01-.25-.25z" clipRule="evenodd" />
                </svg>
                Print
              </span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 mt-3">Loading show schedules...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">{error}</div>
      ) : totalShows === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">No active shows with scheduled air days</p>
          <p className="text-sm mt-1">Save some currently airing shows to see them here</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 mt-3 inline-block">
            Search for shows
          </Link>
        </div>
      ) : (
        <div ref={calendarRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 print:grid-cols-7 print:gap-1">
          {DAYS.map((day) => {
            const shows = schedule[day] || [];
            const isToday = new Date().toLocaleDateString("en-US", { weekday: "long" }) === day;
            return (
              <div
                key={day}
                className={`bg-[#1e293b] rounded-lg border overflow-hidden print:rounded-none print:border-gray-400 ${
                  isToday ? "border-blue-500" : "border-[#334155]"
                }`}
              >
                <div
                  className={`px-3 py-2 text-sm font-semibold print:text-black print:bg-gray-200 ${
                    isToday ? "bg-blue-600 text-white" : "bg-[#0f172a] text-slate-300"
                  }`}
                >
                  {day}
                  {isToday && <span className="ml-1 text-xs font-normal opacity-75">(today)</span>}
                  {shows.length > 0 && (
                    <span className="ml-1 text-xs opacity-60">({shows.length})</span>
                  )}
                </div>
                <div className="p-2 space-y-2 print:space-y-1">
                  {shows.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-3 print:text-gray-400">—</p>
                  ) : (
                    shows.map((show) => (
                      <Link
                        key={show.id}
                        href={`/show/${show.id}`}
                        className="block p-2 rounded bg-[#0f172a] hover:bg-[#334155] transition-colors print:bg-white print:border print:border-gray-300 print:p-1"
                      >
                        <div className="flex items-start gap-2">
                          {show.image && (
                            <div className="relative w-8 h-11 flex-shrink-0 rounded overflow-hidden print:hidden">
                              <Image src={show.image} alt={show.name} fill className="object-cover" sizes="32px" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-white truncate print:text-black">
                              {show.name}
                            </p>
                            <p className="text-xs text-blue-400 truncate print:text-gray-600">
                              {show.network}
                            </p>
                            <p className="text-xs text-slate-500 print:text-gray-500">
                              {show.time === "TBA" ? "TBA" : formatTime12h(show.time)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${ampm}`;
}
