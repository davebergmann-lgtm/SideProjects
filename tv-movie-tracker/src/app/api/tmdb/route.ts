import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

function getApiKey(): string | null {
  return process.env.TMDB_API_KEY || null;
}

export async function GET(req: NextRequest) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured. Add TMDB_API_KEY environment variable." },
      { status: 503 }
    );
  }

  const action = req.nextUrl.searchParams.get("action");

  if (action === "search") {
    const query = req.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
    );
    const data = await res.json();
    return NextResponse.json(data);
  }

  if (action === "movie") {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing movie ID" }, { status: 400 });
    }
    const res = await fetch(`${TMDB_BASE}/movie/${id}?api_key=${apiKey}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
