import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createChild } from '@/app/dashboard/actions';
import { createClient } from '@/lib/supabase/server';
import { MAX_CHILDREN, READING_LEVELS } from '@/lib/constants';
import { InterestsPicker } from '@/components/InterestsPicker';

export default async function NewChildPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { count } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) >= MAX_CHILDREN) {
    redirect('/dashboard?error=You+can+add+up+to+3+kids.');
  }

  return (
    <main className="mt-6">
      <Link href="/dashboard" className="btn-ghost -ml-3 px-3">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add a kid</h1>
      <p className="mt-1 text-sm text-slate-600">
        A few details help us match books they&apos;ll actually love.
      </p>

      <form action={createChild} className="mt-6 space-y-5">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" type="text" required className="input" placeholder="Sam" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="age">
              Age
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min={0}
              max={18}
              className="input"
              placeholder="8"
            />
          </div>
          <div>
            <label className="label" htmlFor="grade_level">
              Grade
            </label>
            <input
              id="grade_level"
              name="grade_level"
              type="text"
              className="input"
              placeholder="3rd"
            />
          </div>
        </div>

        <fieldset>
          <legend className="label">Reading level</legend>
          <div className="space-y-2">
            {READING_LEVELS.map((level) => (
              <label
                key={level.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"
              >
                <input
                  type="radio"
                  name="reading_level"
                  value={level.value}
                  className="mt-1 h-4 w-4 accent-brand-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{level.label}</p>
                  <p className="text-xs text-slate-500">{level.hint}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="label">Interests</p>
          <InterestsPicker />
        </div>

        {searchParams.error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>
        )}

        <button type="submit" className="btn-primary w-full">
          Save profile
        </button>
      </form>
    </main>
  );
}
