"use client";

import { useState } from "react";
import { useLists } from "@/contexts/ListsContext";

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SyncModal({ open, onClose }: SyncModalProps) {
  const { lists, replaceLists, syncStatus } = useLists();
  const [syncCode, setSyncCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tv-tracker-sync-code") || "";
    }
    return "";
  });
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", lists }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Failed to generate code");
      setSyncCode(data.code);
      localStorage.setItem("tv-tracker-sync-code", data.code);
      setStatus("Sync code created! Auto-sync is now active.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const handlePullFromServer = async (codeToUse: string) => {
    const code = codeToUse.toUpperCase().trim();
    if (code.length !== 6) {
      setError("Sync code must be 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/sync?code=${code}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Failed to load");
      replaceLists(data.lists);
      setSyncCode(code);
      localStorage.setItem("tv-tracker-sync-code", code);
      setStatus(`Loaded ${data.lists.length} list(s). Auto-sync is now active.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const syncStatusLabel =
    syncStatus === "saving"
      ? "Syncing..."
      : syncStatus === "loading"
      ? "Loading..."
      : syncStatus === "error"
      ? "Sync error"
      : "Auto-sync active";

  const syncStatusColor =
    syncStatus === "error"
      ? "text-red-400"
      : syncStatus === "saving" || syncStatus === "loading"
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-xl max-w-md w-full p-6 border border-[#334155]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Sync Across Devices</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}
        {status && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg p-3 mb-4 text-sm">
            {status}
          </div>
        )}

        {/* Current sync code display */}
        {syncCode && (
          <div className="mb-5">
            <p className="text-slate-400 text-sm mb-2">Your sync code:</p>
            <div className="bg-[#0f172a] rounded-lg p-4 text-center">
              <span className="text-3xl font-mono font-bold text-blue-400 tracking-[0.3em]">
                {syncCode}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-slate-500 text-xs">
                Enter this code on your other devices to stay in sync.
              </p>
              <span className={`text-xs font-medium ${syncStatusColor}`}>
                {syncStatusLabel}
              </span>
            </div>
            <div className="bg-[#0f172a] rounded-lg p-3 mt-3 text-xs text-slate-400">
              Changes sync automatically. Edits on this device upload within 2 seconds. Updates from other devices appear within 30 seconds.
            </div>
          </div>
        )}

        {/* Generate new code */}
        {!syncCode && (
          <div className="mb-5">
            <p className="text-slate-300 text-sm mb-3">
              Generate a sync code to automatically keep your lists in sync across devices.
            </p>
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-3 font-medium transition-colors"
            >
              {loading ? "Generating..." : "Generate Sync Code"}
            </button>
          </div>
        )}

        {/* Enter a code from another device */}
        <div className="border-t border-[#334155] pt-4">
          <p className="text-slate-400 text-sm mb-2">
            {syncCode ? "Switch to a different sync code:" : "Or enter a code from another device:"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="XXXXXX"
              className="flex-1 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white font-mono text-center text-lg tracking-widest placeholder-slate-600 focus:outline-none focus:border-blue-500"
              maxLength={6}
            />
            <button
              onClick={() => handlePullFromServer(inputCode)}
              disabled={loading || inputCode.length !== 6}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Load
            </button>
          </div>
        </div>

        {syncCode && (
          <button
            onClick={() => {
              setSyncCode("");
              localStorage.removeItem("tv-tracker-sync-code");
              setStatus("Sync disconnected. Your local lists are unchanged.");
            }}
            className="mt-4 text-slate-500 hover:text-slate-300 text-xs underline"
          >
            Disconnect sync
          </button>
        )}
      </div>
    </div>
  );
}
