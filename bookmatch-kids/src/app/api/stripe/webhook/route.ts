import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { tierFromPriceId, type SubscriptionTier } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook. Keeps `profiles.subscription_tier` and
 * `profiles.stripe_customer_id` in sync with the user's subscription.
 *
 * Handles:
 *   - checkout.session.completed        → initial subscribe
 *   - customer.subscription.updated     → upgrade/downgrade/renewal
 *   - customer.subscription.deleted     → cancel → back to free
 */
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: 'missing signature' }, { status: 400 });
  }

  const raw = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(sub);
        break;
      }
      default:
        // Ignore everything else.
        break;
    }
  } catch (err) {
    console.error('[stripe webhook]', event.type, err);
    return NextResponse.json({ error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription' || !session.subscription) return;
  const subId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id;
  const sub = await stripe.subscriptions.retrieve(subId);
  await handleSubscriptionChange(sub);
}

function userIdFromSubscription(sub: Stripe.Subscription): string | null {
  const meta = sub.metadata?.supabase_user_id;
  if (meta) return meta;
  return null;
}

async function lookupUserIdByCustomer(customerId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const userId =
    userIdFromSubscription(sub) ?? (await lookupUserIdByCustomer(customerId));
  if (!userId) {
    console.warn('[stripe webhook] no user for subscription', sub.id);
    return;
  }

  const active = sub.status === 'active' || sub.status === 'trialing';
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const tier: SubscriptionTier =
    active && priceId ? tierFromPriceId(priceId) ?? 'free' : 'free';

  const admin = createAdminClient();
  await admin
    .from('profiles')
    .update({
      subscription_tier: tier,
      stripe_customer_id: customerId,
    })
    .eq('id', userId);
}

async function handleSubscriptionCancelled(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const userId =
    userIdFromSubscription(sub) ?? (await lookupUserIdByCustomer(customerId));
  if (!userId) return;
  const admin = createAdminClient();
  await admin
    .from('profiles')
    .update({ subscription_tier: 'free' })
    .eq('id', userId);
}
