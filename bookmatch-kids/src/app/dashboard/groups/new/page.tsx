import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  GROUP_TIERS,
  canCreateAnyGroup,
  canCreateGroupTier,
  maxCreatableGroupTier,
  groupTierLabel,
} from '@/lib/groupTiers';
import { createGroup } from '../actions';

export default async function NewGroupPage({
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
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle();

  const subscriptionTier = profile?.subscription_tier ?? 'free';

  if (!canCreateAnyGroup(subscriptionTier)) {
    redirect('/dashboard/groups?error=Upgrade+your+plan+to+create+a+group');
  }

  const maxTier = maxCreatableGroupTier(subscriptionTier);

  return (
    <main className="mt-6">
      <Link href="/dashboard/groups" className="btn-ghost -ml-3 px-3">
        ← Groups
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Create a group</h1>
      <p className="mt-1 text-sm text-slate-600">
        You&apos;ll be the admin. Invite families with a code.
      </p>

      <form action={createGroup} className="mt-6 space-y-5">
        <div>
          <label className="label" htmlFor="name">
            Group name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="input"
            placeholder="Riverbend Homeschool Co-op"
          />
        </div>

        <fieldset>
          <legend className="label">Tier</legend>
          <div className="space-y-2">
            {GROUP_TIERS.map((t) => {
              const allowed = canCreateGroupTier(subscriptionTier, t.value);
              return (
                <label
                  key={t.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 ${
                    !allowed ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.value}
                    required
                    disabled={!allowed}
                    className="mt-1 h-4 w-4 accent-brand-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                      <p className="text-xs text-slate-500">${t.priceAnnual}/yr</p>
                    </div>
                    <p className="text-xs text-slate-500">{t.tagline}</p>
                    {!allowed && (
                      <p className="mt-1 text-[10px] font-semibold uppercase text-amber-600">
                        Upgrade required
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {maxTier && (
          <p className="text-xs text-slate-500">
            Your plan ({subscriptionTier}) can create up to{' '}
            <span className="font-semibold">{groupTierLabel(maxTier)}</span>.
          </p>
        )}

        {searchParams.error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {searchParams.error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full">
          Create group
        </button>
      </form>
    </main>
  );
}
