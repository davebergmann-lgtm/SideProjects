import Link from 'next/link';
import { requestPasswordReset } from '../login/actions';

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; sent?: string };
}) {
  const sent = searchParams.sent === '1';

  return (
    <main className="pt-8">
      <Link href="/login" className="btn-ghost -ml-3 px-3">
        ← Back to sign in
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Forgot password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter the email on your account and we&apos;ll send you a reset link.
      </p>

      {sent ? (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold">Check your inbox.</p>
          <p className="mt-1">
            If an account exists with that email, you&apos;ll get a reset link
            in a minute. Don&apos;t forget to check spam.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block font-semibold text-green-900 underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form action={requestPasswordReset} className="mt-6 space-y-4">
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
          {searchParams.error && (
            <p className="text-sm text-red-600">{searchParams.error}</p>
          )}
          <button type="submit" className="btn-primary w-full">
            Send reset link
          </button>
        </form>
      )}
    </main>
  );
}
