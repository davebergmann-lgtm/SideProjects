"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLists } from "./ListsContext";

interface NotificationSettings {
  enabled: boolean;
  checkIntervalMinutes: number;
  notifiedEpisodes: string[]; // "showId-SxxExx" format
}

interface NotificationContextType {
  settings: NotificationSettings;
  toggleNotifications: () => void;
  requestPermission: () => Promise<boolean>;
  permissionState: NotificationPermission | "unsupported";
  recentNotifications: NotificationEntry[];
}

interface NotificationEntry {
  id: string;
  showName: string;
  episodeName: string;
  airdate: string;
  timestamp: string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const SETTINGS_KEY = "tv-tracker-notification-settings";
const NOTIFICATIONS_KEY = "tv-tracker-recent-notifications";
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { lists } = useLists();
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    checkIntervalMinutes: 30,
    notifiedEpisodes: [],
  });
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [recentNotifications, setRecentNotifications] = useState<NotificationEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPermissionState("unsupported");
    } else {
      setPermissionState(Notification.permission);
    }

    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {}
    }

    const storedNotifs = localStorage.getItem(NOTIFICATIONS_KEY);
    if (storedNotifs) {
      try {
        setRecentNotifications(JSON.parse(storedNotifs));
      } catch {}
    }

    setLoaded(true);
  }, []);

  // Persist settings
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(recentNotifications));
    }
  }, [recentNotifications, loaded]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermissionState(result);
    return result === "granted";
  }, []);

  const toggleNotifications = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  // Check for upcoming episodes
  const checkForEpisodes = useCallback(async () => {
    if (!settings.enabled || permissionState !== "granted") return;

    const allShowIds = new Set<number>();
    lists.forEach((list) => list.shows.forEach((s) => allShowIds.add(s.id)));

    if (allShowIds.size === 0) return;

    const today = new Date().toISOString().split("T")[0];

    for (const showId of Array.from(allShowIds)) {
      try {
        const res = await fetch(`https://api.tvmaze.com/shows/${showId}?embed=nextepisode`);
        if (!res.ok) continue;
        const data = await res.json();

        const nextEp = data._embedded?.nextepisode;
        if (!nextEp) continue;

        const epKey = `${showId}-S${String(nextEp.season).padStart(2, "0")}E${String(nextEp.number || 0).padStart(2, "0")}`;

        if (settings.notifiedEpisodes.includes(epKey)) continue;

        // Notify if episode airs today or tomorrow
        const epDate = nextEp.airdate;
        const todayDate = new Date(today);
        const epDateObj = new Date(epDate);
        const diffDays = Math.floor((epDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 1) {
          const when = diffDays === 0 ? "today" : "tomorrow";
          const title = `${data.name} - New Episode ${when}!`;
          const body = `S${nextEp.season}E${nextEp.number}: "${nextEp.name}" airs ${when} at ${nextEp.airtime || "TBA"}`;

          new Notification(title, {
            body,
            icon: data.image?.medium,
            tag: epKey,
          });

          const entry: NotificationEntry = {
            id: epKey,
            showName: data.name,
            episodeName: `S${nextEp.season}E${nextEp.number}: ${nextEp.name}`,
            airdate: nextEp.airdate,
            timestamp: new Date().toISOString(),
          };

          setRecentNotifications((prev) => [entry, ...prev].slice(0, 50));
          setSettings((prev) => ({
            ...prev,
            notifiedEpisodes: [...prev.notifiedEpisodes, epKey].slice(-200),
          }));
        }
      } catch {}
    }
  }, [settings.enabled, settings.notifiedEpisodes, permissionState, lists]);

  // Set up interval
  useEffect(() => {
    if (settings.enabled && permissionState === "granted") {
      checkForEpisodes();
      intervalRef.current = setInterval(checkForEpisodes, CHECK_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.enabled, permissionState, checkForEpisodes]);

  if (!loaded) return null;

  return (
    <NotificationContext.Provider
      value={{
        settings,
        toggleNotifications,
        requestPermission,
        permissionState,
        recentNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
