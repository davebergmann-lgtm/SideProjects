import type { GoogleBookResult } from './types';

const BASE = 'https://www.googleapis.com/books/v1/volumes';

type RawVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

export async function searchBooks(query: string, limit = 15): Promise<GoogleBookResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    maxResults: String(limit),
    printType: 'books',
  });
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    params.set('key', process.env.GOOGLE_BOOKS_API_KEY);
  }

  const res = await fetch(`${BASE}?${params.toString()}`, {
    // Google Books results are stable enough to cache briefly.
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) {
    throw new Error(`Google Books error: ${res.status}`);
  }
  const data = (await res.json()) as { items?: RawVolume[] };

  return (data.items ?? []).map(toResult);
}

function toResult(v: RawVolume): GoogleBookResult {
  const info = v.volumeInfo ?? {};
  const isbn =
    info.industryIdentifiers?.find((i) => i.type === 'ISBN_13')?.identifier ??
    info.industryIdentifiers?.find((i) => i.type === 'ISBN_10')?.identifier ??
    null;

  // Upgrade http → https for Next Image.
  const rawCover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
  const cover = rawCover ? rawCover.replace(/^http:/, 'https:') : null;

  return {
    googleBooksId: v.id,
    title: info.title ?? 'Untitled',
    authors: info.authors ?? [],
    isbn,
    coverImageUrl: cover,
    description: info.description ?? null,
  };
}
