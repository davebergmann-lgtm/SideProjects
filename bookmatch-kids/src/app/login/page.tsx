import Link from 'next/link';
import { login } from './actions';
import { GoogleButton } from '@/components/GoogleButton';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="pt-8">
      <Link href="/" className="btn-ghost -ml-3 px-3">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in to see your kids&apos; reading lists.</p>

      <form action={login} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            className="input"
            placeholder="••••••••"
          />
        </div>
        {searchParams.error && (
          <p className="text-sm text-red-600">{searchParams.error}</p>
        )}
        <button type="submit" className="btn-primary w-full">
          Sign in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        or
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton label="Sign in with Google" />

      <p className="mt-8 text-center text-sm text-slate-600">
        New here?{' '}
        <Link href="/signup" className="font-semibold text-brand-600">
          Create an account
        </Link>
      </p>
    </main>
  );
}
