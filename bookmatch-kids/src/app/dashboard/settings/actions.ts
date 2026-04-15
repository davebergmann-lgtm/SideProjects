'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';

/**
 * Permanently delete the current user's account.
 *
 * Order of operations matters:
 *  1. Cancel any active Stripe subscriptions so the user doesn't keep
 *     getting billed after their data is gone.
 *  2. Delete the auth.users row via the service-role admin client.
 *     Postgres cascades the delete down through profiles → children →
 *     book_entries → reading_lists → group_members. group_lists.created_by
 *     and groups.created_by are set null (preserving co-op content with
 *     attribution removed, which is the right call for a shared resource).
 *  3. Sign the local session out.
 *  4. Redirect to the landing page with a confirmation flag.
 *
 * Requires a typed confirmation ("DELETE") so this can't fire from a
 * stray click.
 */
export async function deleteAccount(formData: FormData) {
  const confirmation = String(formData.get('confirm') ?? '').trim();
  if (confirmation !== 'DELETE') {
    redirect(
      '/dashboard/settings?error=' +
        encodeURIComponent('Type DELETE to confirm.')
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Look up the Stripe customer (if any) before we wipe the profile.
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  // Cancel any active subscriptions so the user isn't billed after delete.
  // Failure here is non-fatal — we still want the deletion to proceed —
  // but we log it so a human can clean up if needed.
  if (profile?.stripe_customer_id) {
    try {
      const stripe = getStripe();
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 100,
      });
      for (const sub of subs.data) {
        if (sub.status !== 'canceled' && sub.status !== 'incomplete_expired') {
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    } catch (err) {
      console.error('[deleteAccount] stripe cancel failed', user.id, err);
    }
  }

  // Delete the auth user — cascades through everything in public.*
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    redirect(
      '/dashboard/settings?error=' +
        encodeURIComponent(`Could not delete account: ${error.message}`)
    );
  }

  // Sign out the local session and bounce to the landing page.
  await supabase.auth.signOut();
  redirect('/?deleted=1');
}
