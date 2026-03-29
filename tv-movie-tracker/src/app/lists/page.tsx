"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLists } from "@/contexts/ListsContext";

export default function ListsPage() {
  const { lists, createList, deleteList, renameList } = useLists();
  const [newListName, setNewListName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = () => {
    if (!newListName.trim()) return;
    createList(newListName.trim());
    setNewListName("");
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = () => {
    if (editingId && editName.trim()) {
      renameList(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">My Lists</h1>
      </div>

      {/* Create new list */}
      <div className="flex gap-2 w-full sm:max-w-md">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Create a new list..."
          className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#1e293b] border border-[#334155] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <button
          onClick={handleCreate}
          disabled={!newListName.trim()}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          Create
        </button>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-50">
            <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V12z" clipRule="evenodd" />
            <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
          </svg>
          <p className="text-lg">No lists yet</p>
          <p className="text-sm mt-1">Create a list to start saving shows</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden hover:border-blue-500/30 transition-colors"
            >
              {/* Preview images */}
              <div className="h-24 bg-[#0f172a] flex">
                {list.shows.slice(0, 4).map((s) => (
                  <div key={s.id} className="relative flex-1 h-full">
                    {s.image ? (
                      <Image src={s.image} alt={s.name} fill className="object-cover" sizes="25vw" />
                    ) : (
                      <div className="w-full h-full bg-[#334155]" />
                    )}
                  </div>
                ))}
                {list.shows.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    Empty list
                  </div>
                )}
              </div>

              <div className="p-4">
                {editingId === list.id ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 bg-[#0f172a] border border-[#334155] rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                    <button onClick={saveRename} className="text-sm text-blue-400 hover:text-blue-300">
                      Save
                    </button>
                  </div>
                ) : (
                  <Link href={`/lists/${list.id}`} className="block">
                    <h3 className="font-semibold text-lg hover:text-blue-400 transition-colors">
                      {list.name}
                    </h3>
                  </Link>
                )}
                <p className="text-sm text-slate-400 mt-1">
                  {list.shows.length} {list.shows.length === 1 ? "show" : "shows"}
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => startRename(list.id, list.name)}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${list.name}"?`)) deleteList(list.id);
                    }}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
