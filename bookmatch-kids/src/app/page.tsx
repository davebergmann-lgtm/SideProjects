import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PRICING } from '@/lib/pricing';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { deleted?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/dashboard');

  const family = PRICING.find((p) => p.id === 'family');
  const familyPlus = PRICING.find((p) => p.id === 'family_plus');

  return (
    <main className="pt-8">
      {searchParams.deleted === '1' && (
        <div className="mb-6 rounded-xl bg-green-50 p-3 text-center text-sm text-green-800">
          Your account and all its data have been deleted.
        </div>
      )}

      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-3xl">
          📚
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          BookMatch <span className="text-brand-500">for Kids</span>
        </h1>
        <p className="mt-3 text-base text-slate-600">
          The next perfect book for your kid, without the work. Tell us what
          they love — we do the rest.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3">
          <Link href="/signup" className="btn-primary">
            Get started — it&apos;s free
          </Link>
          <Link href="/login" className="btn-secondary">
            I already have an account
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          No credit card required · 5 free recommendations a month
        </p>
      </section>

      {/* How it works */}
      <section className="mt-12">
        <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          How it works
        </h2>
        <ol className="mt-4 space-y-3">
          <Step
            n={1}
            title="Add your kid's profile"
            text="Age, reading level, and a few interests — picture books to YA, we've got you."
          />
          <Step
            n={2}
            title="Rate a few books they've read"
            text="Loved, liked, didn't finish. That's all the AI needs to start matching."
          />
          <Step
            n={3}
            title="Get a reading list they'll actually like"
            text="10 fresh picks with Libby and Amazon links. Tap to rate when they finish."
          />
        </ol>
      </section>

      {/* Features */}
      <section className="mt-12">
        <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          What parents get
        </h2>
        <ul className="mt-4 space-y-3">
          <Feature
            emoji="🎯"
            title="Recommendations that fit"
            text="Claude AI reads your kid's ratings and finds books at the right level and taste."
          />
          <Feature
            emoji="🏛️"
            title="Library-first"
            text="Every book comes with Libby, Hoopla, and Amazon links — free copies show up first."
          />
          <Feature
            emoji="👥"
            title="Share with your co-op"
            text="Homeschool groups can share lists and see what other kids loved."
          />
          <Feature
            emoji="🔒"
            title="No ads, no tracking kids"
            text="Kid profiles are private to you. We never build profiles on minors."
          />
        </ul>
      </section>

      {/* Pricing preview */}
      <section className="mt-12">
        <h2 className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          Simple pricing
        </h2>
        <div className="mt-4 space-y-3">
          <PriceCard
            name="Free"
            price="$0"
            sub="Forever"
            features={[
              '1 kid profile',
              '5 AI recommendations / month',
              'Rate any book',
            ]}
            ctaHref="/signup"
            ctaLabel="Start free"
          />
          {family && (
            <PriceCard
              name={family.name}
              price={`$${family.prices.find((p) => p.interval === 'year')?.priceUsd}`}
              sub="/year"
              features={[
                'Up to 3 kid profiles',
                'Unlimited recommendations',
                'Libby + Amazon links',
              ]}
              ctaHref="/signup"
              ctaLabel="Get Family"
              highlight
            />
          )}
          {familyPlus && (
            <PriceCard
              name={familyPlus.name}
              price={`$${familyPlus.prices.find((p) => p.interval === 'year')?.priceUsd}`}
              sub="/year"
              features={[
                'Everything in Family',
                'Create a co-op group (5 families)',
                'Shared reading lists',
              ]}
              ctaHref="/signup"
              ctaLabel="Get Family Plus"
            />
          )}
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Larger co-ops? See all Group tiers after signup.
        </p>
      </section>

      {/* Final CTA */}
      <section className="mt-14 mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Stop playing librarian.
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Spend the time reading instead.
        </p>
        <Link href="/signup" className="btn-primary mt-5 w-full">
          Create a free account
        </Link>
      </section>

      <footer className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-slate-600">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-600">
            Terms
          </Link>
        </div>
        <p className="mt-2">© BookMatch for Kids</p>
      </footer>
    </main>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="card flex items-start gap-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
        {n}
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-600">{text}</p>
      </div>
    </li>
  );
}

function Feature({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <li className="card flex items-start gap-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-600">{text}</p>
      </div>
    </li>
  );
}

function PriceCard({
  name,
  price,
  sub,
  features,
  ctaHref,
  ctaLabel,
  highlight,
}: {
  name: string;
  price: string;
  sub: string;
  features: string[];
  ctaHref: string;
  ctaLabel: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card ${highlight ? 'border-brand-300 ring-1 ring-brand-200' : ''}`}>
      <div className="flex items-baseline justify-between">
        <p className="font-semibold text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">
          <span className="text-lg font-bold text-slate-900">{price}</span>
          <span className="ml-1">{sub}</span>
        </p>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`mt-4 block ${highlight ? 'btn-primary' : 'btn-secondary'} w-full`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
