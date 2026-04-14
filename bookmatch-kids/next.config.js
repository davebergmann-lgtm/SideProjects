const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'http', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
    ],
  },
};

// Only apply Sentry build-time instrumentation when we have real creds.
// This keeps CI builds (with placeholder env) clean and avoids the
// Sentry plugin noisily trying to upload source maps without a token.
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

module.exports =
  sentryOrg && sentryProject && sentryAuthToken
    ? withSentryConfig(nextConfig, {
        org: sentryOrg,
        project: sentryProject,
        authToken: sentryAuthToken,
        silent: true,
        widenClientFileUpload: true,
        disableLogger: true,
        automaticVercelMonitors: false,
      })
    : nextConfig;
