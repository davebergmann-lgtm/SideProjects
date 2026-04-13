import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookSearch } from '@/components/BookSearch';
import { READING_LEVELS, RATINGS } from '@/lib/constants';
import { deleteChild, removeBookEntry } from '@/app/dashboard/actions';
import type { Book, BookEntry, Child } from '@/lib/types';

export default async function ChildPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle<Child>();

  if (!child) notFound();

  const { data: entriesRaw } = await supabase
    .from('book_entries')
    .select('*, book:books(*)')
    .eq('child_id', params.id)
    .order('created_at', { ascending: false });

  const entries = (entriesRaw ?? []) as (BookEntry & { book: Book })[];

  const readingLevelLabel =
    READING_LEVELS.find((r) => r.value === child.reading_level)?.label ?? null;

  return (
    <main className="mt-6">
      <Link href="/dashboard" className="btn-ghost -ml-3 px-3">
        ← All kids
      </Link>

      <section className="mt-4 card">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
            {child.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-slate-900">{child.name}</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {[
                child.age ? `age ${child.age}` : null,
                child.grade_level ? `${child.grade_level} grade` : null,
                readingLevelLabel,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
            {child.interests?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {child.interests.map((i) => (
                  <span key={i} className="chip text-xs">
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add a book they&apos;ve read
        </h2>
        <BookSearch childId={child.id} />
      </section>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Rated books ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <p className="card text-sm text-slate-500">
            No books yet. Add the last few books {child.name} read — loved ones and duds both help.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => {
              const rating = RATINGS.find((r) => r.value === entry.rating);
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3"
                >
                  {entry.book?.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.book.cover_image_url}
                      alt=""
                      className="h-16 w-12 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-16 w-12 flex-shrink-0 rounded bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{entry.book?.title}</p>
                    <p className="truncate text-xs text-slate-500">
                      {entry.book?.author ?? 'Unknown author'}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {rating?.emoji} {rating?.label}
                    </p>
                  </div>
                  <form action={removeBookEntry}>
                    <input type="hidden" name="entry_id" value={entry.id} />
                    <input type="hidden" name="child_id" value={child.id} />
                    <button type="submit" className="btn-ghost text-xs" aria-label="Remove">
                      ✕
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 border-t border-slate-100 pt-6">
        <form action={deleteChild}>
          <input type="hidden" name="id" value={child.id} />
          <button type="submit" className="btn-ghost text-xs text-red-600">
            Delete this profile
          </button>
        </form>
      </section>
    </main>
  );
}
