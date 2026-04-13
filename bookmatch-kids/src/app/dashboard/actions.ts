'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MAX_CHILDREN, type ReadingLevel } from '@/lib/constants';
import { generateRecommendations } from '@/lib/anthropic';
import type { Book, BookEntry, Child } from '@/lib/types';

export async function createChild(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = String(formData.get('name') ?? '').trim();
  const ageRaw = String(formData.get('age') ?? '').trim();
  const grade = String(formData.get('grade_level') ?? '').trim() || null;
  const readingLevel = String(formData.get('reading_level') ?? '').trim() as ReadingLevel;
  const interests = formData.getAll('interests').map((v) => String(v));

  if (!name) {
    redirect('/dashboard/children/new?error=Name+is+required');
  }

  const age = ageRaw ? Number.parseInt(ageRaw, 10) : null;

  // Pre-check the cap so we can show a friendly message instead of a DB error.
  const { count } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) >= MAX_CHILDREN) {
    redirect('/dashboard?error=You+can+add+up+to+3+kids.');
  }

  const { data, error } = await supabase
    .from('children')
    .insert({
      user_id: user.id,
      name,
      age,
      grade_level: grade,
      reading_level: readingLevel || null,
      interests,
    })
    .select('id')
    .single();

  if (error) {
    redirect(`/dashboard/children/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/dashboard');
  redirect(`/dashboard/children/${data!.id}`);
}

export async function deleteChild(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { error } = await supabase.from('children').delete().eq('id', id);
  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function rateBook(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const childId = String(formData.get('child_id') ?? '');
  const rating = String(formData.get('rating') ?? '');
  const googleBooksId = String(formData.get('google_books_id') ?? '');
  const title = String(formData.get('title') ?? '');
  const author = String(formData.get('author') ?? '') || null;
  const isbn = String(formData.get('isbn') ?? '') || null;
  const coverUrl = String(formData.get('cover_image_url') ?? '') || null;

  if (!childId || !rating || !title) return;

  // Upsert the book in the master catalog. Prefer matching by google_books_id
  // (most precise); fall back to ISBN; finally insert a fresh row. This lets
  // recommendations without a google id — or without any external id — still
  // be rated in one tap.
  let bookId: string | null = null;

  if (googleBooksId) {
    const { data } = await supabase
      .from('books')
      .select('id')
      .eq('google_books_id', googleBooksId)
      .maybeSingle();
    if (data?.id) bookId = data.id;
  }

  if (!bookId && isbn) {
    const { data } = await supabase
      .from('books')
      .select('id')
      .eq('isbn', isbn)
      .maybeSingle();
    if (data?.id) bookId = data.id;
  }

  if (!bookId) {
    const { data: inserted, error: bookError } = await supabase
      .from('books')
      .insert({
        title,
        author,
        isbn,
        cover_image_url: coverUrl,
        google_books_id: googleBooksId || null,
      })
      .select('id')
      .single();
    if (bookError) {
      redirect(
        `/dashboard/children/${childId}?error=${encodeURIComponent(bookError.message)}`
      );
    }
    bookId = inserted!.id;
  }

  // Upsert the rating (unique on child_id+book_id).
  const { error } = await supabase.from('book_entries').upsert(
    {
      child_id: childId,
      book_id: bookId!,
      rating,
      added_by: user.id,
    },
    { onConflict: 'child_id,book_id' }
  );

  if (error) {
    redirect(`/dashboard/children/${childId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/dashboard/children/${childId}`);
}

export async function generateReadingList(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const childId = String(formData.get('child_id') ?? '');
  if (!childId) return;

  // Verify the child belongs to this user (RLS would also enforce this).
  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .eq('user_id', user.id)
    .maybeSingle<Child>();

  if (!child) {
    redirect('/dashboard?error=Child+not+found');
  }

  // Pull everything the kid has rated, separated into signal buckets.
  const { data: entries } = await supabase
    .from('book_entries')
    .select('*, book:books(*)')
    .eq('child_id', childId);

  const rated = (entries ?? []) as (BookEntry & { book: Book })[];
  const lovedBooks = rated.filter((e) => e.rating === 'loved' || e.rating === 'liked');
  const dislikedBooks = rated.filter((e) => e.rating === 'disliked' || e.rating === 'dnf');

  try {
    const recommendations = await generateRecommendations({
      child: child!,
      lovedBooks,
      dislikedBooks,
      sourcePreference: 'free_first',
    });

    const { error } = await supabase.from('reading_lists').insert({
      child_id: childId,
      source_preference: 'free_first',
      books: recommendations,
    });

    if (error) {
      redirect(
        `/dashboard/children/${childId}?error=${encodeURIComponent(error.message)}`
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate recommendations';
    redirect(`/dashboard/children/${childId}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath(`/dashboard/children/${childId}`);
}

export async function removeBookEntry(formData: FormData) {
  const supabase = createClient();
  const entryId = String(formData.get('entry_id') ?? '');
  const childId = String(formData.get('child_id') ?? '');
  if (!entryId) return;

  await supabase.from('book_entries').delete().eq('id', entryId);
  revalidatePath(`/dashboard/children/${childId}`);
}
