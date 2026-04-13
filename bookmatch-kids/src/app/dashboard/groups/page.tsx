import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  canCreateAnyGroup,
  groupTierLabel,
  maxCreatableGroupTier,
} from '@/lib/groupTiers';
import { joinGroup } from './actions';
import type { Group, GroupMember } from '@/lib/types';

export default async function GroupsIndexPage({
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
  const canCreate = canCreateAnyGroup(subscriptionTier);
  const maxTier = maxCreatableGroupTier(subscriptionTier);

  // Pull the user's memberships and then the groups for each.
  const { data: memberships } = await supabase
    .from('group_members')
    .select('*, group:groups(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true });

  const rows = (memberships ?? []) as (GroupMember & { group: Group })[];

  return (
    <main className="mt-6">
      <Link href="/dashboard" className="btn-ghost -ml-3 px-3">
        ← Dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">Groups</h1>
      <p className="mt-1 text-sm text-slate-600">
        Share reading lists with your homeschool co-op or friends.
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <p className="card text-sm text-slate-500">
            You haven&apos;t joined any groups yet.
          </p>
        ) : (
          rows.map(({ group, role }) => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.id}`}
              className="card flex items-center gap-4 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl">
                👥
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{group.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {groupTierLabel(group.tier)} • up to {group.max_families} families •{' '}
                  <span className="uppercase">{role}</span>
                </p>
              </div>
              <span className="text-slate-400">›</span>
            </Link>
          ))
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Join a group
        </h2>
        <form action={joinGroup} className="card space-y-3">
          <input
            type="text"
            name="invite_code"
            required
            placeholder="Invite code"
            className="input uppercase tracking-widest"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button type="submit" className="btn-secondary w-full">
            Join with code
          </button>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Start a new group
        </h2>
        {canCreate ? (
          <Link href="/dashboard/groups/new" className="btn-primary w-full">
            Create a group
          </Link>
        ) : (
          <div className="card">
            <p className="text-sm text-slate-700">
              Group creation is included with{' '}
              <span className="font-semibold">Family Plus</span> and all Group plans.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Your current plan:{' '}
              <span className="font-semibold">{subscriptionTier}</span>
            </p>
          </div>
        )}
        {canCreate && maxTier && (
          <p className="mt-2 text-xs text-slate-500">
            Your plan can create groups up to{' '}
            <span className="font-semibold">{groupTierLabel(maxTier)}</span>.
          </p>
        )}
      </section>
    </main>
  );
}
