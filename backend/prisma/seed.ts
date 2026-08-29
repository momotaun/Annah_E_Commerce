import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';

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

  const laptop = await prisma.product.upsert({
    where: { sku: 'APEX-PROBOOK-M3MAX' },
    update: {},
    create: {
      name: 'Apex ProBook M3 Max',
      sku: 'APEX-PROBOOK-M3MAX',
      description: 'M3 Max Silicon with 16-core CPU, 40-core GPU, up to 22 hours of battery life.',
      price: 45999.0,
      imageUrl: '/images/probook.jpg',
      categoryId: computing.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'SONICMASTER-ELITE-G2' },
    update: {},
    create: {
      name: 'SonicMaster Elite G2',
      sku: 'SONICMASTER-ELITE-G2',
      description: 'Active Noise Cancellation, 40h battery life.',
      price: 349.0,
      imageUrl: '/images/headphones.jpg',
      categoryId: computing.id,
    },
  });

  console.log({ electronics, computing, laptop });

  const adminPasswordHash = await bcrypt.hash('adminPassword123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@apex.co.za' },
    update: {},
    create: {
      email: 'admin@apex.co.za',
      passwordHash: adminPasswordHash,
      firstName: 'Apex',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
