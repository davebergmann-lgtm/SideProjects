import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updatePassword } from '../login/actions';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // The user lands here after clicking the reset email link, which hits
  // /auth/callback first and exchanges the recovery code for a session.
  // If they don't have a session by now, the link is stale or invalid.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      '/forgot-password?error=' +
        encodeURIComponent('Reset link expired. Request a new one.')
    );
  }

  return (
    <main className="pt-8">
      <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Pick something you&apos;ll remember. At least 6 characters.
      </p>

      <form action={updatePassword} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="input"
          />
        </div>
        {searchParams.error && (
          <p className="text-sm text-red-600">{searchParams.error}</p>
        )}
        <button type="submit" className="btn-primary w-full">
          Update password
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        <Link href="/login" className="hover:text-slate-700">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
