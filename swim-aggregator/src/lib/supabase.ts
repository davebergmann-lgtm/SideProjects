import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error("SUPABASE_URL not set");

export const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

export function browserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export type IngestJob = {
  id: string;
  status: "queued" | "extracting" | "normalizing" | "ready" | "failed";
  source_kind: "text" | "url" | "youtube" | "image" | "web_search";
  source_url: string | null;
  raw_input: string | null;
  raw_content: string | null;
  error: string | null;
  exercise_ids: string[];
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
  name: string;
  aliases: string[];
  sport: "swimming" | "strength";
  sport_attrs: Record<string, unknown>;
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  instructions: string[];
  focus_notes: string[];
  safety_notes: string[];
  default_prescription: Record<string, unknown> | null;
  source_kind: "text" | "url" | "youtube" | "image" | "web_search";
  source_url: string | null;
  source_excerpt: string | null;
  ingest_job_id: string | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
};
