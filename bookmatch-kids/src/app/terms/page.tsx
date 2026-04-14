import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service · BookMatch for Kids',
  description: 'The rules for using BookMatch for Kids.',
};

const UPDATED = 'April 14, 2026';

export default function TermsPage() {
  return (
    <main className="pt-8 pb-12">
      <Link href="/" className="btn-ghost -ml-3 px-3">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-1 text-xs text-slate-500">Last updated {UPDATED}</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <p>
          These terms govern your use of BookMatch for Kids (&ldquo;the
          service&rdquo;). By creating an account, you agree to them. If you
          don&rsquo;t, please don&rsquo;t use the service.
        </p>

        <Section title="1. Who can sign up">
          <p>
            You must be at least 18 years old and the parent or legal guardian
            of any child whose profile you add. You&rsquo;re responsible for
            everything that happens under your account.
          </p>
        </Section>

        <Section title="2. What the service does">
          <p>
            BookMatch helps you track books your kids have read and generates
            personalized reading recommendations using AI. Recommendations are
            suggestions, not endorsements — you&rsquo;re responsible for
            deciding what&rsquo;s age-appropriate for your family.
          </p>
          <p>
            We show links to Libby, Hoopla, and Amazon as convenience. We
            don&rsquo;t control those services and make no promises about
            availability or pricing there.
          </p>
        </Section>

        <Section title="3. Subscriptions and billing">
          <p>
            Free accounts include a limited number of AI recommendations per
            month. Paid plans are billed through Stripe on a recurring basis
            (monthly or annual, as you choose at checkout). You can cancel any
            time from the Billing page; cancellations take effect at the end of
            the current billing period.
          </p>
          <p>
            Prices may change. We&rsquo;ll notify you by email before any
            increase affects your subscription.
          </p>
        </Section>

        <Section title="4. Refunds">
          <p>
            Monthly plans are non-refundable. For annual plans, email us within
            14 days of purchase for a pro-rata refund.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree not to:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Abuse, reverse-engineer, or overwhelm the service</li>
            <li>
              Share an account across unrelated families (each family needs
              their own)
            </li>
            <li>
              Upload or enter any information about a child that isn&rsquo;t
              yours, or that you don&rsquo;t have the right to share
            </li>
            <li>
              Use the service to collect data about other children in your
              co-op group without their parents&rsquo; consent
            </li>
          </ul>
        </Section>

        <Section title="6. Your content">
          <p>
            You keep ownership of the data you enter (kid profiles, book
            ratings, group lists). You grant us a limited license to store and
            process it solely to operate the service for you.
          </p>
        </Section>

        <Section title="7. AI recommendations — no guarantees">
          <p>
            Recommendations come from a large language model and can be wrong,
            outdated, or miss important context about a specific book.
            Always preview any book you&rsquo;re unsure about. We make no
            warranty that any recommendation is appropriate for a given child.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            You can delete your account at any time. We can suspend or close
            accounts that violate these terms or put the service at risk.
          </p>
        </Section>

        <Section title="9. Liability">
          <p>
            The service is provided &ldquo;as is&rdquo;. To the extent allowed
            by law, our total liability is capped at the amount you&rsquo;ve
            paid us in the last 12 months.
          </p>
        </Section>

        <Section title="10. Changes to these terms">
          <p>
            If we change these terms in a way that materially affects your
            rights, we&rsquo;ll email active accounts before the changes take
            effect.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions? Email{' '}
            <a
              href="mailto:hello@bookmatch-kids.app"
              className="font-semibold text-brand-700 hover:underline"
            >
              hello@bookmatch-kids.app
            </a>
            .
          </p>
        </Section>
      </div>

      <footer className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        <Link href="/privacy" className="hover:text-slate-600">
          Privacy Policy
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
