import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await admin
    .from("ingest_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
