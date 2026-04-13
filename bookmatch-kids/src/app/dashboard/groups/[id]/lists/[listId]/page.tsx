import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GroupListBookSearch } from '@/components/GroupListBookSearch';
import { removeBookFromGroupList } from '@/app/dashboard/groups/actions';
import type {
  Group,
  GroupList,
  GroupListBook,
  GroupMemberWithProfile,
} from '@/lib/types';

export default async function GroupListDetailPage({
  params,
  searchParams,
}: {
  params: { id: string; listId: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: group } = await supabase
    .from('groups')
    .select('id, name')
    .eq('id', params.id)
    .maybeSingle<Pick<Group, 'id' | 'name'>>();

  if (!group) notFound();

  const { data: list } = await supabase
    .from('group_lists')
    .select('*')
    .eq('id', params.listId)
    .eq('group_id', params.id)
    .maybeSingle<GroupList>();

  if (!list) notFound();

  // Check admin via RPC so we don't have to juggle profiles RLS.
  const { data: memberRows } = await supabase.rpc('list_group_members', {
    g: params.id,
  });
  const members = (memberRows ?? []) as GroupMemberWithProfile[];
  const me = members.find((m) => m.user_id === user.id);
  const isAdmin = me?.role === 'admin';

  const books = (list.books ?? []) as GroupListBook[];

  return (
    <main className="mt-6">
      <Link href={`/dashboard/groups/${group.id}`} className="btn-ghost -ml-3 px-3">
        ← {group.name}
      </Link>

      <section className="mt-4 card">
        <h1 className="text-xl font-bold text-slate-900">{list.title}</h1>
        {list.description && (
          <p className="mt-1 text-sm text-slate-600">{list.description}</p>
        )}
        <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
          {books.length} {books.length === 1 ? 'book' : 'books'}
        </p>
      </section>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <section className="mt-6">
        <ul className="space-y-2">
          {books.map((b) => {
            const key =
              b.google_books_id ||
              `${b.title}|${b.author}`.toLowerCase();
            return (
              <li
                key={key}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3"
              >
                {b.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.cover_image_url}
                    alt=""
                    className="h-16 w-12 flex-shrink-0 rounded object-cover"
                  />
                ) : (
                  <div className="h-16 w-12 flex-shrink-0 rounded bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{b.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    {b.author || 'Unknown author'}
                  </p>
                </div>
                {isAdmin && (
                  <form action={removeBookFromGroupList}>
                    <input type="hidden" name="list_id" value={list.id} />
                    <input type="hidden" name="group_id" value={group.id} />
                    <input type="hidden" name="book_key" value={key} />
                    <button
                      type="submit"
                      className="btn-ghost text-xs"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </form>
                )}
              </li>
            );
          })}
          {books.length === 0 && (
            <li className="card text-sm text-slate-500">No books yet.</li>
          )}
        </ul>
      </section>

      {isAdmin && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Add books
          </h2>
          <GroupListBookSearch listId={list.id} groupId={group.id} />
        </section>
      )}
    </main>
  );
}
