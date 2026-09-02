// prisma/seed.ts creates a real admin account (admin@apex.co.za) with a
// fixed, publicly-known password (it's right there in this repo's own
// README). That's fine for local development — upsert makes reseeding
// harmless — but running it against a real environment plants a live
// credential. `exit` is injectable so this is testable without killing
// the test process.
export function assertSafeToSeed(
  env: NodeJS.ProcessEnv = process.env,
  exit: (code: number) => void = (code) => process.exit(code),
): void {
  const isProduction = env.NODE_ENV === 'production';
  const allowed = env.ALLOW_SEED_IN_PRODUCTION === 'true';

  if (isProduction && !allowed) {
    console.error(
      'Refusing to run prisma/seed.ts with NODE_ENV=production — it creates ' +
        'a real admin account (admin@apex.co.za) with a fixed, publicly-known ' +
        'password. If you genuinely intend to seed this environment, set ' +
        'ALLOW_SEED_IN_PRODUCTION=true and re-run.',
    );
    exit(1);
  }
}
