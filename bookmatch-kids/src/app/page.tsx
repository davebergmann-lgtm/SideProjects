import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/dashboard');

  return (
    <main className="flex flex-col items-center pt-10 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-3xl">
        📚
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        BookMatch <span className="text-brand-500">for Kids</span>
      </h1>
      <p className="mt-3 max-w-xs text-base text-slate-600">
        The next perfect book for your kid, without the work. Tell us what they love. We do the rest.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <Link href="/signup" className="btn-primary">
          Get started — it&apos;s free
        </Link>
        <Link href="/login" className="btn-secondary">
          I already have an account
        </Link>
      </div>
      <ul className="mt-10 w-full space-y-3 text-left">
        <Feature emoji="👧" text="Up to 3 kid profiles with their own taste" />
        <Feature emoji="🔍" text="Search any book and rate what they've read" />
        <Feature emoji="🏛️" text="Library-first — find free copies at Libby & Hoopla" />
      </ul>
    </main>
  );
}

function Feature({ emoji, text }: { emoji: string; text: string }) {
  return (
    <li className="card flex items-start gap-3">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm text-slate-700">{text}</span>
    </li>
  );
}
