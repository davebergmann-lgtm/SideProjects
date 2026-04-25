import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="mt-6 space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-brand-700 hover:underline">
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          How BookMatch Works
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Everything you need to know about finding your kid&apos;s next
          favorite book.
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          1. Create a kid profile
        </h2>
        <p className="text-sm text-slate-700">
          Add your child&apos;s name, age, reading level, and a few interests.
          This helps the AI understand what kind of books to look for &mdash;
          picture books for a 4-year-old are very different from chapter books
          for a 10-year-old.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          2. Rate books they&apos;ve read
        </h2>
        <p className="text-sm text-slate-700">
          Search for books your kid has already read and rate each one:
          <strong> Loved</strong>, <strong>Liked</strong>,{' '}
          <strong>Disliked</strong>, or <strong>Didn&apos;t Finish</strong>.
          The more ratings you add, the better the recommendations get. Even
          3&ndash;5 books is enough to start.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          3. Get AI-powered recommendations
        </h2>
        <p className="text-sm text-slate-700">
          Tap <strong>&ldquo;Get recommendations&rdquo;</strong> and our AI
          (Claude by Anthropic) analyzes your kid&apos;s taste &mdash; what
          they loved, what they didn&apos;t &mdash; and generates 10 books
          they&apos;re likely to enjoy. Each pick includes a short explanation
          of why it&apos;s a good match.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          4. Community ratings
        </h2>
        <p className="text-sm text-slate-700">
          Every rating you add helps the whole community. BookMatch tracks
          which books are loved across all kids on the site and uses those
          &ldquo;proven hits&rdquo; as a signal when generating new
          recommendations. The more families who rate, the smarter the
          suggestions get for everyone.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          5. Groups &amp; co-ops
        </h2>
        <p className="text-sm text-slate-700">
          Create or join a group (like a homeschool co-op or book club). Group
          members who opt in can share their ratings, so you can see what other
          kids in your circle loved. Admins can create curated shared reading
          lists for the whole group.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          6. Library-first links
        </h2>
        <p className="text-sm text-slate-700">
          Every recommended book comes with links to find it for free at your
          library through Libby and Hoopla, plus Amazon links if you prefer to
          buy. Free options are always shown first.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Privacy &amp; safety
        </h2>
        <p className="text-sm text-slate-700">
          Kid profiles are private to your account &mdash; only you can see
          them. We never build advertising profiles on minors, never sell data,
          and never show ads. Book ratings shared in groups are opt-in and
          anonymous (other members see the book and the rating, not which child
          rated it).
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Plans
        </h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>
            <strong>Free</strong> &mdash; 1 kid profile, 5 AI recommendations
            per month, unlimited book ratings.
          </li>
          <li>
            <strong>Family</strong> &mdash; Up to 3 kid profiles, unlimited
            recommendations, Libby + Amazon links.
          </li>
          <li>
            <strong>Family Plus</strong> &mdash; Everything in Family, plus
            create and manage a co-op group (up to 5 families).
          </li>
        </ul>
        <Link
          href="/dashboard/billing"
          className="btn-secondary mt-2 inline-block w-full text-center"
        >
          View plans &amp; billing
        </Link>
      </section>
    </main>
  );
}
