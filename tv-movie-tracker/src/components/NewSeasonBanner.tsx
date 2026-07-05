"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLists } from "@/contexts/ListsContext";

interface SeasonAlert {
  showId: number;
  showName: string;
  season: number;
  airdate: string;
  image: string | null;
}

const DISMISSED_KEY = "tv-tracker-dismissed-season-alerts";

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

function alertKey(showId: number, season: number): string {
  return `${showId}-S${season}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NewSeasonBanner() {
  const { lists } = useLists();
  const [alerts, setAlerts] = useState<SeasonAlert[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDismissed(getDismissed());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const showIds = new Set<number>();
    const showNames = new Map<number, string>();
    const showImages = new Map<number, string | null>();
    lists.forEach((list) =>
      list.shows.forEach((s) => {
        if (!s.type || s.type === "show") {
          showIds.add(s.id);
          showNames.set(s.id, s.name);
          showImages.set(s.id, s.image);
        }
      })
    );

    if (showIds.size === 0) return;

    let cancelled = false;

    async function checkSeasons() {
      const ids = Array.from(showIds);
      const found: SeasonAlert[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

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
          if (!nextEp || nextEp.number !== 1) return;

          const epDate = new Date(nextEp.airdate + "T00:00:00");
          const isRecent = epDate >= weekAgo && epDate <= new Date(today.getTime() + 14 * 86400000);

          if (isRecent) {
            found.push({
              showId: show.id,
              showName: show.name,
              season: nextEp.season,
              airdate: nextEp.airdate,
              image: show.image?.medium || null,
            });
          }
        });
      }

      if (!cancelled) {
        setAlerts(found);
      }
    }

    checkSeasons();
    return () => { cancelled = true; };
  }, [lists, loaded]);

  const dismiss = (key: string) => {
    const updated = [...dismissed, key];
    setDismissed(updated);
    saveDismissed(updated);
  };

  const dismissAll = () => {
    const allKeys = visibleAlerts.map((a) => alertKey(a.showId, a.season));
    const updated = [...dismissed, ...allKeys];
    setDismissed(updated);
    saveDismissed(updated);
  };

  const visibleAlerts = alerts.filter(
    (a) => !dismissed.includes(alertKey(a.showId, a.season))
  );

  if (!loaded || visibleAlerts.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {visibleAlerts.map((alert) => {
          const key = alertKey(alert.showId, alert.season);
          const isPast = alert.airdate <= today;
          const isToday = alert.airdate === today;
          return (
            <div
              key={key}
              className="flex items-center justify-between py-2.5 gap-3 border-b border-green-500 last:border-0"
            >
              <Link
                href={`/show/${alert.showId}`}
                className="flex items-center gap-2 min-w-0 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-sm sm:text-base truncate">
                  {alert.showName}
                </span>
                <span className="text-green-100 text-sm whitespace-nowrap">
                  {isToday
                    ? `Season ${alert.season} premieres today!`
                    : isPast
                    ? `Season ${alert.season} is now airing!`
                    : `Season ${alert.season} premieres ${formatDate(alert.airdate)}`}
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
