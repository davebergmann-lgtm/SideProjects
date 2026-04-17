"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLists } from "./ListsContext";

export interface NotificationPreferences {
  episodeWithin24h: boolean;
  episodeAired: boolean;
  newSeasonAnnounced: boolean;
  showCanceled: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  checkIntervalMinutes: number;
  notifiedEpisodes: string[];
  preferences: NotificationPreferences;
  email: string;
  phone: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  knownStatuses: Record<number, string>;
  knownNextEpisodes: Record<number, string>;
}

interface NotificationContextType {
  settings: NotificationSettings;
  toggleNotifications: () => void;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  updateContactInfo: (info: { email?: string; phone?: string; emailEnabled?: boolean; smsEnabled?: boolean }) => void;
  requestPermission: () => Promise<boolean>;
  permissionState: NotificationPermission | "unsupported";
  recentNotifications: NotificationEntry[];
  clearHistory: () => void;
}

export interface NotificationEntry {
  id: string;
  showName: string;
  episodeName: string;
  airdate: string;
  timestamp: string;
  type: "episode_soon" | "episode_aired" | "new_season" | "show_canceled";
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const SETTINGS_KEY = "tv-tracker-notification-settings";
const NOTIFICATIONS_KEY = "tv-tracker-recent-notifications";
const CHECK_INTERVAL = 30 * 60 * 1000;

const DEFAULT_PREFERENCES: NotificationPreferences = {
  episodeWithin24h: true,
  episodeAired: true,
  newSeasonAnnounced: true,
  showCanceled: true,
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  checkIntervalMinutes: 30,
  notifiedEpisodes: [],
  preferences: DEFAULT_PREFERENCES,
  email: "",
  phone: "",
  emailEnabled: false,
  smsEnabled: false,
  knownStatuses: {},
  knownNextEpisodes: {},
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { lists } = useLists();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [recentNotifications, setRecentNotifications] = useState<NotificationEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        const parsed = JSON.parse(stored);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences || {}) },
        });
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

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
  }, []);

  const updateContactInfo = useCallback((info: { email?: string; phone?: string; emailEnabled?: boolean; smsEnabled?: boolean }) => {
    setSettings((prev) => ({ ...prev, ...info }));
  }, []);

  const clearHistory = useCallback(() => {
    setRecentNotifications([]);
  }, []);

  const addNotification = useCallback((entry: NotificationEntry) => {
    setRecentNotifications((prev) => [entry, ...prev].slice(0, 50));
  }, []);

  const checkForEpisodes = useCallback(async () => {
    if (!settings.enabled || permissionState !== "granted") return;

    const allShowIds = new Set<number>();
    lists.forEach((list) => list.shows.forEach((s) => {
      if (!s.type || s.type === "show") allShowIds.add(s.id);
    }));

    if (allShowIds.size === 0) return;

    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);
    const newStatuses: Record<number, string> = {};
    const newNextEps: Record<number, string> = {};

    for (const showId of Array.from(allShowIds)) {
      try {
        const res = await fetch(`https://api.tvmaze.com/shows/${showId}?embed=nextepisode`);
        if (!res.ok) continue;
        const data = await res.json();

        const currentStatus = data.status;
        const previousStatus = settings.knownStatuses[showId];
        newStatuses[showId] = currentStatus;

        // Show canceled notification
        if (
          settings.preferences.showCanceled &&
          previousStatus &&
          previousStatus !== "Ended" &&
          currentStatus === "Ended"
        ) {
          const cancelKey = `canceled-${showId}`;
          if (!settings.notifiedEpisodes.includes(cancelKey)) {
            new Notification(`${data.name} - Canceled`, {
              body: `${data.name} has been marked as ended.`,
              icon: data.image?.medium,
              tag: cancelKey,
            });
            addNotification({
              id: cancelKey,
              showName: data.name,
              episodeName: "Show ended/canceled",
              airdate: today,
              timestamp: new Date().toISOString(),
              type: "show_canceled",
            });
            setSettings((prev) => ({
              ...prev,
              notifiedEpisodes: [...prev.notifiedEpisodes, cancelKey].slice(-200),
            }));
          }
        }

        const nextEp = data._embedded?.nextepisode;
        if (!nextEp) {
          newNextEps[showId] = "";
          continue;
        }

        const nextEpKey = `S${nextEp.season}E${nextEp.number || 0}`;
        const previousNextEp = settings.knownNextEpisodes[showId];
        newNextEps[showId] = nextEpKey;

        // New season announced notification
        if (
          settings.preferences.newSeasonAnnounced &&
          previousNextEp !== undefined &&
          previousNextEp !== nextEpKey &&
          nextEp.number === 1
        ) {
          const seasonKey = `season-${showId}-S${nextEp.season}`;
          if (!settings.notifiedEpisodes.includes(seasonKey)) {
            new Notification(`${data.name} - New Season!`, {
              body: `Season ${nextEp.season} premieres ${nextEp.airdate || "date TBA"}`,
              icon: data.image?.medium,
              tag: seasonKey,
            });
            addNotification({
              id: seasonKey,
              showName: data.name,
              episodeName: `Season ${nextEp.season} premiere announced`,
              airdate: nextEp.airdate || "TBA",
              timestamp: new Date().toISOString(),
              type: "new_season",
            });
            setSettings((prev) => ({
              ...prev,
              notifiedEpisodes: [...prev.notifiedEpisodes, seasonKey].slice(-200),
            }));
          }
        }

        const epKey = `${showId}-S${String(nextEp.season).padStart(2, "0")}E${String(nextEp.number || 0).padStart(2, "0")}`;
        const epDate = nextEp.airdate;
        const epDateObj = new Date(epDate);
        const diffDays = Math.floor((epDateObj.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

        // Episode within 24h notification
        if (
          settings.preferences.episodeWithin24h &&
          diffDays === 1 &&
          !settings.notifiedEpisodes.includes(`soon-${epKey}`)
        ) {
          new Notification(`${data.name} - Tomorrow!`, {
            body: `S${nextEp.season}E${nextEp.number}: "${nextEp.name}" airs tomorrow at ${nextEp.airtime || "TBA"}`,
            icon: data.image?.medium,
            tag: `soon-${epKey}`,
          });
          addNotification({
            id: `soon-${epKey}`,
            showName: data.name,
            episodeName: `S${nextEp.season}E${nextEp.number}: ${nextEp.name}`,
            airdate: nextEp.airdate,
            timestamp: new Date().toISOString(),
            type: "episode_soon",
          });
          setSettings((prev) => ({
            ...prev,
            notifiedEpisodes: [...prev.notifiedEpisodes, `soon-${epKey}`].slice(-200),
          }));
        }

        // Episode aired today notification
        if (
          settings.preferences.episodeAired &&
          diffDays === 0 &&
          !settings.notifiedEpisodes.includes(`aired-${epKey}`)
        ) {
          new Notification(`${data.name} - New Episode!`, {
            body: `S${nextEp.season}E${nextEp.number}: "${nextEp.name}" airs today at ${nextEp.airtime || "TBA"}`,
            icon: data.image?.medium,
            tag: `aired-${epKey}`,
          });
          addNotification({
            id: `aired-${epKey}`,
            showName: data.name,
            episodeName: `S${nextEp.season}E${nextEp.number}: ${nextEp.name}`,
            airdate: nextEp.airdate,
            timestamp: new Date().toISOString(),
            type: "episode_aired",
          });
          setSettings((prev) => ({
            ...prev,
            notifiedEpisodes: [...prev.notifiedEpisodes, `aired-${epKey}`].slice(-200),
          }));
        }
      } catch {}
    }

    setSettings((prev) => ({
      ...prev,
      knownStatuses: { ...prev.knownStatuses, ...newStatuses },
      knownNextEpisodes: { ...prev.knownNextEpisodes, ...newNextEps },
    }));
  }, [settings.enabled, settings.notifiedEpisodes, settings.preferences, settings.knownStatuses, settings.knownNextEpisodes, permissionState, lists, addNotification]);

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
        updatePreferences,
        updateContactInfo,
        requestPermission,
        permissionState,
        recentNotifications,
        clearHistory,
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
