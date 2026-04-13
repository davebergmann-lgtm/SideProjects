import Link from 'next/link';
import { signup } from '../login/actions';
import { GoogleButton } from '@/components/GoogleButton';

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="pt-8">
      <Link href="/" className="btn-ghost -ml-3 px-3">
        ← Back
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">
        Free to start. Add up to 3 kids and rate books together.
      </p>

      <form action={signup} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="full_name">
            Your name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            className="input"
            placeholder="Alex Parent"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={6}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>
        {searchParams.error && (
          <p className="text-sm text-red-600">{searchParams.error}</p>
        )}
        <button type="submit" className="btn-primary w-full">
          Create account
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        or
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleButton label="Sign up with Google" />

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600">
          Sign in
        </Link>
      </p>
    </main>
  );
}
