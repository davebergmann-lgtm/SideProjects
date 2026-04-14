'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Minimal client-side Sentry bootstrap. Runs once on mount. No-op when
 * NEXT_PUBLIC_SENTRY_DSN is not set — so local dev and CI builds don't
 * need any Sentry config.
 *
 * This avoids depending on withSentryConfig's webpack plugin, which
 * requires SENTRY_ORG/PROJECT/AUTH_TOKEN at build time.
 */
export function SentryInit() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
    const hub = Sentry.getClient();
    if (hub) return; // already initialized
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment:
        process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: Number(
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'
      ),
      sendDefaultPii: false,
    });
  }, []);
  return null;
}
