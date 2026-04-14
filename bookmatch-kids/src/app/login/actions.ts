'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const supabase = createClient();

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------
export async function requestPasswordReset(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    redirect('/forgot-password?error=Email+is+required');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Always redirect to the same success screen regardless of whether the
  // email exists — avoids leaking which emails are registered.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  redirect('/forgot-password?sent=1');
}

export async function updatePassword(formData: FormData) {
  const supabase = createClient();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 6) {
    redirect('/reset-password?error=Password+must+be+at+least+6+characters');
  }
  if (password !== confirm) {
    redirect('/reset-password?error=Passwords+don%27t+match');
  }

  // The user must already have a session (set by /auth/callback after
  // they clicked the reset link). supabase.auth.updateUser() will fail
  // if they don't — which is the right behavior.
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
