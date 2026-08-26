import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const stroke = url.searchParams.get("stroke");
  const exerciseType = url.searchParams.get("type");
  const equipment = url.searchParams.getAll("equipment");
  const focus = url.searchParams.getAll("focus");

  let query = admin.from("exercises").select("*").eq("sport", "swimming").limit(50);

  if (q) {
    query = query.textSearch("search_tsv", q, { type: "websearch" });
  }
  if (stroke) query = query.eq("sport_attrs->>stroke", stroke);
  if (exerciseType) query = query.eq("sport_attrs->>exercise_type", exerciseType);
  if (equipment.length > 0) query = query.overlaps("equipment", equipment);
  if (focus.length > 0) query = query.contains("sport_attrs->focus", focus);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data });
}
