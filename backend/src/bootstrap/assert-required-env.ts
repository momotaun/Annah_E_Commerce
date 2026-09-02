const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// Fails fast and loud at boot when required config is missing, rather
// than starting up and serving traffic with a broken database connection
// or auth that silently can't sign tokens. `exit` is injectable so this
// is testable without killing the test process.
export function assertRequiredEnvVars(
  env: NodeJS.ProcessEnv = process.env,
  exit: (code: number) => void = (code) => process.exit(code),
): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name]);
  if (missing.length > 0) {
    // Runs before Nest's Logger exists, so plain console output.
    console.error(
      `Missing required environment variable(s): ${missing.join(', ')}. See backend/.env.example.`,
    );
    exit(1);
  }
}
