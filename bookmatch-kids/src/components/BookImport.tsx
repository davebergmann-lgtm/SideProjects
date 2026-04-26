'use client';

import { useRef, useState, useTransition } from 'react';
import { rateBook } from '@/app/dashboard/actions';
import { RATINGS } from '@/lib/constants';
import type { ParsedBook } from '@/lib/parseBookList';

type Props = { childId: string };

type ImportBook = ParsedBook & { status: 'pending' | 'saving' | 'saved' };

export function BookImport({ childId }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'choose' | 'paste' | 'parsing' | 'review'>('choose');
  const [pasteText, setPasteText] = useState('');
  const [books, setBooks] = useState<ImportBook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, startImporting] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setMode('choose');
    setPasteText('');
    setBooks([]);
    setError(null);
  }

  async function handleFile(file: File) {
    setError(null);
    setMode('parsing');
    const fd = new FormData();
    fd.set('file', file);
    try {
      const res = await fetch('/api/books/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      if (!data.books?.length) {
        setError('No books found in that file. Try a different format.');
        setMode('choose');
        return;
      }
      setBooks(data.books.map((b: ParsedBook) => ({ ...b, status: 'pending' as const })));
      setMode('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setMode('choose');
    }
  }

  async function handlePaste() {
    if (!pasteText.trim()) return;
    setError(null);
    setMode('parsing');
    try {
      const res = await fetch('/api/books/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Parse failed');
      if (!data.books?.length) {
        setError('No books found. Try listing one book per line.');
        setMode('paste');
        return;
      }
      setBooks(data.books.map((b: ParsedBook) => ({ ...b, status: 'pending' as const })));
      setMode('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
      setMode('paste');
    }
  }

  function setBookRating(idx: number, rating: ParsedBook['rating']) {
    setBooks((prev) => prev.map((b, i) => (i === idx ? { ...b, rating } : b)));
  }

  function removeBook(idx: number) {
    setBooks((prev) => prev.filter((_, i) => i !== idx));
  }

  function confirmImport() {
    startImporting(async () => {
      for (let i = 0; i < books.length; i++) {
        const b = books[i];
        if (b.status === 'saved') continue;

        setBooks((prev) =>
          prev.map((bk, j) => (j === i ? { ...bk, status: 'saving' as const } : bk))
        );

        const fd = new FormData();
        fd.set('child_id', childId);
        fd.set('title', b.title);
        if (b.author) fd.set('author', b.author);
        if (b.rating) {
          fd.set('rating', b.rating);
        } else {
          fd.set('rating', 'liked');
        }
        fd.set('google_books_id', '');
        fd.set('isbn', '');
        fd.set('cover_image_url', '');

        try {
          await rateBook(fd);
          setBooks((prev) =>
            prev.map((bk, j) => (j === i ? { ...bk, status: 'saved' as const } : bk))
          );
        } catch {
          // continue with remaining books
        }
      }
      reset();
      setOpen(false);
    });
  }

  const needsRating = books.filter((b) => !b.rating && b.status === 'pending');
  const readyCount = books.filter((b) => b.status === 'pending').length;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); reset(); }}
        className="card flex w-full items-center justify-center gap-2 border-dashed text-brand-700"
      >
        <span className="text-xl leading-none">📋</span>
        Import a book list
      </button>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Import books</h3>
        <button
          type="button"
          onClick={() => { setOpen(false); reset(); }}
          className="btn-ghost text-xs"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>
      )}

      {mode === 'choose' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Upload a spreadsheet or paste a list of books. We&apos;ll use AI to
            read it and add them automatically.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-4 text-sm font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="text-2xl">📄</span>
              Upload file
              <span className="text-[10px] text-slate-400">.csv, .xlsx</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-4 text-sm font-medium text-slate-800 hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="text-2xl">📝</span>
              Paste a list
              <span className="text-[10px] text-slate-400">any format</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {mode === 'paste' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Paste your list below — any format works (one book per line, comma
            separated, copied from a spreadsheet, etc.)
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            className="input resize-y font-mono text-xs"
            placeholder={`e.g.\nHarry Potter - J.K. Rowling - loved\nDiary of a Wimpy Kid, Jeff Kinney\nPercy Jackson`}
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            Parse list
          </button>
        </div>
      )}

      {mode === 'parsing' && (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-600">Reading your list with AI...</p>
          <p className="mt-1 text-xs text-slate-400">This takes a few seconds</p>
        </div>
      )}

      {mode === 'review' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Found <strong>{books.length} book{books.length !== 1 ? 's' : ''}</strong>.
            {needsRating.length > 0 && (
              <span className="text-amber-700">
                {' '}{needsRating.length} still need a rating.
              </span>
            )}
          </p>

          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {books.map((book, idx) => (
              <li
                key={`${book.title}-${idx}`}
                className={`flex items-start gap-2 rounded-xl border p-3 ${
                  book.status === 'saved'
                    ? 'border-green-200 bg-green-50'
                    : book.status === 'saving'
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : !book.rating
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{book.title}</p>
                  <p className="text-xs text-slate-500">
                    {book.author ?? 'Unknown author'}
                  </p>
                  {book.status === 'saved' ? (
                    <p className="mt-1 text-xs text-green-700">Saved</p>
                  ) : book.status === 'saving' ? (
                    <p className="mt-1 text-xs text-slate-500">Saving...</p>
                  ) : (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {RATINGS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          disabled={importing}
                          onClick={() => setBookRating(idx, r.value)}
                          className={`rounded-lg px-2 py-0.5 text-[11px] font-medium ${
                            book.rating === r.value
                              ? 'bg-brand-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {r.emoji} {r.label}
                        </button>
                      ))}
                      {!book.rating && (
                        <span className="rounded-lg bg-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                          Needs rating
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {book.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => removeBook(idx)}
                    disabled={importing}
                    className="btn-ghost text-xs text-slate-400"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            {needsRating.length > 0 && (
              <p className="text-center text-xs text-amber-700">
                Books without a rating will be saved as &ldquo;Liked it&rdquo;
              </p>
            )}
            <button
              type="button"
              onClick={confirmImport}
              disabled={importing || readyCount === 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              {importing
                ? `Importing... (${books.filter((b) => b.status === 'saved').length}/${books.length})`
                : `Import ${readyCount} book${readyCount !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={importing}
              className="btn-secondary w-full"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
