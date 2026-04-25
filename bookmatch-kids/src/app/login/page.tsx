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
        &larr; Back
      </Link>

      <div className="mt-4 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-2xl">
          📚
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          BookMatch <span className="text-brand-500">for Kids</span>
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Your kid&apos;s next favorite book, found in seconds.
        </p>
      </div>

      <p className="mt-4 text-sm text-slate-600">Sign in to see your kids&apos; reading lists.</p>

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
        <p className="text-center text-xs text-slate-500">
          <Link href="/forgot-password" className="hover:text-slate-700">
            Forgot your password?
          </Link>
        </p>
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
