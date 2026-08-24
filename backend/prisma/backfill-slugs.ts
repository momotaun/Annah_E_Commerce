import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const products = await prisma.product.findMany({ where: { slug: null } });

  for (const product of products) {
    let baseSlug = slugify(product.name);
    let slug = baseSlug;
    let attempt = 0;

    // Handle collisions by appending a short suffix
    while (
      await prisma.product.findFirst({
        where: { slug, id: { not: product.id } },
      })
    ) {
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
    }

    await prisma.product.update({ where: { id: product.id }, data: { slug } });
    console.log(`Backfilled slug for "${product.name}": ${slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());