'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { resolvePriceId, type BillingInterval } from '@/lib/pricing';

function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return host ? `${proto}://${host}` : 'http://localhost:3000';
}

/**
 * Create (or look up) a Stripe customer for the current user and
 * persist the ID on `profiles.stripe_customer_id`. Uses the caller's
 * RLS session so it can only update their own row.
 */
async function ensureStripeCustomer(
  userId: string,
  email: string | null,
  fullName: string | null
): Promise<string> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: fullName ?? undefined,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
export async function startCheckout(formData: FormData) {
  const planId = String(formData.get('planId') ?? '');
  const interval = String(formData.get('interval') ?? 'month') as BillingInterval;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const priceId = resolvePriceId(planId, interval);
  if (!priceId) {
    redirect(
      `/dashboard/billing?error=${encodeURIComponent(
        'That plan is not configured yet.'
      )}`
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const customerId = await ensureStripeCustomer(
    user.id,
    profile?.email ?? user.email ?? null,
    profile?.full_name ?? null
  );

  const stripe = getStripe();
  const base = siteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/dashboard/billing?checkout=success`,
    cancel_url: `${base}/dashboard/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    client_reference_id: user.id,
    subscription_data: {
      metadata: { supabase_user_id: user.id, bookmatch_plan_id: planId },
    },
    metadata: { supabase_user_id: user.id, bookmatch_plan_id: planId },
  });

  if (!session.url) {
    redirect(
      `/dashboard/billing?error=${encodeURIComponent(
        'Could not start checkout.'
      )}`
    );
  }
  redirect(session.url);
}

// ---------------------------------------------------------------------------
// Billing portal
// ---------------------------------------------------------------------------
export async function openBillingPortal() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    redirect(
      `/dashboard/billing?error=${encodeURIComponent(
        'No active subscription to manage.'
      )}`
    );
  }

  const stripe = getStripe();
  const base = siteUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${base}/dashboard/billing`,
  });
  redirect(portal.url);
}
