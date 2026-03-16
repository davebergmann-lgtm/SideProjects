"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLists, type SavedShow } from "@/contexts/ListsContext";

type SortField = "added" | "name" | "network" | "date";
type SortDir = "asc" | "desc";

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const { lists, removeShowFromList, deleteList } = useLists();
  const [sortField, setSortField] = useState<SortField>("added");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const list = lists.find((l) => l.id === listId);

  const sortedShows = useMemo(() => {
    if (!list) return [];
    const shows = [...list.shows];
    shows.sort((a: SavedShow, b: SavedShow) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "network":
          cmp = (a.network || "").localeCompare(b.network || "");
          break;
        case "date":
          cmp = (a.premiered || "").localeCompare(b.premiered || "");
          break;
        case "added":
        default:
          cmp = (a.addedAt || "").localeCompare(b.addedAt || "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return shows;
  }, [list, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" || field === "network" ? "asc" : "desc");
    }
  };

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">List not found</p>
        <Link href="/lists" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
          Back to lists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/lists" className="text-sm text-slate-400 hover:text-white transition-colors">
            &larr; All Lists
          </Link>
          <h1 className="text-2xl font-bold mt-1">{list.name}</h1>
          <p className="text-slate-400 text-sm">
            {list.shows.length} {list.shows.length === 1 ? "show" : "shows"}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm(`Delete "${list.name}"?`)) {
              deleteList(list.id);
              router.push("/lists");
            }
          }}
          className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
        >
          Delete List
        </button>
      </div>

      {list.shows.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg">This list is empty</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
            Search for shows to add
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sort controls */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Sort by:</span>
            {([
              ["added", "Date Added"],
              ["name", "Name"],
              ["network", "Network"],
              ["date", "Premiere Date"],
            ] as const).map(([field, label]) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  sortField === field
                    ? "bg-blue-600 text-white"
                    : "bg-[#1e293b] text-slate-300 hover:bg-[#334155]"
                }`}
              >
                {label}
                {sortField === field && (
                  <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                )}
              </button>
            ))}
          </div>

          {sortedShows.map((show) => {
            const statusColor =
              show.status === "Running"
                ? "text-green-400"
                : show.status === "Ended"
                ? "text-red-400"
                : "text-yellow-400";

            return (
              <div
                key={show.id}
                className="flex gap-4 bg-[#1e293b] rounded-lg border border-[#334155] overflow-hidden group"
              >
                <Link href={`/show/${show.id}`} className="flex gap-4 flex-1 min-w-0">
                  <div className="relative w-[80px] min-h-[110px] flex-shrink-0 bg-[#0f172a]">
                    {show.image ? (
                      <Image src={show.image} alt={show.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                          <path d="M19.5 6h-15v9h15V6z" />
                          <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H9.75v1.5H6a.75.75 0 000 1.5h12a.75.75 0 000-1.5h-3.75V18h6.375c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375zM3 4.875C3 4.668 3.168 4.5 3.375 4.5h17.25c.207 0 .375.168.375.375v11.25a.375.375 0 01-.375.375H3.375A.375.375 0 013 16.125V4.875z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="py-3 flex flex-col justify-center min-w-0">
                    <h3 className="font-semibold group-hover:text-blue-400 transition-colors truncate">
                      {show.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-blue-400">{show.network}</span>
                      <span className={statusColor}>{show.status}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{show.airTime}</p>
                    {show.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {show.genres.slice(0, 3).map((g) => (
                          <span key={g} className="px-1.5 py-0.5 bg-[#334155] rounded text-xs text-slate-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex items-center pr-4">
                  <button
                    onClick={() => removeShowFromList(list.id, show.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove from list"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
