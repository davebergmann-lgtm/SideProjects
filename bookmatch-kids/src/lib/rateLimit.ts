import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Free-tier limit: 5 AI reading-list generations per calendar month.
 * Paid tiers are unlimited. Counting is per user (across all kids).
 */
export const FREE_MONTHLY_RECS = 5;

const PAID_TIERS = new Set([
  'family',
  'family_plus',
  'group_starter',
  'group_plus',
  'group_pro',
]);

export function isPaidTier(subscriptionTier: string | null | undefined): boolean {
  return !!subscriptionTier && PAID_TIERS.has(subscriptionTier);
}

function startOfMonthIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

/**
 * Count how many reading lists this user has generated in the current
 * calendar month (UTC). Returns 0 if they have no kids yet.
 */
export async function monthlyRecCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: kids } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', userId);

  const childIds = (kids ?? []).map((k) => k.id as string);
  if (childIds.length === 0) return 0;

  const { count } = await supabase
    .from('reading_lists')
    .select('id', { count: 'exact', head: true })
    .in('child_id', childIds)
    .gte('generated_at', startOfMonthIso());

  return count ?? 0;
}

export type RecQuota = {
  isPaid: boolean;
  used: number;
  limit: number | null; // null = unlimited
  remaining: number | null;
  blocked: boolean;
};

export async function getRecQuota(
  supabase: SupabaseClient,
  userId: string,
  subscriptionTier: string | null | undefined
): Promise<RecQuota> {
  if (isPaidTier(subscriptionTier)) {
    return { isPaid: true, used: 0, limit: null, remaining: null, blocked: false };
  }
  const used = await monthlyRecCount(supabase, userId);
  const remaining = Math.max(0, FREE_MONTHLY_RECS - used);
  return {
    isPaid: false,
    used,
    limit: FREE_MONTHLY_RECS,
    remaining,
    blocked: used >= FREE_MONTHLY_RECS,
  };
}
