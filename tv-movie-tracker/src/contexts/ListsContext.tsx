"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { Show } from "@/lib/tvmaze";

export interface SavedShow {
  id: number;
  name: string;
  network: string;
  airTime: string;
  status: string;
  image: string | null;
  premiered: string | null;
  genres: string[];
  addedAt: string;
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
  removeShowFromList: (listId: string, showId: number) => void;
  isShowInList: (listId: string, showId: number) => boolean;
  getListsForShow: (showId: number) => ShowList[];
  replaceLists: (newLists: ShowList[]) => void;
  syncStatus: "idle" | "saving" | "loading" | "error";
}

const ListsContext = createContext<ListsContextType | null>(null);

const STORAGE_KEY = "tv-tracker-lists";
const SYNC_CODE_KEY = "tv-tracker-sync-code";
const AUTO_SAVE_DELAY = 2000; // 2 seconds debounce
const POLL_INTERVAL = 30000; // 30 seconds

function getSyncCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SYNC_CODE_KEY) || null;
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
        setLists(JSON.parse(stored));
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

    // Skip if this change came from a remote pull
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    const code = getSyncCode();
    if (!code) return;

    const currentJson = JSON.stringify(lists);
    // Skip if nothing actually changed
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

        // Only update if remote is different from local
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
        if (l.shows.some((s) => s.id === show.id)) return l;
        return { ...l, shows: [...l.shows, show] };
      })
    );
  }, []);

  const removeShowFromList = useCallback((listId: string, showId: number) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return { ...l, shows: l.shows.filter((s) => s.id !== showId) };
      })
    );
  }, []);

  const isShowInList = useCallback(
    (listId: string, showId: number) => {
      const list = lists.find((l) => l.id === listId);
      return list?.shows.some((s) => s.id === showId) ?? false;
    },
    [lists]
  );

  const getListsForShow = useCallback(
    (showId: number) => {
      return lists.filter((l) => l.shows.some((s) => s.id === showId));
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
