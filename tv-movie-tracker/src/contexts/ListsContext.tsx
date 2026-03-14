"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
}

const ListsContext = createContext<ListsContextType | null>(null);

const STORAGE_KEY = "tv-tracker-lists";

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<ShowList[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLists(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    }
  }, [lists, loaded]);

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
