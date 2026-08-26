"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { IngestJob } from "@/lib/supabase";

export default function JobsPage() {
  const [jobs, setJobs] = useState<IngestJob[]>([]);

  useEffect(() => {
    const tick = async () => {
      const r = await fetch("/api/jobs");
      if (r.ok) setJobs(await r.json());
    };
    tick();
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Ingest jobs</h1>
      <div className="space-y-2">
        {jobs.map((j) => (
          <div key={j.id} className="p-3 rounded border border-[var(--border)] bg-[var(--card)] flex items-center gap-3">
            <StatusPill status={j.status} />
            <div className="flex-1 min-w-0">
              <div className="text-sm capitalize">{j.source_kind}</div>
              <div className="text-xs text-[var(--muted)] truncate">
                {j.source_url ?? j.raw_input?.slice(0, 100) ?? ""}
              </div>
              {j.error && <div className="text-xs text-red-500 mt-1">{j.error}</div>}
            </div>
            <div className="flex gap-2">
              {j.exercise_ids.map((id) => (
                <Link key={id} href={`/exercise/${id}`} className="text-xs text-pool-600 underline">exercise</Link>
              ))}
            </div>
          </div>
        ))}
        {jobs.length === 0 && <p className="text-[var(--muted)]">No jobs yet.</p>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: IngestJob["status"] }) {
  const color = {
    queued: "bg-slate-200 text-slate-700",
    extracting: "bg-amber-200 text-amber-800",
    normalizing: "bg-amber-200 text-amber-800",
    ready: "bg-emerald-200 text-emerald-800",
    failed: "bg-red-200 text-red-800",
  }[status];
  return <span className={`text-xs px-2 py-1 rounded ${color}`}>{status}</span>;
}
