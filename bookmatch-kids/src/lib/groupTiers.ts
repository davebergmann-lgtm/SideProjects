export const GROUP_TIERS = [
  {
    value: 'starter',
    label: 'Starter',
    maxFamilies: 5,
    priceAnnual: 99,
    tagline: 'Small co-op — up to 5 families',
  },
  {
    value: 'plus',
    label: 'Plus',
    maxFamilies: 10,
    priceAnnual: 179,
    tagline: '10 families, curated lists',
  },
  {
    value: 'pro',
    label: 'Pro',
    maxFamilies: 20,
    priceAnnual: 299,
    tagline: '20 families, exports, multi-admin',
  },
] as const;

export type GroupTier = (typeof GROUP_TIERS)[number]['value'];

export function maxFamiliesForTier(tier: GroupTier): number {
  return GROUP_TIERS.find((t) => t.value === tier)!.maxFamilies;
}

export function groupTierLabel(tier: GroupTier): string {
  return GROUP_TIERS.find((t) => t.value === tier)?.label ?? tier;
}

/**
 * Maps a profile's subscription_tier → the highest group tier they're
 * allowed to create. Returns null if their plan cannot create groups.
 *
 * Per the context doc:
 *   - free / family: no group creation
 *   - family_plus: can create (Starter only, matches price parity)
 *   - group_starter / group_plus / group_pro: create their tier or below
 */
const CREATE_MATRIX: Record<string, GroupTier | null> = {
  free: null,
  family: null,
  family_plus: 'starter',
  group_starter: 'starter',
  group_plus: 'plus',
  group_pro: 'pro',
};

const TIER_ORDER: GroupTier[] = ['starter', 'plus', 'pro'];

export function maxCreatableGroupTier(subscriptionTier: string): GroupTier | null {
  return CREATE_MATRIX[subscriptionTier] ?? null;
}

export function canCreateGroupTier(
  subscriptionTier: string,
  desired: GroupTier
): boolean {
  const max = maxCreatableGroupTier(subscriptionTier);
  if (!max) return false;
  return TIER_ORDER.indexOf(desired) <= TIER_ORDER.indexOf(max);
}

export function canCreateAnyGroup(subscriptionTier: string): boolean {
  return maxCreatableGroupTier(subscriptionTier) !== null;
}
