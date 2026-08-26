"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Exercise } from "@/lib/supabase";
import { SWIM_EQUIPMENT, SWIM_EXERCISE_TYPES, SWIM_FOCUS, SWIM_STROKES } from "@/lib/taxonomy";

type WebResult = { title: string; url: string; description: string; source: string };

export default function SearchPage() {
  const [tab, setTab] = useState<"internal" | "external">("internal");
  const [q, setQ] = useState("");
  const [stroke, setStroke] = useState("");
  const [type, setType] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [focus, setFocus] = useState<string[]>([]);

  const [results, setResults] = useState<Exercise[]>([]);
  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (stroke) p.set("stroke", stroke);
    if (type) p.set("type", type);
    equipment.forEach((e) => p.append("equipment", e));
    focus.forEach((f) => p.append("focus", f));
    return p.toString();
  }, [q, stroke, type, equipment, focus]);

  useEffect(() => {
    if (tab !== "internal") return;
    setLoading(true);
    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results ?? []))
      .finally(() => setLoading(false));
  }, [tab, params]);

  async function runExternal() {
    if (!q.trim()) return;
    setLoading(true);
    const r = await fetch(`/api/external-search?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setWebResults(d.results ?? []);
    setLoading(false);
  }

  async function ingestFromWeb(url: string) {
    setIngesting(url);
    try {
      const kind = /youtube\.com|youtu\.be/.test(url) ? "youtube" : "url";
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, url }),
      });
      const d = await r.json();
      if (d.jobId) window.location.href = `/jobs`;
    } finally {
      setIngesting(null);
    }
  }

  function toggle(list: string[], v: string, set: (l: string[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("internal")}
          className={`px-3 py-1.5 rounded ${tab === "internal" ? "bg-pool-600 text-white" : "bg-[var(--card)] border border-[var(--border)]"}`}
        >
          My library
        </button>
        <button
          onClick={() => setTab("external")}
          className={`px-3 py-1.5 rounded ${tab === "external" ? "bg-pool-600 text-white" : "bg-[var(--card)] border border-[var(--border)]"}`}
        >
          Search the web
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tab === "external" && runExternal()}
          placeholder={
            tab === "internal"
              ? "Search your drills, sets, and workouts…"
              : "Search the web (e.g. 'catch-up drill freestyle')"
          }
          className="flex-1 px-3 py-2 rounded border border-[var(--border)] bg-[var(--card)]"
        />
        {tab === "external" && (
          <button
            onClick={runExternal}
            className="px-4 py-2 rounded bg-pool-600 text-white"
          >
            Search
          </button>
        )}
      </div>

      {tab === "internal" && (
        <div className="grid md:grid-cols-4 gap-6">
          <aside className="space-y-4 text-sm">
            <FilterSelect label="Stroke" value={stroke} onChange={setStroke} options={SWIM_STROKES} />
            <FilterSelect label="Type" value={type} onChange={setType} options={SWIM_EXERCISE_TYPES} />
            <FilterMulti label="Equipment" values={equipment} options={SWIM_EQUIPMENT} onToggle={(v) => toggle(equipment, v, setEquipment)} />
            <FilterMulti label="Focus" values={focus} options={SWIM_FOCUS} onToggle={(v) => toggle(focus, v, setFocus)} />
          </aside>
          <section className="md:col-span-3 space-y-3">
            {loading && <p className="text-[var(--muted)]">Loading…</p>}
            {!loading && results.length === 0 && (
              <p className="text-[var(--muted)]">
                No results yet. <Link className="text-pool-600 underline" href="/add">Add your first exercise</Link> or run the seed script.
              </p>
            )}
            {results.map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} />
            ))}
          </section>
        </div>
      )}

      {tab === "external" && (
        <div className="space-y-3">
          {loading && <p className="text-[var(--muted)]">Searching the web…</p>}
          {!loading && webResults.length === 0 && (
            <p className="text-[var(--muted)]">Search the web for swimming drills, sets, or workouts, then click <em>Ingest</em> on any result.</p>
          )}
          {webResults.map((r) => (
            <div key={r.url} className="p-3 rounded border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-pool-600 hover:underline block truncate">
                    {r.title}
                  </a>
                  <div className="text-xs text-[var(--muted)] mb-1">{r.source}</div>
                  <p className="text-sm">{r.description}</p>
                </div>
                <button
                  onClick={() => ingestFromWeb(r.url)}
                  disabled={ingesting === r.url}
                  className="shrink-0 px-3 py-1.5 rounded bg-pool-600 text-white disabled:opacity-50"
                >
                  {ingesting === r.url ? "Queuing…" : "Ingest"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ ex }: { ex: Exercise }) {
  const attrs = ex.sport_attrs as { stroke?: string; exercise_type?: string; focus?: string[] };
  return (
    <Link
      href={`/exercise/${ex.id}`}
      className="block p-3 rounded border border-[var(--border)] bg-[var(--card)] hover:border-pool-400"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-medium">{ex.name}</h3>
        {attrs.stroke && <Chip>{attrs.stroke}</Chip>}
        {attrs.exercise_type && <Chip>{attrs.exercise_type}</Chip>}
        {ex.difficulty && <Chip>{ex.difficulty}</Chip>}
      </div>
      {ex.instructions[0] && (
        <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">{ex.instructions[0]}</p>
      )}
      <div className="flex gap-1 mt-2 flex-wrap">
        {(attrs.focus ?? []).slice(0, 4).map((f) => (
          <Chip key={f} muted>{f.replace(/_/g, " ")}</Chip>
        ))}
      </div>
    </Link>
  );
}

function Chip({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${muted ? "bg-[var(--border)] text-[var(--muted)]" : "bg-pool-100 text-pool-700"}`}
    >
      {children}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--card)]"
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function FilterMulti({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  options: readonly string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <label className="block font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={`text-xs px-2 py-0.5 rounded-full border ${on ? "bg-pool-600 text-white border-pool-600" : "border-[var(--border)] text-[var(--muted)]"}`}
            >
              {o.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
