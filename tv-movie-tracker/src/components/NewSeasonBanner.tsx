"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLists } from "@/contexts/ListsContext";

interface EpisodeAlert {
  showId: number;
  showName: string;
  season: number;
  episode: number | null;
  episodeName: string;
  airdate: string;
  isSeasonPremiere: boolean;
}

const DISMISSED_KEY = "tv-tracker-dismissed-episode-alerts";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDismissed(dismissed: string[]) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
}

function makeKey(alert: EpisodeAlert): string {
  return `${alert.showId}-S${alert.season}E${alert.episode || 0}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function NewSeasonBanner() {
  const { lists } = useLists();
  const [alerts, setAlerts] = useState<EpisodeAlert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDismissed(getDismissed());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const showIds = new Set<number>();
    lists.forEach((list) =>
      list.shows.forEach((s) => {
        if (!s.type || s.type === "show") {
          showIds.add(s.id);
        }
      })
    );

    if (showIds.size === 0) return;

    let cancelled = false;

    async function checkEpisodes() {
      const ids = Array.from(showIds);
      const found: EpisodeAlert[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthFromNow = new Date(today.getTime() + 30 * 86400000);

      for (let i = 0; i < ids.length; i += 6) {
        const batch = ids.slice(i, i + 6);
        const results = await Promise.allSettled(
          batch.map((id) =>
            fetch(`https://api.tvmaze.com/shows/${id}?embed=nextepisode`).then((r) =>
              r.ok ? r.json() : null
            )
          )
        );
        if (cancelled) return;

        results.forEach((result) => {
          if (result.status !== "fulfilled" || !result.value) return;
          const show = result.value;
          const nextEp = show._embedded?.nextepisode;
          if (!nextEp || !nextEp.airdate) return;

          const epDate = new Date(nextEp.airdate + "T00:00:00");

          if (epDate >= today && epDate <= monthFromNow) {
            found.push({
              showId: show.id,
              showName: show.name,
              season: nextEp.season,
              episode: nextEp.number,
              episodeName: nextEp.name,
              airdate: nextEp.airdate,
              isSeasonPremiere: nextEp.number === 1,
            });
          }
        });
      }

      if (!cancelled) {
        found.sort((a, b) => a.airdate.localeCompare(b.airdate));
        setAlerts(found);
      }
    }

    checkEpisodes();
    return () => { cancelled = true; };
  }, [lists, loaded]);

  const dismiss = (key: string) => {
    const updated = [...dismissed, key];
    setDismissed(updated);
    saveDismissed(updated);
  };

  const dismissAll = () => {
    const allKeys = visibleAlerts.map(makeKey);
    const updated = [...dismissed, ...allKeys];
    setDismissed(updated);
    saveDismissed(updated);
  };

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(makeKey(a)));

  if (!loaded || visibleAlerts.length === 0) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {visibleAlerts.map((alert) => {
          const key = makeKey(alert);
          const isToday = alert.airdate === todayStr;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const isTomorrow = alert.airdate === tomorrow.toISOString().split("T")[0];

          let message: string;
          if (alert.isSeasonPremiere) {
            if (isToday) message = `Season ${alert.season} premieres today!`;
            else if (isTomorrow) message = `Season ${alert.season} premieres tomorrow!`;
            else message = `Season ${alert.season} premieres ${formatDate(alert.airdate)}`;
          } else {
            const epLabel = `S${alert.season}E${alert.episode}`;
            if (isToday) message = `${epLabel} "${alert.episodeName}" airs today!`;
            else if (isTomorrow) message = `${epLabel} "${alert.episodeName}" airs tomorrow!`;
            else message = `${epLabel} "${alert.episodeName}" airs ${formatDate(alert.airdate)}`;
          }

          return (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 gap-3 border-b border-green-500 last:border-0"
            >
              <Link
                href={`/show/${alert.showId}`}
                className="flex items-center gap-2 min-w-0 hover:underline"
              >
                {alert.isSeasonPremiere ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
                  </svg>
                )}
                <span className="font-semibold text-sm sm:text-base truncate">
                  {alert.showName}
                </span>
                <span className="text-green-100 text-xs sm:text-sm whitespace-nowrap">
                  {message}
                </span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  dismiss(key);
                }}
                className="p-1 hover:bg-green-700 rounded transition-colors flex-shrink-0"
                aria-label={`Dismiss ${alert.showName} alert`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          );
        })}
        {visibleAlerts.length > 1 && (
          <div className="flex justify-end py-1">
            <button
              onClick={dismissAll}
              className="text-xs text-green-200 hover:text-white transition-colors"
            >
              Dismiss all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
