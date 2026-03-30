"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface SavedShow {
  id: number;
  type?: "show" | "movie";
  name: string;
  network: string;
  airTime: string;
  status: string;
  image: string | null;
  premiered: string | null;
  genres: string[];
  addedAt: string;
  // Movie-specific fields
  releaseDate?: string | null;
  overview?: string | null;
  voteAverage?: number | null;
  runtime?: number | null;
}

export interface ShowList {
  id: string;
  name: string;
  createdAt: string;
  shows: SavedShow[];
}

interface ListsContextType {
  lists: ShowList[];
  createList: (name: string) => ShowList;
  deleteList: (listId: string) => void;
  renameList: (listId: string, name: string) => void;
  addShowToList: (listId: string, show: SavedShow) => void;
  removeShowFromList: (listId: string, showId: number, itemType?: "show" | "movie") => void;
  isShowInList: (listId: string, showId: number, itemType?: "show" | "movie") => boolean;
  getListsForShow: (showId: number, itemType?: "show" | "movie") => ShowList[];
  replaceLists: (newLists: ShowList[]) => void;
  syncStatus: "idle" | "saving" | "loading" | "error";
}

const ListsContext = createContext<ListsContextType | null>(null);

const STORAGE_KEY = "tv-tracker-lists";
const SYNC_CODE_KEY = "tv-tracker-sync-code";
const AUTO_SAVE_DELAY = 2000;
const POLL_INTERVAL = 30000;

function getSyncCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_CODE_KEY) || null;
}

function matchItem(item: SavedShow, id: number, itemType?: "show" | "movie"): boolean {
  const type = itemType || "show";
  const savedType = item.type || "show";
  return item.id === id && savedType === type;
}

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<ShowList[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "loading" | "error">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const lastSavedJsonRef = useRef<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ShowList[];
        // Normalize: ensure all items have a type field
        const normalized = parsed.map((list) => ({
          ...list,
          shows: list.shows.map((s) => ({ ...s, type: s.type || ("show" as const) })),
        }));
        setLists(normalized);
      } catch {}
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever lists change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    }
  }, [lists, loaded]);

  // Auto-pull from server on initial load
  useEffect(() => {
    if (!loaded) return;
    const code = getSyncCode();
    if (!code) return;

    setSyncStatus("loading");
    fetch(`/api/sync?code=${code}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.lists) {
          const remoteJson = JSON.stringify(data.lists);
          lastSavedJsonRef.current = remoteJson;
          isRemoteUpdateRef.current = true;
          setLists(data.lists);
        }
        setSyncStatus("idle");
      })
      .catch(() => setSyncStatus("idle"));
  }, [loaded]);

  // Auto-save to server when lists change (debounced)
  useEffect(() => {
    if (!loaded) return;

    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const code = getSyncCode();
    if (!code) return;

    const currentJson = JSON.stringify(lists);
    if (currentJson === lastSavedJsonRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      setSyncStatus("saving");
      try {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", code, lists }),
        });
        if (res.ok) {
          lastSavedJsonRef.current = currentJson;
        }
        setSyncStatus("idle");
      } catch {
        setSyncStatus("error");
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [lists, loaded]);

  // Poll for remote changes periodically
  useEffect(() => {
    if (!loaded) return;
    const code = getSyncCode();
    if (!code) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync?code=${code}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.lists) return;

        const remoteJson = JSON.stringify(data.lists);
        const localJson = JSON.stringify(lists);

        if (remoteJson !== localJson) {
          lastSavedJsonRef.current = remoteJson;
          isRemoteUpdateRef.current = true;
          setLists(data.lists);
        }
      } catch {}
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [loaded, lists]);

  const createList = useCallback((name: string): ShowList => {
    const newList: ShowList = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      shows: [],
    };
    setLists((prev) => [...prev, newList]);
    return newList;
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  }, []);

  const renameList = useCallback((listId: string, name: string) => {
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, name } : l)));
  }, []);

  const addShowToList = useCallback((listId: string, show: SavedShow) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        if (l.shows.some((s) => matchItem(s, show.id, show.type))) return l;
        return { ...l, shows: [...l.shows, { ...show, type: show.type || "show" }] };
      })
    );
  }, []);

  const removeShowFromList = useCallback((listId: string, showId: number, itemType?: "show" | "movie") => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return { ...l, shows: l.shows.filter((s) => !matchItem(s, showId, itemType)) };
      })
    );
  }, []);

  const isShowInList = useCallback(
    (listId: string, showId: number, itemType?: "show" | "movie") => {
      const list = lists.find((l) => l.id === listId);
      return list?.shows.some((s) => matchItem(s, showId, itemType)) ?? false;
    },
    [lists]
  );

  const getListsForShow = useCallback(
    (showId: number, itemType?: "show" | "movie") => {
      return lists.filter((l) => l.shows.some((s) => matchItem(s, showId, itemType)));
    },
    [lists]
  );

  const replaceLists = useCallback((newLists: ShowList[]) => {
    lastSavedJsonRef.current = JSON.stringify(newLists);
    isRemoteUpdateRef.current = true;
    setLists(newLists);
  }, []);

  if (!loaded) return null;

  return (
    <ListsContext.Provider
      value={{
        lists,
        createList,
        deleteList,
        renameList,
        addShowToList,
        removeShowFromList,
        isShowInList,
        getListsForShow,
        replaceLists,
        syncStatus,
      }}
    >
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error("useLists must be used within ListsProvider");
  return ctx;
}
