import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  PRICING,
  isSubscriptionTier,
  planForTier,
  type BillingInterval,
  type PricingPlan,
} from '@/lib/pricing';
import { startCheckout, openBillingPortal } from './actions';

type SearchParams = {
  error?: string;
  checkout?: string;
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  const rawTier = profile?.subscription_tier ?? 'free';
  const currentTier = isSubscriptionTier(rawTier) ? rawTier : 'free';
  const currentPlan = planForTier(currentTier);
  const hasStripeCustomer = !!profile?.stripe_customer_id;

  const paidPlans = PRICING.filter((p) => p.prices.length > 0);

  return (
    <main className="mt-6 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-brand-700 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your BookMatch subscription.
        </p>
      </div>

      {searchParams.checkout === 'success' && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
          Thanks! Your subscription is active. It can take a few seconds for
          your plan to reflect here.
        </div>
      )}
      {searchParams.checkout === 'cancelled' && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Checkout cancelled. No charge was made.
        </div>
      )}
      {searchParams.error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}

      <section className="card">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Current plan
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {currentPlan?.name ?? 'Free'}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {currentPlan?.tagline ?? 'Try it out with one kid'}
        </p>
        {hasStripeCustomer && (
          <form action={openBillingPortal} className="mt-4">
            <button type="submit" className="btn-secondary w-full">
              Manage subscription
            </button>
          </form>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Plans
        </h2>
        {paidPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.tier === currentTier}
          />
        ))}
      </section>
    </main>
  );
}

function PlanCard({ plan, isCurrent }: { plan: PricingPlan; isCurrent: boolean }) {
  const monthly = plan.prices.find((p) => p.interval === 'month');
  const annual = plan.prices.find((p) => p.interval === 'year');

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{plan.name}</p>
          <p className="text-xs text-slate-500">{plan.tagline}</p>
        </div>
        {isCurrent && (
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
            Current
          </span>
        )}
      </div>

      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {plan.features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>

      <div className="mt-4 space-y-2">
        {monthly && (
          <CheckoutButton
            planId={plan.id}
            interval="month"
            label={`$${monthly.priceUsd}/mo`}
            disabled={isCurrent}
          />
        )}
        {annual && (
          <CheckoutButton
            planId={plan.id}
            interval="year"
            label={`$${annual.priceUsd}/yr${
              monthly ? ` — save $${monthly.priceUsd * 12 - annual.priceUsd}` : ''
            }`}
            disabled={isCurrent}
            primary={!monthly}
          />
        )}
      </div>
    </div>
  );
}

function CheckoutButton({
  planId,
  interval,
  label,
  disabled,
  primary,
}: {
  planId: string;
  interval: BillingInterval;
  label: string;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <form action={startCheckout}>
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="interval" value={interval} />
      <button
        type="submit"
        disabled={disabled}
        className={`w-full ${
          primary ? 'btn-primary' : 'btn-secondary'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {disabled ? 'Current plan' : label}
      </button>
    </form>
  );
}
