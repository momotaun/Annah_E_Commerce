import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' },
  });

  const computing = await prisma.category.upsert({
    where: { slug: 'computing' },
    update: {},
    create: { name: 'Computing', slug: 'computing', parentId: electronics.id },
  });

  await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: { name: 'Audio', slug: 'audio', parentId: electronics.id },
  });

  await prisma.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: { name: 'Home & Living', slug: 'home-living' },
  });

  console.log({ electronics, computing });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
