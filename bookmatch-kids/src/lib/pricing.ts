/**
 * Pricing catalog — source of truth for tiers, prices, and the mapping
 * between Stripe products and `profiles.subscription_tier`.
 *
 * Prices are in whole dollars (USD). `priceEnvVar` is read at runtime
 * by server actions to resolve the Stripe price ID. Keep product
 * metadata `tier` in Stripe aligned to the `tier` field below — the
 * webhook uses it to update `profiles.subscription_tier`.
 */

export type SubscriptionTier =
  | 'free'
  | 'family'
  | 'family_plus'
  | 'group_starter'
  | 'group_plus'
  | 'group_pro';

export type BillingInterval = 'month' | 'year';

export type PricingPlan = {
  id: string;
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  features: string[];
  prices: {
    interval: BillingInterval;
    priceUsd: number;
    priceEnvVar: string;
  }[];
  groupsAllowed: boolean;
};

export const PRICING: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    tagline: 'Try it out with one kid',
    features: [
      '1 child profile',
      '5 AI recommendations per month',
      'Rate any book',
    ],
    prices: [],
    groupsAllowed: false,
  },
  {
    id: 'family',
    tier: 'family',
    name: 'Family',
    tagline: 'For a single family',
    features: [
      'Up to 3 child profiles',
      'Unlimited AI recommendations',
      'Libby + Amazon quick links',
    ],
    prices: [
      { interval: 'month', priceUsd: 4, priceEnvVar: 'STRIPE_PRICE_FAMILY_MONTHLY' },
      { interval: 'year', priceUsd: 39, priceEnvVar: 'STRIPE_PRICE_FAMILY_ANNUAL' },
    ],
    groupsAllowed: false,
  },
  {
    id: 'family_plus',
    tier: 'family_plus',
    name: 'Family Plus',
    tagline: 'Family plan + create one co-op group',
    features: [
      'Everything in Family',
      'Create a Starter group (up to 5 families)',
      'Shared reading lists',
    ],
    prices: [
      {
        interval: 'month',
        priceUsd: 9,
        priceEnvVar: 'STRIPE_PRICE_FAMILY_PLUS_MONTHLY',
      },
      {
        interval: 'year',
        priceUsd: 89,
        priceEnvVar: 'STRIPE_PRICE_FAMILY_PLUS_ANNUAL',
      },
    ],
    groupsAllowed: true,
  },
  {
    id: 'group_starter',
    tier: 'group_starter',
    name: 'Group Starter',
    tagline: 'Small co-op, 5 families',
    features: [
      'Everything in Family Plus',
      'Up to 5 families in one group',
      'Admin tools',
    ],
    prices: [
      {
        interval: 'year',
        priceUsd: 99,
        priceEnvVar: 'STRIPE_PRICE_GROUP_STARTER_ANNUAL',
      },
    ],
    groupsAllowed: true,
  },
  {
    id: 'group_plus',
    tier: 'group_plus',
    name: 'Group Plus',
    tagline: 'Growing co-op, 10 families',
    features: [
      'Up to 10 families',
      'Curated shared lists',
      'Priority AI',
    ],
    prices: [
      {
        interval: 'year',
        priceUsd: 179,
        priceEnvVar: 'STRIPE_PRICE_GROUP_PLUS_ANNUAL',
      },
    ],
    groupsAllowed: true,
  },
  {
    id: 'group_pro',
    tier: 'group_pro',
    name: 'Group Pro',
    tagline: 'Large co-op, 20 families',
    features: [
      'Up to 20 families',
      'PDF export',
      'Multi-admin',
    ],
    prices: [
      {
        interval: 'year',
        priceUsd: 299,
        priceEnvVar: 'STRIPE_PRICE_GROUP_PRO_ANNUAL',
      },
    ],
    groupsAllowed: true,
  },
];

export const PAID_TIERS: SubscriptionTier[] = [
  'family',
  'family_plus',
  'group_starter',
  'group_plus',
  'group_pro',
];

const ALL_TIERS: SubscriptionTier[] = [
  'free',
  'family',
  'family_plus',
  'group_starter',
  'group_plus',
  'group_pro',
];

export function isSubscriptionTier(v: string | null | undefined): v is SubscriptionTier {
  return !!v && (ALL_TIERS as string[]).includes(v);
}

export function planForTier(tier: SubscriptionTier): PricingPlan | undefined {
  return PRICING.find((p) => p.tier === tier);
}

/**
 * Look up a plan + interval from an env-var-resolved price ID.
 * Returns the tier that the subscription grants.
 */
export function tierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const plan of PRICING) {
    for (const p of plan.prices) {
      if (process.env[p.priceEnvVar] === priceId) return plan.tier;
    }
  }
  return null;
}

export function resolvePriceId(
  planId: string,
  interval: BillingInterval
): string | null {
  const plan = PRICING.find((p) => p.id === planId);
  if (!plan) return null;
  const match = plan.prices.find((p) => p.interval === interval);
  if (!match) return null;
  return process.env[match.priceEnvVar] ?? null;
}
