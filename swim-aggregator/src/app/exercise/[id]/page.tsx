import Link from "next/link";
import { notFound } from "next/navigation";
import { admin, type Exercise } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await admin.from("exercises").select("*").eq("id", id).single();
  if (!data) notFound();
  const ex = data as Exercise;
  const attrs = ex.sport_attrs as {
    stroke?: string;
    exercise_type?: string;
    distance_meters?: number;
    pool_type?: string;
    focus?: string[];
  };

  return (
    <article className="max-w-3xl space-y-6">
      <header>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">← Back</Link>
        <h1 className="text-3xl font-semibold mt-2">{ex.name}</h1>
        <div className="flex gap-2 mt-2 flex-wrap">
          {attrs.stroke && <Tag>stroke: {attrs.stroke}</Tag>}
          {attrs.exercise_type && <Tag>{attrs.exercise_type}</Tag>}
          {ex.difficulty && <Tag>{ex.difficulty}</Tag>}
          {attrs.pool_type && <Tag>{attrs.pool_type}</Tag>}
          {attrs.distance_meters && <Tag>{attrs.distance_meters}m</Tag>}
        </div>
        {ex.aliases.length > 0 && (
          <p className="text-sm text-[var(--muted)] mt-2">Also known as: {ex.aliases.join(", ")}</p>
        )}
      </header>

      {ex.default_prescription && (
        <Section title="Prescription">
          <pre className="text-sm bg-[var(--card)] border border-[var(--border)] rounded p-3">
            {JSON.stringify(ex.default_prescription, null, 2)}
          </pre>
        </Section>
      )}

      {ex.instructions.length > 0 && (
        <Section title="Instructions">
          <ol className="list-decimal ml-5 space-y-1">
            {ex.instructions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>
      )}

      {(attrs.focus ?? []).length > 0 && (
        <Section title="Focus">
          <div className="flex flex-wrap gap-1">
            {attrs.focus!.map((f) => (
              <Tag key={f}>{f.replace(/_/g, " ")}</Tag>
            ))}
          </div>
        </Section>
      )}

      {ex.equipment.length > 0 && (
        <Section title="Equipment">
          <div className="flex flex-wrap gap-1">
            {ex.equipment.map((e) => (
              <Tag key={e}>{e}</Tag>
            ))}
          </div>
        </Section>
      )}

      {ex.focus_notes.length > 0 && (
        <Section title="Coaching notes">
          <ul className="list-disc ml-5 space-y-1">
            {ex.focus_notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Section>
      )}

      {ex.safety_notes.length > 0 && (
        <Section title="Safety">
          <ul className="list-disc ml-5 space-y-1 text-amber-700">
            {ex.safety_notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Source">
        <div className="text-sm space-y-1">
          <div>Kind: <span className="font-mono">{ex.source_kind}</span></div>
          {ex.source_url && (
            <div>
              URL: <a className="text-pool-600 underline" href={ex.source_url} target="_blank" rel="noreferrer">{ex.source_url}</a>
            </div>
          )}
          {ex.source_excerpt && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[var(--muted)]">Raw excerpt</summary>
              <pre className="whitespace-pre-wrap text-xs bg-[var(--card)] border border-[var(--border)] rounded p-3 mt-1">{ex.source_excerpt}</pre>
            </details>
          )}
          <div className="text-xs text-[var(--muted)]">
            Confidence: {ex.confidence?.toFixed(2) ?? "—"}
          </div>
        </div>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      {children}
    </section>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-pool-100 text-pool-700">
      {children}
    </span>
  );
}
