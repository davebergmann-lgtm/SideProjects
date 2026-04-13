import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchBooks } from '@/lib/googleBooks';

export async function GET(request: Request) {
  // Gate the endpoint behind auth so we don't become a free proxy.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchBooks(q, 15);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'search_failed' },
      { status: 500 }
    );
  }
}
