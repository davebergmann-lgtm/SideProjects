'use client';

import { useState, useTransition } from 'react';
import { rateBook } from '@/app/dashboard/actions';
import { RATINGS } from '@/lib/constants';
import { buildSourceLinks } from '@/lib/sourceLinks';
import type { RecommendedBook } from '@/lib/types';

type Props = {
  childId: string;
  book: RecommendedBook;
};

export function RecommendationCard({ childId, book }: Props) {
  const [ratingsOpen, setRatingsOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const links = buildSourceLinks(book);

  function onRate(rating: (typeof RATINGS)[number]['value']) {
    const fd = new FormData();
    fd.set('child_id', childId);
    fd.set('rating', rating);
    if (book.google_books_id) fd.set('google_books_id', book.google_books_id);
    fd.set('title', book.title);
    fd.set('author', book.author);
    if (book.isbn) fd.set('isbn', book.isbn);
    if (book.cover_image_url) fd.set('cover_image_url', book.cover_image_url);

    startSaving(async () => {
      await rateBook(fd);
      setSaved(rating);
      setRatingsOpen(false);
    });
  }

  return (
    <article className="card">
      <div className="flex items-start gap-3">
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_image_url}
            alt=""
            className="h-24 w-16 flex-shrink-0 rounded object-cover"
          />
        ) : (
          <div className="flex h-24 w-16 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xl">
            📖
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900">{book.title}</h3>
          <p className="text-xs text-slate-500">{book.author}</p>
          {book.series_starter && (
            <span className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
              Start of a series
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-snug text-slate-700">{book.match_reason}</p>
      {book.why_they_will_love_it && (
        <p className="mt-1.5 text-sm italic text-slate-500">
          &ldquo;{book.why_they_will_love_it}&rdquo;
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={links.libby}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50"
        >
          🏛️ Libby
        </a>
        <a
          href={links.amazon}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50"
        >
          🛒 Amazon
        </a>
      </div>

      <div className="mt-3">
        {saved ? (
          <p className="rounded-xl bg-brand-50 px-3 py-2 text-center text-xs font-medium text-brand-700">
            Saved as {RATINGS.find((r) => r.value === saved)?.label} ✓
          </p>
        ) : !ratingsOpen ? (
          <button
            type="button"
            onClick={() => setRatingsOpen(true)}
            className="btn-ghost w-full border border-dashed border-slate-200 text-xs"
          >
            They read it — rate it
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                disabled={saving}
                onClick={() => onRate(r.value)}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50"
              >
                <span>{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
