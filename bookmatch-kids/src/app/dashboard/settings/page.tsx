import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/login/actions';
import { planForTier, isSubscriptionTier } from '@/lib/pricing';
import { deleteAccount } from './actions';

export default async function SettingsPage({
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
    .select('full_name, email, subscription_tier')
    .eq('id', user.id)
    .maybeSingle();

  const { count: kidCount } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const tier = isSubscriptionTier(profile?.subscription_tier ?? 'free')
    ? profile?.subscription_tier ?? 'free'
    : 'free';
  const plan = planForTier(tier as 'free');

  return (
    <main className="mt-6 space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      {searchParams.error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}

      <section className="card space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Account</p>
        <p className="text-sm">
          <span className="text-slate-500">Name:</span>{' '}
          <span className="font-semibold text-slate-900">
            {profile?.full_name ?? '—'}
          </span>
        </p>
        <p className="text-sm">
          <span className="text-slate-500">Email:</span>{' '}
          <span className="text-slate-900">{profile?.email ?? user.email}</span>
        </p>
        <p className="text-sm">
          <span className="text-slate-500">Plan:</span>{' '}
          <span className="text-slate-900">{plan?.name ?? 'Free'}</span>
        </p>
        <p className="text-sm">
          <span className="text-slate-500">Kid profiles:</span>{' '}
          <span className="text-slate-900">{kidCount ?? 0}</span>
        </p>
        <Link
          href="/dashboard/billing"
          className="btn-secondary mt-3 inline-block w-full text-center"
        >
          Manage billing
        </Link>
      </section>

      <section className="card">
        <p className="text-xs uppercase tracking-wide text-slate-500">Session</p>
        <form action={signOut} className="mt-3">
          <button type="submit" className="btn-secondary w-full">
            Sign out
          </button>
        </form>
      </section>

      <section className="card border-red-200 bg-red-50">
        <p className="text-xs uppercase tracking-wide text-red-700">
          Danger zone
        </p>
        <p className="mt-2 text-sm font-semibold text-red-900">
          Delete your account
        </p>
        <p className="mt-1 text-xs text-red-800/80">
          Permanently removes your profile, every kid you&apos;ve added, all
          ratings and reading lists, and your group memberships. We&apos;ll
          also cancel any active subscription. This cannot be undone.
        </p>

        <form action={deleteAccount} className="mt-4 space-y-3">
          <div>
            <label className="label text-red-900" htmlFor="confirm">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <input
              id="confirm"
              name="confirm"
              type="text"
              required
              autoComplete="off"
              className="input border-red-300 focus:border-red-500 focus:ring-red-100"
              placeholder="DELETE"
            />
          </div>
          <button
            type="submit"
            className="btn w-full bg-red-600 text-white hover:bg-red-700"
          >
            Delete my account
          </button>
        </form>
      </section>
    </main>
  );
}
