#!/usr/bin/env node
/**
 * Idempotent Stripe product + price setup for BookMatch for Kids.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs
 *
 * Creates (or reuses) one Stripe Product per plan and one Price per
 * (plan, interval) combination. Matches products/prices by the
 * `metadata.bookmatch_plan_id` and `metadata.bookmatch_interval` fields
 * so it can be re-run safely.
 *
 * Prints the env vars you should add to .env.local + Vercel.
 */

import Stripe from 'stripe';

const PLANS = [
  {
    id: 'family',
    tier: 'family',
    name: 'BookMatch Family',
    description: 'Up to 3 kids, unlimited AI recommendations.',
    prices: [
      { interval: 'month', unitAmount: 400, envVar: 'STRIPE_PRICE_FAMILY_MONTHLY' },
      { interval: 'year', unitAmount: 3900, envVar: 'STRIPE_PRICE_FAMILY_ANNUAL' },
    ],
  },
  {
    id: 'family_plus',
    tier: 'family_plus',
    name: 'BookMatch Family Plus',
    description: 'Family plan + create one Starter co-op group.',
    prices: [
      {
        interval: 'month',
        unitAmount: 900,
        envVar: 'STRIPE_PRICE_FAMILY_PLUS_MONTHLY',
      },
      {
        interval: 'year',
        unitAmount: 8900,
        envVar: 'STRIPE_PRICE_FAMILY_PLUS_ANNUAL',
      },
    ],
  },
  {
    id: 'group_starter',
    tier: 'group_starter',
    name: 'BookMatch Group Starter',
    description: 'Co-op plan for up to 5 families.',
    prices: [
      {
        interval: 'year',
        unitAmount: 9900,
        envVar: 'STRIPE_PRICE_GROUP_STARTER_ANNUAL',
      },
    ],
  },
  {
    id: 'group_plus',
    tier: 'group_plus',
    name: 'BookMatch Group Plus',
    description: 'Co-op plan for up to 10 families.',
    prices: [
      {
        interval: 'year',
        unitAmount: 17900,
        envVar: 'STRIPE_PRICE_GROUP_PLUS_ANNUAL',
      },
    ],
  },
  {
    id: 'group_pro',
    tier: 'group_pro',
    name: 'BookMatch Group Pro',
    description: 'Co-op plan for up to 20 families.',
    prices: [
      {
        interval: 'year',
        unitAmount: 29900,
        envVar: 'STRIPE_PRICE_GROUP_PRO_ANNUAL',
      },
    ],
  },
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Missing STRIPE_SECRET_KEY');
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' });

async function findProduct(planId) {
  // Search is available on all modes; fall back to list if it fails.
  try {
    const res = await stripe.products.search({
      query: `metadata['bookmatch_plan_id']:'${planId}' AND active:'true'`,
      limit: 1,
    });
    return res.data[0] ?? null;
  } catch {
    const list = await stripe.products.list({ active: true, limit: 100 });
    return list.data.find((p) => p.metadata?.bookmatch_plan_id === planId) ?? null;
  }
}

async function findPrice(productId, interval) {
  const list = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });
  return (
    list.data.find(
      (p) =>
        p.recurring?.interval === interval &&
        p.metadata?.bookmatch_interval === interval
    ) ?? null
  );
}

async function upsertPlan(plan) {
  let product = await findProduct(plan.id);
  if (product) {
    // Keep name/description in sync.
    if (product.name !== plan.name || product.description !== plan.description) {
      product = await stripe.products.update(product.id, {
        name: plan.name,
        description: plan.description,
        metadata: {
          bookmatch_plan_id: plan.id,
          tier: plan.tier,
        },
      });
    }
    console.log(`= product ${plan.id} → ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        bookmatch_plan_id: plan.id,
        tier: plan.tier,
      },
    });
    console.log(`+ product ${plan.id} → ${product.id}`);
  }

  const envLines = [];
  for (const price of plan.prices) {
    let p = await findPrice(product.id, price.interval);
    if (p && p.unit_amount !== price.unitAmount) {
      // Prices are immutable — archive the old one, create a new one.
      await stripe.prices.update(p.id, { active: false });
      p = null;
    }
    if (!p) {
      p = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: price.unitAmount,
        recurring: { interval: price.interval },
        metadata: {
          bookmatch_plan_id: plan.id,
          bookmatch_interval: price.interval,
        },
      });
      console.log(`+ price  ${plan.id}/${price.interval} → ${p.id}`);
    } else {
      console.log(`= price  ${plan.id}/${price.interval} → ${p.id}`);
    }
    envLines.push(`${price.envVar}=${p.id}`);
  }
  return envLines;
}

async function main() {
  console.log('Setting up Stripe products + prices…\n');
  const allEnv = [];
  for (const plan of PLANS) {
    const lines = await upsertPlan(plan);
    allEnv.push(...lines);
  }
  console.log('\nAdd these to .env.local (and Vercel):\n');
  console.log(allEnv.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
