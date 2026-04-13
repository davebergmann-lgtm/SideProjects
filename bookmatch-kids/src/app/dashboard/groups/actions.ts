'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  GROUP_TIERS,
  canCreateGroupTier,
  maxFamiliesForTier,
  type GroupTier,
} from '@/lib/groupTiers';
import type { GroupListBook, GroupLookupResult } from '@/lib/types';

// ---------------------------------------------------------------------------
// Create group
// ---------------------------------------------------------------------------
export async function createGroup(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const name = String(formData.get('name') ?? '').trim();
  const tier = String(formData.get('tier') ?? '') as GroupTier;

  if (!name) {
    redirect('/dashboard/groups/new?error=Group+name+is+required');
  }
  if (!GROUP_TIERS.some((t) => t.value === tier)) {
    redirect('/dashboard/groups/new?error=Pick+a+tier');
  }

  // Read the subscription tier from profiles — the canonical source of
  // truth (updated by the Stripe webhook in a later phase).
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle();

  const subscriptionTier = profile?.subscription_tier ?? 'free';

  if (!canCreateGroupTier(subscriptionTier, tier)) {
    redirect(
      `/dashboard/groups/new?error=${encodeURIComponent(
        `Your plan (${subscriptionTier}) can't create a ${tier} group.`
      )}`
    );
  }

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({
      name,
      tier,
      max_families: maxFamiliesForTier(tier),
      created_by: user.id,
    })
    .select('id')
    .single();

  if (groupError || !group) {
    redirect(
      `/dashboard/groups/new?error=${encodeURIComponent(
        groupError?.message ?? 'Could not create group'
      )}`
    );
  }

  // Add the creator as the first admin member.
  const { error: memberError } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: user.id,
    role: 'admin',
  });

  if (memberError) {
    redirect(
      `/dashboard/groups/new?error=${encodeURIComponent(memberError.message)}`
    );
  }

  revalidatePath('/dashboard/groups');
  redirect(`/dashboard/groups/${group.id}`);
}

// ---------------------------------------------------------------------------
// Join group by invite code
// ---------------------------------------------------------------------------
export async function joinGroup(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const code = String(formData.get('invite_code') ?? '')
    .trim()
    .toLowerCase();
  if (!code) {
    redirect('/dashboard/groups?error=Invite+code+required');
  }

  // groups.SELECT is gated to members, so we look up via a security-definer
  // RPC that only returns a match for an exact invite code.
  const { data: rows, error: lookupError } = await supabase.rpc(
    'lookup_group_by_invite',
    { code }
  );

  const lookup = (rows as GroupLookupResult[] | null)?.[0];

  if (lookupError || !lookup) {
    redirect(
      `/dashboard/groups?error=${encodeURIComponent('Invalid invite code')}`
    );
  }

  if (lookup.member_count >= lookup.max_families) {
    redirect(`/dashboard/groups?error=${encodeURIComponent('This group is full.')}`);
  }

  const { error: insertError } = await supabase.from('group_members').insert({
    group_id: lookup.id,
    user_id: user.id,
    role: 'member',
  });

  if (insertError) {
    // 23505 = unique_violation, i.e. already a member.
    if (insertError.code === '23505') {
      revalidatePath('/dashboard/groups');
      redirect(`/dashboard/groups/${lookup.id}`);
    }
    redirect(
      `/dashboard/groups?error=${encodeURIComponent(insertError.message)}`
    );
  }

  revalidatePath('/dashboard/groups');
  redirect(`/dashboard/groups/${lookup.id}`);
}

// ---------------------------------------------------------------------------
// Leave group
// ---------------------------------------------------------------------------
export async function leaveGroup(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const groupId = String(formData.get('group_id') ?? '');
  if (!groupId) return;

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) {
    redirect(
      `/dashboard/groups/${groupId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath('/dashboard/groups');
  redirect('/dashboard/groups');
}

// ---------------------------------------------------------------------------
// Toggle share_ratings for the current user in a group
// ---------------------------------------------------------------------------
export async function toggleShareRatings(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const groupId = String(formData.get('group_id') ?? '');
  const next = String(formData.get('next') ?? 'false') === 'true';
  if (!groupId) return;

  const { error } = await supabase
    .from('group_members')
    .update({ share_ratings: next })
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) {
    redirect(
      `/dashboard/groups/${groupId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/dashboard/groups/${groupId}`);
}

// ---------------------------------------------------------------------------
// Group lists
// ---------------------------------------------------------------------------
export async function createGroupList(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const groupId = String(formData.get('group_id') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!groupId || !title) {
    redirect(`/dashboard/groups/${groupId}?error=Title+required`);
  }

  const { data, error } = await supabase
    .from('group_lists')
    .insert({
      group_id: groupId,
      created_by: user.id,
      title,
      description,
      books: [],
    })
    .select('id')
    .single();

  if (error || !data) {
    redirect(
      `/dashboard/groups/${groupId}?error=${encodeURIComponent(
        error?.message ?? 'Could not create list'
      )}`
    );
  }

  revalidatePath(`/dashboard/groups/${groupId}`);
  redirect(`/dashboard/groups/${groupId}/lists/${data.id}`);
}

export async function addBookToGroupList(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const listId = String(formData.get('list_id') ?? '');
  const groupId = String(formData.get('group_id') ?? '');
  const book: GroupListBook = {
    title: String(formData.get('title') ?? ''),
    author: String(formData.get('author') ?? ''),
    isbn: String(formData.get('isbn') ?? '') || null,
    cover_image_url: String(formData.get('cover_image_url') ?? '') || null,
    google_books_id: String(formData.get('google_books_id') ?? '') || null,
  };

  if (!listId || !book.title) return;

  // Fetch the current list to append; RLS ensures only admins get through.
  const { data: current, error: fetchError } = await supabase
    .from('group_lists')
    .select('books')
    .eq('id', listId)
    .maybeSingle();

  if (fetchError || !current) {
    redirect(
      `/dashboard/groups/${groupId}/lists/${listId}?error=${encodeURIComponent(
        fetchError?.message ?? 'List not found'
      )}`
    );
  }

  const existing = (current.books as GroupListBook[] | null) ?? [];
  // Dedupe on google_books_id or normalized title|author.
  const key = book.google_books_id || `${book.title}|${book.author}`.toLowerCase();
  const already = existing.some((b) => {
    const k = b.google_books_id || `${b.title}|${b.author}`.toLowerCase();
    return k === key;
  });

  if (already) {
    revalidatePath(`/dashboard/groups/${groupId}/lists/${listId}`);
    return;
  }

  const { error: updateError } = await supabase
    .from('group_lists')
    .update({ books: [...existing, book] })
    .eq('id', listId);

  if (updateError) {
    redirect(
      `/dashboard/groups/${groupId}/lists/${listId}?error=${encodeURIComponent(
        updateError.message
      )}`
    );
  }

  revalidatePath(`/dashboard/groups/${groupId}/lists/${listId}`);
}

export async function removeBookFromGroupList(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const listId = String(formData.get('list_id') ?? '');
  const groupId = String(formData.get('group_id') ?? '');
  const key = String(formData.get('book_key') ?? '');
  if (!listId || !key) return;

  const { data: current } = await supabase
    .from('group_lists')
    .select('books')
    .eq('id', listId)
    .maybeSingle();

  if (!current) return;

  const existing = (current.books as GroupListBook[] | null) ?? [];

  const filtered = existing.filter((b) => {
    const k = b.google_books_id || `${b.title}|${b.author}`.toLowerCase();
    return k !== key;
  });

  await supabase.from('group_lists').update({ books: filtered }).eq('id', listId);
  revalidatePath(`/dashboard/groups/${groupId}/lists/${listId}`);
}
