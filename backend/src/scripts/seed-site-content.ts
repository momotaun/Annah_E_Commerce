// CLI entry for seedSiteContent — run on every boot by the Dockerfile CMD
// (after `prisma migrate deploy`, before the app starts) and available
// manually as `npm run seed:site-content`. Compiled to
// dist/src/scripts/seed-site-content.js by the normal build, so it needs
// no ts-node in the production image.
//
// Intentionally not gated by assertSafeToSeed: it creates no accounts.

import { PrismaClient } from '@prisma/client';
import { seedSiteContent } from '../bootstrap/seed-site-content';

const prisma = new PrismaClient();

seedSiteContent(prisma)
  .then((result) => {
    console.log(
      result === 'created'
        ? 'Site content: created default site settings and hero slides.'
        : 'Site content: already present, nothing to do.',
    );
  })
  .catch((error) => {
    console.error('Site content seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
