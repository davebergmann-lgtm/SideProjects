import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CopyInviteCode } from '@/components/CopyInviteCode';
import { groupTierLabel } from '@/lib/groupTiers';
import {
  createGroupList,
  leaveGroup,
  toggleShareRatings,
} from '@/app/dashboard/groups/actions';
import type {
  Group,
  GroupList,
  GroupMemberWithProfile,
  GroupRatingFeedItem,
} from '@/lib/types';

export default async function GroupDetailPage({
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

  // RLS restricts SELECT on groups to members, so this returns null if the
  // user isn't in the group — handle that as 404.
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<Group>();

  if (!group) notFound();

  const [{ data: memberRows }, { data: listRows }, { data: feedRows }] =
    await Promise.all([
      supabase.rpc('list_group_members', { g: params.id }),
      supabase
        .from('group_lists')
        .select('*')
        .eq('group_id', params.id)
        .order('created_at', { ascending: false }),
      supabase.rpc('group_ratings_feed', { g: params.id }),
    ]);

  const members = (memberRows ?? []) as GroupMemberWithProfile[];
  const lists = (listRows ?? []) as GroupList[];
  const feed = (feedRows ?? []) as GroupRatingFeedItem[];

  const me = members.find((m) => m.user_id === user.id);
  const isAdmin = me?.role === 'admin';
  const memberCount = members.length;
  const capacityPct = Math.round((memberCount / group.max_families) * 100);

  return (
    <main className="mt-6">
      <Link href="/dashboard/groups" className="btn-ghost -ml-3 px-3">
        ← Groups
      </Link>

      <section className="mt-4 card">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
            👥
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-slate-900">{group.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                {groupTierLabel(group.tier)}
              </span>
              <span className="text-xs text-slate-500">
                {memberCount} / {group.max_families} families
              </span>
              {isAdmin && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                  Admin
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-brand-500"
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="mt-6">
        <CopyInviteCode code={group.invite_code} />
      </section>

      {/* ---------------- Share ratings toggle ---------------- */}
      {me && (
        <section className="mt-6 card">
          <div className="flex items-start gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Share your kids&apos; ratings
              </p>
              <p className="mt-1 text-xs text-slate-500">
                When on, this group sees aggregated (anonymous) counts of what your kids
                loved, liked, or skipped. Off by default.
              </p>
            </div>
            <form action={toggleShareRatings}>
              <input type="hidden" name="group_id" value={group.id} />
              <input type="hidden" name="next" value={(!me.share_ratings).toString()} />
              <button
                type="submit"
                aria-pressed={me.share_ratings}
                className={`relative h-7 w-12 rounded-full transition ${
                  me.share_ratings ? 'bg-brand-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                    me.share_ratings ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ---------------- Members ---------------- */}
      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Members ({memberCount})
        </h2>
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {(m.full_name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {m.full_name ?? 'Unnamed parent'}
                  {m.user_id === user.id && (
                    <span className="ml-1 text-xs text-slate-400">(you)</span>
                  )}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  {m.role} {m.share_ratings && '• sharing ratings'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Shared lists ---------------- */}
      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Shared book lists
        </h2>
        {lists.length === 0 ? (
          <p className="card text-sm text-slate-500">No shared lists yet.</p>
        ) : (
          <ul className="space-y-2">
            {lists.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/dashboard/groups/${group.id}/lists/${l.id}`}
                  className="card flex items-start gap-3 hover:border-brand-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-lg">
                    📚
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{l.title}</p>
                    {l.description && (
                      <p className="truncate text-xs text-slate-500">{l.description}</p>
                    )}
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {(l.books?.length ?? 0)} books
                    </p>
                  </div>
                  <span className="text-slate-400">›</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {isAdmin && (
          <form action={createGroupList} className="card mt-3 space-y-3">
            <input type="hidden" name="group_id" value={group.id} />
            <input
              type="text"
              name="title"
              required
              placeholder="New list title"
              className="input"
            />
            <input
              type="text"
              name="description"
              placeholder="Optional description"
              className="input"
            />
            <button type="submit" className="btn-secondary w-full">
              Create shared list
            </button>
          </form>
        )}
      </section>

      {/* ---------------- Aggregated ratings feed ---------------- */}
      <section className="mt-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          What families are loving
        </h2>
        {feed.length === 0 ? (
          <p className="card text-sm text-slate-500">
            Ratings show up here once members opt in to share. Flip the toggle above to
            contribute your own.
          </p>
        ) : (
          <ul className="space-y-2">
            {feed.map((item) => (
              <li
                key={item.book_id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3"
              >
                {item.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover_image_url}
                    alt=""
                    className="h-16 w-12 flex-shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-lg">
                    📖
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{item.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.author ?? 'Unknown author'}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    ❤️ {item.loved_count} · 👍 {item.liked_count}
                    {item.disliked_count + item.dnf_count > 0 && (
                      <>
                        {' '}
                        · 👎 {item.disliked_count + item.dnf_count}
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------------- Leave group ---------------- */}
      <section className="mt-10 border-t border-slate-100 pt-6">
        <form action={leaveGroup}>
          <input type="hidden" name="group_id" value={group.id} />
          <button type="submit" className="btn-ghost text-xs text-red-600">
            Leave this group
          </button>
        </form>
      </section>
    </main>
  );
}
