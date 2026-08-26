"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "text" | "url" | "youtube" | "image";

export default function AddPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setErr(null);
    try {
      let body: Record<string, unknown>;
      if (tab === "text") body = { kind: "text", text };
      else if (tab === "url") body = { kind: "url", url };
      else if (tab === "youtube") body = { kind: "youtube", url };
      else {
        if (!file) throw new Error("choose an image file");
        const base64 = await readAsBase64(file);
        body = { kind: "image", base64, mediaType: file.type };
      }
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "ingest failed");
      router.push("/jobs");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Add exercise</h1>

      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {(["text", "url", "youtube", "image"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-pool-600 text-pool-600" : "text-[var(--muted)]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste a coach's notes, a set, or a workout…"
          className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--card)] font-mono text-sm"
        />
      )}

      {(tab === "url" || tab === "youtube") && (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={tab === "youtube" ? "https://youtube.com/watch?v=…" : "https://…"}
          className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--card)]"
        />
      )}

      {tab === "image" && (
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <div className="text-xs text-[var(--muted)] mt-1">{file.name} · {(file.size / 1024).toFixed(0)} KB</div>
          )}
        </div>
      )}

      {err && <p className="text-red-500 text-sm mt-2">{err}</p>}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-4 px-4 py-2 rounded bg-pool-600 text-white disabled:opacity-50"
      >
        {submitting ? "Queuing…" : "Ingest"}
      </button>
    </div>
  );
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      resolve(s.split(",")[1] ?? "");
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
