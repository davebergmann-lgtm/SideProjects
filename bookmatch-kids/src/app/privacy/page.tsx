import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · BookMatch for Kids',
  description:
    'How BookMatch for Kids collects, stores, and protects data — including kids\u2019 information under COPPA.',
};

const UPDATED = 'April 14, 2026';

export default function PrivacyPage() {
  return (
    <main className="pt-8 pb-12">
      <Link href="/" className="btn-ghost -ml-3 px-3">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-1 text-xs text-slate-500">Last updated {UPDATED}</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            BookMatch for Kids (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is built for
            parents and guardians. Only adults (18+) can create accounts. This
            policy explains what we collect, why, and how we protect it — with
            special attention to children&rsquo;s data under COPPA (the
            U.S. Children&rsquo;s Online Privacy Protection Act).
          </p>
        </section>

        <Section title="1. Accounts are for parents">
          <p>
            Only parents and legal guardians may create an account. Children
            cannot sign up, sign in, or interact with the service directly. All
            information about a child in BookMatch is entered by the parent who
            owns the account.
          </p>
        </Section>

        <Section title="2. What we collect">
          <p className="font-semibold text-slate-900">From parents:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Name and email address</li>
            <li>
              A Supabase-managed password hash (we never see your plaintext
              password)
            </li>
            <li>Subscription status and Stripe customer ID if you upgrade</li>
          </ul>

          <p className="mt-3 font-semibold text-slate-900">
            About kids (entered by the parent):
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>First name (or nickname) only — we do not ask for last names</li>
            <li>Age, grade level, and reading level</li>
            <li>Interests picked from a preset list</li>
            <li>Books the parent rates on the child&rsquo;s behalf</li>
          </ul>
          <p className="mt-3">
            We do not ask for, and we discourage parents from entering, last
            names, school names, home addresses, photos, phone numbers, or any
            other identifying information about a child.
          </p>
        </Section>

        <Section title="3. How we use it">
          <ul className="ml-5 list-disc space-y-1">
            <li>
              To generate personalized book recommendations using the Anthropic
              Claude API. We send the child&rsquo;s first name, age, reading
              level, interests, and book ratings — never your email or
              identifying info.
            </li>
            <li>To save reading lists so you can come back to them.</li>
            <li>
              To look up book metadata and covers from the Google Books public
              API.
            </li>
            <li>
              To process subscription payments via Stripe (if you upgrade).
            </li>
          </ul>
          <p className="mt-3">
            We never use kids&rsquo; data to show ads, train models, build
            marketing profiles, or sell information.
          </p>
        </Section>

        <Section title="4. Who sees the data">
          <p>
            Kid profiles and ratings are private to the parent account that
            created them. The only exceptions are:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Groups you join.</strong> If you opt in to share ratings
              with a co-op group, other members of that specific group can see
              the aggregated ratings and any lists you add to the group. You
              can turn sharing off at any time.
            </li>
            <li>
              <strong>Sub-processors we use to run the service:</strong>{' '}
              Supabase (database + auth), Anthropic (recommendation generation),
              Google Books (cover lookups), Stripe (payments), Vercel (hosting),
              and Sentry (error monitoring). Each is bound by their own terms
              and handles data on our behalf.
            </li>
          </ul>
        </Section>

        <Section title="5. Parental rights (and COPPA)">
          <p>
            Because all data about a child is entered and controlled by the
            parent, you have the right at any time to:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Review</strong> everything stored about your kids — visible
              on each child&rsquo;s dashboard page.
            </li>
            <li>
              <strong>Delete</strong> a child profile, which removes their name,
              profile fields, ratings, and generated reading lists.
            </li>
            <li>
              <strong>Delete your entire account</strong> by emailing us at the
              address below; we&rsquo;ll process the deletion within 30 days.
            </li>
            <li>
              <strong>Refuse further collection</strong> at any time by deleting
              the child profile.
            </li>
          </ul>
          <p className="mt-3">
            We do not require more information than is reasonably needed to
            recommend books. If you ever feel uncomfortable entering something,
            don&rsquo;t — the service works fine with just a first name, age,
            and a few interests.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We keep account data as long as your account is active. If you
            delete your account, we delete the associated profiles, ratings,
            and reading lists. Payment records required for tax and accounting
            are retained by Stripe per their policy.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            Data is stored in Supabase (Postgres) with row-level security so
            that each parent can only access their own records. Traffic is
            encrypted in transit. No system is perfectly secure; please use a
            strong password and let us know if anything looks off.
          </p>
        </Section>

        <Section title="8. Changes">
          <p>
            If we materially change how we handle kids&rsquo; data, we&rsquo;ll
            notify active parent accounts by email before the change takes
            effect.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions, deletion requests, or COPPA concerns: email{' '}
            <a
              href="mailto:privacy@bookmatch-kids.app"
              className="font-semibold text-brand-700 hover:underline"
            >
              privacy@bookmatch-kids.app
            </a>
            . We aim to respond within 3 business days.
          </p>
        </Section>
      </div>

      <footer className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        <Link href="/terms" className="hover:text-slate-600">
          Terms of Service
        </Link>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-slate-900">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
