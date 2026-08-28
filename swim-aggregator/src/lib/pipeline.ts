import { admin, type IngestJob } from "./supabase";
import { extractText } from "./extractors/text";
import { extractUrl } from "./extractors/url";
import { extractYoutube, isYoutubeUrl } from "./extractors/youtube";
import { normalize, type NormalizedExercise } from "./normalize";
import { findDuplicate } from "./dedup";

export async function createJob(input: {
  source_kind: IngestJob["source_kind"];
  source_url?: string | null;
  raw_input?: string | null;
}): Promise<string> {
  const { data, error } = await admin
    .from("ingest_jobs")
    .insert({
      source_kind: input.source_kind,
      source_url: input.source_url ?? null,
      raw_input: input.raw_input ?? null,
      status: "queued",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function setStatus(id: string, patch: Partial<IngestJob>) {
  await admin.from("ingest_jobs").update(patch).eq("id", id);
}

export async function runJob(jobId: string): Promise<void> {
  const { data: job, error: e1 } = await admin
    .from("ingest_jobs")
    .select("*")
    .eq("id", jobId)
    .single();
  if (e1 || !job) throw e1 ?? new Error("job not found");
  if (job.status === "ready") return;

  try {
    await setStatus(jobId, { status: "extracting" });
    const { title, content } = await extract(job as IngestJob);

    await setStatus(jobId, { status: "normalizing", raw_content: content });
    const exercises = await normalize(title, content);

    const ids: string[] = [];
    for (const ex of exercises) {
      const id = await upsertExercise(ex, job as IngestJob, title, content);
      ids.push(id);
    }

    await setStatus(jobId, { status: "ready", exercise_ids: ids, error: null });
  } catch (err) {
    await setStatus(jobId, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

async function extract(job: IngestJob): Promise<{ title: string; content: string }> {
  switch (job.source_kind) {
    case "text":
      return { title: "Pasted text", content: await extractText(job.raw_input ?? "") };
    case "url":
    case "web_search": {
      const url = job.source_url ?? job.raw_input;
      if (!url) throw new Error("no URL provided");
      if (isYoutubeUrl(url)) return extractYoutube(url);
      return extractUrl(url);
    }
    case "youtube":
      if (!job.source_url) throw new Error("no youtube URL");
      return extractYoutube(job.source_url);
    case "image":
      throw new Error("image ingestion is handled inline via the API route");
  }
}

async function upsertExercise(
  ex: NormalizedExercise,
  job: IngestJob,
  sourceLabel: string,
  rawContent: string,
): Promise<string> {
  const dupe = await findDuplicate(ex.name);
  if (dupe) return dupe.id;

  const excerpt = rawContent.slice(0, 400);
  const { data, error } = await admin
    .from("exercises")
    .insert({
      name: ex.name,
      aliases: ex.aliases,
      sport: ex.sport,
      sport_attrs: ex.sport_attrs,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      instructions: ex.instructions,
      focus_notes: ex.focus_notes,
      safety_notes: ex.safety_notes,
      default_prescription: ex.default_prescription,
      total_distance_meters: ex.total_distance_meters,
      total_duration_minutes: ex.total_duration_minutes,
      source_kind: job.source_kind,
      source_url: job.source_url,
      source_excerpt: excerpt,
      ingest_job_id: job.id,
      confidence: ex.confidence,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
