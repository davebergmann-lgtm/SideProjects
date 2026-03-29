"use client";

import { useState } from "react";
import { useLists, type SavedShow } from "@/contexts/ListsContext";

interface AddToListModalProps {
  show: SavedShow;
  onClose: () => void;
}

export default function AddToListModal({ show, onClose }: AddToListModalProps) {
  const { lists, createList, addShowToList, isShowInList, removeShowFromList } = useLists();
  const [newListName, setNewListName] = useState("");

  const handleCreateAndAdd = () => {
    if (!newListName.trim()) return;
    const list = createList(newListName.trim());
    addShowToList(list.id, show);
    setNewListName("");
  };

  const handleToggle = (listId: string) => {
    if (isShowInList(listId, show.id)) {
      removeShowFromList(listId, show.id);
    } else {
      addShowToList(listId, show);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#1e293b] rounded-xl border border-[#334155] w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#334155]">
          <h2 className="text-base sm:text-lg font-semibold truncate mr-2">Save &quot;{show.name}&quot; to List</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
          {lists.length === 0 && (
            <p className="text-slate-400 text-center py-4">
              No lists yet. Create one below!
            </p>
          )}
          {lists.map((list) => {
            const inList = isShowInList(list.id, show.id);
            return (
              <button
                key={list.id}
                onClick={() => handleToggle(list.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  inList
                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                    : "border-[#334155] hover:border-blue-500/50 text-slate-300"
                }`}
              >
                <span className="font-medium">{list.name}</span>
                <span className="text-sm">
                  {inList ? "Added" : `${list.shows.length} shows`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#334155]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name..."
              className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateAndAdd();
              }}
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={!newListName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              Create & Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
