'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { rateBook } from '@/app/dashboard/actions';
import { RATINGS } from '@/lib/constants';
import type { GoogleBookResult } from '@/lib/types';

type Props = { childId: string };

export function BookSearch({ childId }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GoogleBookResult | null>(null);
  const [savingRating, startSaving] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Could not search right now. Try again.');
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  function onRate(rating: (typeof RATINGS)[number]['value']) {
    if (!selected) return;
    const fd = new FormData();
    fd.set('child_id', childId);
    fd.set('rating', rating);
    fd.set('google_books_id', selected.googleBooksId);
    fd.set('title', selected.title);
    fd.set('author', selected.authors.join(', '));
    if (selected.isbn) fd.set('isbn', selected.isbn);
    if (selected.coverImageUrl) fd.set('cover_image_url', selected.coverImageUrl);

    startSaving(async () => {
      await rateBook(fd);
      setSelected(null);
      setQuery('');
      setResults([]);
    });
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a book they've read…"
        className="input"
        autoComplete="off"
      />

      {loading && <p className="mt-3 text-xs text-slate-500">Searching…</p>}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {!selected && results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((r) => (
            <li key={r.googleBooksId}>
              <button
                type="button"
                onClick={() => setSelected(r)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-brand-300"
              >
                {r.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.coverImageUrl}
                    alt=""
                    className="h-16 w-12 flex-shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-16 w-12 flex-shrink-0 rounded bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{r.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {r.authors.join(', ') || 'Unknown author'}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="mt-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <div className="flex items-start gap-3">
            {selected.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.coverImageUrl}
                alt=""
                className="h-20 w-14 flex-shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-20 w-14 flex-shrink-0 rounded bg-white" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{selected.title}</p>
              <p className="text-xs text-slate-600">
                {selected.authors.join(', ') || 'Unknown author'}
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setSelected(null)}
              disabled={savingRating}
            >
              Cancel
            </button>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-700">How did they like it?</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                disabled={savingRating}
                onClick={() => onRate(r.value)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50"
              >
                <span>{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
