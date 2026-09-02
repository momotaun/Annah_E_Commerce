const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// Only dangerous to leave unset in production. Locally, everywhere that
// reads it (the CORS allow-origin, password-reset email links) falls back
// to http://localhost:3000 — exactly right for local dev, so this stays
// optional outside production. In production that same fallback means
// the API silently rejects every real cross-origin request from the
// actual frontend, and any reset email links to a URL nobody can reach —
// with no error at boot to point at why.
const PRODUCTION_REQUIRED_ENV_VARS = ['FRONTEND_URL'];

// Fails fast and loud at boot when required config is missing, rather
// than starting up and serving traffic with a broken database connection
// or auth that silently can't sign tokens. `exit` is injectable so this
// is testable without killing the test process.
export function assertRequiredEnvVars(
  env: NodeJS.ProcessEnv = process.env,
  exit: (code: number) => void = (code) => process.exit(code),
): void {
  const required =
    env.NODE_ENV === 'production'
      ? [...REQUIRED_ENV_VARS, ...PRODUCTION_REQUIRED_ENV_VARS]
      : REQUIRED_ENV_VARS;
  const missing = required.filter((name) => !env[name]);
  if (missing.length > 0) {
    // Runs before Nest's Logger exists, so plain console output.
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}. See backend/.env.example.`,
    );
    exit(1);
  }
}
