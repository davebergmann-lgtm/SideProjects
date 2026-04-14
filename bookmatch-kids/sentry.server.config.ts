import * as Sentry from '@sentry/nextjs';

// Server-side Sentry init. Runs in Node runtime. No-op if SENTRY_DSN
// is unset so local dev and CI builds don't need a DSN.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    // Don't send noisy request bodies or cookies.
    sendDefaultPii: false,
  });
}
