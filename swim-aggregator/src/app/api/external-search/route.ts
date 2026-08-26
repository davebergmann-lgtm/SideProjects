import { NextResponse } from "next/server";
import { braveSearch } from "@/lib/search/brave";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  try {
    const results = await braveSearch(q, 12);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
