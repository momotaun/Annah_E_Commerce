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

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: { name: 'Fashion', slug: 'fashion' },
  });

  console.log({ electronics, computing, fashion });

  const laptop = await prisma.product.upsert({
    where: { sku: 'APEX-PROBOOK-M3MAX' },
    update: {},
    create: {
      name: 'Apex ProBook M3 Max',
      slug: 'apex-probook-m3-max',
      sku: 'APEX-PROBOOK-M3MAX',
      description:
        'M3 Max Silicon with 16-core CPU, 40-core GPU, up to 22 hours of battery life.',
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
      slug: 'sonicmaster-elite-g2',
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

  const vendorPasswordHash = await bcrypt.hash('vendorPassword123', 12);
  const meridianUser = await prisma.user.upsert({
    where: { email: 'vendor@meridianapparel.co.za' },
    update: {},
    create: {
      email: 'vendor@meridianapparel.co.za',
      passwordHash: vendorPasswordHash,
      firstName: 'Naledi',
      lastName: 'Khumalo',
      role: 'VENDOR',
    },
  });

  const meridianBio =
    'Premium tailoring and timeless essentials, crafted for everyday elegance.';

  const meridian = await prisma.vendor.upsert({
    where: { userId: meridianUser.id },
    update: { bio: meridianBio },
    create: {
      userId: meridianUser.id,
      businessName: 'Meridian Apparel Co.',
      contactEmail: 'hello@meridianapparel.co.za',
      bio: meridianBio,
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  const clothingProducts = [
    {
      name: 'Apex Merino Wool Overcoat',
      sku: 'MERIDIAN-MERINO-OVERCOAT',
      slug: 'apex-merino-wool-overcoat',
      description:
        'Double-breasted overcoat in 100% merino wool, tailored for a modern silhouette.',
      price: 3499.0,
      imageUrl: '/images/merino-overcoat.jpg',
    },
    {
      name: 'Meridian Tailored Blazer',
      sku: 'MERIDIAN-TAILORED-BLAZER',
      slug: 'meridian-tailored-blazer',
      description:
        'Slim-fit blazer in Italian wool blend, fully lined with horn buttons.',
      price: 2299.0,
      imageUrl: '/images/tailored-blazer.jpg',
    },
    {
      name: 'TerraFlex Performance Chinos',
      sku: 'MERIDIAN-TERRAFLEX-CHINOS',
      slug: 'terraflex-performance-chinos',
      description:
        'Four-way stretch chinos with a water-resistant finish, built for all-day movement.',
      price: 899.0,
      imageUrl: '/images/performance-chinos.jpg',
    },
    {
      name: 'Apex Signature Oxford Shirt',
      sku: 'MERIDIAN-OXFORD-SHIRT',
      slug: 'apex-signature-oxford-shirt',
      description:
        'Brushed cotton oxford shirt with mother-of-pearl buttons and a tailored fit.',
      price: 749.0,
      imageUrl: '/images/oxford-shirt.jpg',
    },
    {
      name: 'Solstice Cashmere Sweater',
      sku: 'MERIDIAN-SOLSTICE-SWEATER',
      slug: 'solstice-cashmere-sweater',
      description: 'Crew-neck sweater in pure cashmere, ribbed cuffs and hem.',
      price: 1899.0,
      imageUrl: '/images/cashmere-sweater.jpg',
    },
  ];

  for (const item of clothingProducts) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: { imageUrl: item.imageUrl },
      create: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryId: fashion.id,
        vendorId: meridian.id,
      },
    });
  }

  console.log({ meridian, productCount: clothingProducts.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
