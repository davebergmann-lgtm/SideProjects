import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MAX_CHILDREN, READING_LEVELS } from '@/lib/constants';
import type { Child } from '@/lib/types';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const kids = (children ?? []) as Child[];
  const canAddMore = kids.length < MAX_CHILDREN;
  const firstName =
    profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there';

  return (
    <main className="mt-6">
      <h1 className="text-2xl font-bold text-slate-900">Hi, {firstName} 👋</h1>
      <p className="mt-1 text-sm text-slate-600">
        {kids.length === 0
          ? 'Let\u2019s set up your first kid\u2019s profile.'
          : 'Pick a kid to rate books and build their taste.'}
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="mt-6 space-y-3">
        {kids.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/children/${c.id}`}
            className="card flex items-center gap-4 hover:border-brand-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-slate-900">{c.name}</p>
              <p className="truncate text-xs text-slate-500">
                {[
                  c.age ? `age ${c.age}` : null,
                  READING_LEVELS.find((r) => r.value === c.reading_level)?.label ?? null,
                  c.interests?.length ? `${c.interests.length} interests` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
            <span className="text-slate-400">›</span>
          </Link>
        ))}

        {canAddMore ? (
          <Link
            href="/dashboard/children/new"
            className="card flex items-center justify-center gap-2 border-dashed text-brand-700"
          >
            <span className="text-xl leading-none">+</span>
            Add {kids.length === 0 ? 'a kid' : 'another kid'}
          </Link>
        ) : (
          <p className="text-center text-xs text-slate-500">
            You&apos;ve reached the limit of {MAX_CHILDREN} kid profiles.
          </p>
        )}
      </section>

      <section className="mt-8">
        <Link
          href="/dashboard/groups"
          className="card flex items-center gap-4 hover:border-brand-200"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl">
            👥
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Groups</p>
            <p className="text-xs text-slate-500">
              Share lists with your co-op or friends
            </p>
          </div>
          <span className="text-slate-400">›</span>
        </Link>
      </section>
    </main>
  );
}
