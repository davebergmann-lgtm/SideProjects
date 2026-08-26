import { NextResponse } from "next/server";
import { createJob, runJob } from "@/lib/pipeline";
import { admin } from "@/lib/supabase";
import { extractImage } from "@/lib/extractors/image";
import { normalize } from "@/lib/normalize";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body =
  | { kind: "text"; text: string }
  | { kind: "url"; url: string }
  | { kind: "youtube"; url: string }
  | { kind: "web_search"; url: string }
  | { kind: "image"; base64: string; mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif" };

export async function POST(req: Request) {
  const body = (await req.json()) as Body;

  if (body.kind === "image") {
    const jobId = await createJob({ source_kind: "image" });
    await admin.from("ingest_jobs").update({ status: "extracting" }).eq("id", jobId);
    try {
      const { title, content } = await extractImage(body.base64, body.mediaType);
      await admin
        .from("ingest_jobs")
        .update({ status: "normalizing", raw_content: content })
        .eq("id", jobId);
      const exercises = await normalize(title, content);
      const ids: string[] = [];
      for (const ex of exercises) {
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
            source_kind: "image",
            source_excerpt: content.slice(0, 400),
            ingest_job_id: jobId,
            confidence: ex.confidence,
          })
          .select("id")
          .single();
        if (error) throw error;
        ids.push(data.id);
      }
      await admin
        .from("ingest_jobs")
        .update({ status: "ready", exercise_ids: ids })
        .eq("id", jobId);
      return NextResponse.json({ jobId });
    } catch (err) {
      await admin
        .from("ingest_jobs")
        .update({ status: "failed", error: (err as Error).message })
        .eq("id", jobId);
      return NextResponse.json({ jobId, error: (err as Error).message }, { status: 500 });
    }
  }

  const kindMap: Record<string, "text" | "url" | "youtube" | "web_search"> = {
    text: "text",
    url: "url",
    youtube: "youtube",
    web_search: "web_search",
  };
  const kind = kindMap[body.kind];
  if (!kind) return NextResponse.json({ error: "unknown kind" }, { status: 400 });

  const jobId = await createJob({
    source_kind: kind,
    source_url: body.kind === "text" ? null : body.url,
    raw_input: body.kind === "text" ? body.text : body.url,
  });

  runJob(jobId).catch((err) => console.error("job failed", jobId, err));

  return NextResponse.json({ jobId });
}
