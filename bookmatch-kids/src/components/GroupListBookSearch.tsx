'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { addBookToGroupList } from '@/app/dashboard/groups/actions';
import type { GoogleBookResult } from '@/lib/types';

type Props = { listId: string; groupId: string };

export function GroupListBookSearch({ listId, groupId }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, startSaving] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function onAdd(r: GoogleBookResult) {
    const fd = new FormData();
    fd.set('list_id', listId);
    fd.set('group_id', groupId);
    fd.set('title', r.title);
    fd.set('author', r.authors.join(', '));
    if (r.isbn) fd.set('isbn', r.isbn);
    if (r.coverImageUrl) fd.set('cover_image_url', r.coverImageUrl);
    fd.set('google_books_id', r.googleBooksId);

    startSaving(async () => {
      await addBookToGroupList(fd);
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
        placeholder="Search for a book to add…"
        className="input"
        autoComplete="off"
      />
      {loading && <p className="mt-2 text-xs text-slate-500">Searching…</p>}
      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((r) => (
            <li key={r.googleBooksId}>
              <button
                type="button"
                disabled={saving}
                onClick={() => onAdd(r)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-brand-300 disabled:opacity-50"
              >
                {r.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.coverImageUrl}
                    alt=""
                    className="h-14 w-10 flex-shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-14 w-10 flex-shrink-0 rounded bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {r.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {r.authors.join(', ') || 'Unknown author'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-600">Add</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
