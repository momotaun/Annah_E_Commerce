// Sentry's own guidance: this must be the very first thing the process
// imports (see main.ts), before any other module — including Nest/Express —
// is loaded, so its instrumentation can hook in cleanly.
import 'dotenv/config';
import * as Sentry from '@sentry/node';

// With no SENTRY_DSN, Sentry.init() is a documented no-op: the SDK loads
// but never sends anything (see @sentry/core's client.js: "No DSN
// provided, client will not send events."). So this is always safe to
// call, whether or not a real Sentry project is configured.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
});
