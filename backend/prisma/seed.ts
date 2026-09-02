import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import { assertSafeToSeed } from '../src/bootstrap/assert-safe-to-seed';

assertSafeToSeed();

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

  const audio = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: { name: 'Audio', slug: 'audio', parentId: electronics.id },
  });

  const homeLiving = await prisma.category.upsert({
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
    {
      name: 'Meridian Silk Tie',
      sku: 'MERIDIAN-SILK-TIE',
      slug: 'meridian-silk-tie',
      description: 'Navy silk necktie with a fine textured weave.',
      price: 599.0,
      imageUrl: '/images/meridian-silk-tie.jpg',
    },
    {
      name: 'Apex Leather Belt',
      sku: 'APEX-LEATHER-BELT',
      slug: 'apex-leather-belt',
      description: 'Full-grain leather belt with a brushed silver buckle.',
      price: 749.0,
      imageUrl: '/images/apex-leather-belt.jpg',
    },
    {
      name: 'Meridian Denim Jacket',
      sku: 'MERIDIAN-DENIM-JACKET',
      slug: 'meridian-denim-jacket',
      description: 'Classic indigo denim jacket with a tailored, modern cut.',
      price: 1499.0,
      imageUrl: '/images/meridian-denim-jacket.jpg',
    },
    {
      name: 'Solstice Wool Scarf',
      sku: 'SOLSTICE-WOOL-SCARF',
      slug: 'solstice-wool-scarf',
      description:
        'Soft charcoal wool scarf, generously sized for cold mornings.',
      price: 549.0,
      imageUrl: '/images/solstice-wool-scarf.jpg',
    },
    {
      name: 'Apex Chelsea Boots',
      sku: 'APEX-CHELSEA-BOOTS',
      slug: 'apex-chelsea-boots',
      description:
        'Polished black leather Chelsea boots with elastic side panels.',
      price: 2199.0,
      imageUrl: '/images/apex-chelsea-boots.jpg',
    },
    {
      name: 'Meridian Linen Shirt',
      sku: 'MERIDIAN-LINEN-SHIRT',
      slug: 'meridian-linen-shirt',
      description: 'Breathable beige linen shirt, relaxed tailored fit.',
      price: 849.0,
      imageUrl: '/images/meridian-linen-shirt.jpg',
    },
    {
      name: 'Apex Wool Trousers',
      sku: 'APEX-WOOL-TROUSERS',
      slug: 'apex-wool-trousers',
      description: 'Charcoal tailored wool trousers with a flat-front finish.',
      price: 1299.0,
      imageUrl: '/images/apex-wool-trousers.jpg',
    },
    {
      name: 'Solstice Merino Polo',
      sku: 'SOLSTICE-MERINO-POLO',
      slug: 'solstice-merino-polo',
      description:
        'Navy merino wool polo shirt, soft and breathable year-round.',
      price: 899.0,
      imageUrl: '/images/solstice-merino-polo.jpg',
    },
    {
      name: 'Meridian Leather Gloves',
      sku: 'MERIDIAN-LEATHER-GLOVES',
      slug: 'meridian-leather-gloves',
      description: 'Supple brown leather gloves with a soft knit lining.',
      price: 649.0,
      imageUrl: '/images/meridian-leather-gloves.jpg',
    },
    {
      name: 'Apex Silk Pocket Square',
      sku: 'APEX-SILK-POCKET-SQUARE',
      slug: 'apex-silk-pocket-square',
      description: 'Patterned silk pocket square, finished by hand.',
      price: 349.0,
      imageUrl: '/images/apex-silk-pocket-square.jpg',
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

  // electronics (15 items)
  const electronicsProducts = [
    {
      name: 'Apex Chrono Smartwatch',
      sku: 'APEX-CHRONO-SMARTWATCH',
      slug: 'apex-chrono-smartwatch',
      description:
        'Titanium case smartwatch with a black sport band, always-on display, and week-long battery life.',
      price: 5499.0,
      imageUrl: '/images/apex-chrono-smartwatch.jpg',
    },
    {
      name: 'SkyDrift Pro Drone',
      sku: 'SKYDRIFT-PRO-DRONE',
      slug: 'skydrift-pro-drone',
      description:
        'Compact folding drone with 4K stabilized camera and 35-minute flight time.',
      price: 12999.0,
      imageUrl: '/images/skydrift-pro-drone.jpg',
    },
    {
      name: 'Lumina Mirrorless Camera',
      sku: 'LUMINA-MIRRORLESS-CAMERA',
      slug: 'lumina-mirrorless-camera',
      description:
        'Full-frame mirrorless camera with a fast zoom lens, built for low-light precision.',
      price: 24999.0,
      imageUrl: '/images/lumina-mirrorless-camera.jpg',
    },
    {
      name: 'NovaPlay Handheld Console',
      sku: 'NOVAPLAY-HANDHELD-CONSOLE',
      slug: 'novaplay-handheld-console',
      description:
        'Portable gaming console with a 7-inch HDR display and 128GB storage.',
      price: 6999.0,
      imageUrl: '/images/novaplay-handheld-console.jpg',
    },
    {
      name: 'Hearth Smart Home Hub',
      sku: 'HEARTH-SMART-HOME-HUB',
      slug: 'hearth-smart-home-hub',
      description:
        'Voice-controlled smart home hub that connects lighting, security, and climate in one app.',
      price: 1899.0,
      imageUrl: '/images/hearth-smart-home-hub.jpg',
    },
    {
      name: 'Aegis Power Bank 20K',
      sku: 'AEGIS-POWER-BANK-20K',
      slug: 'aegis-power-bank-20k',
      description: '20,000mAh fast-charging power bank with dual USB-C output.',
      price: 899.0,
      imageUrl: '/images/aegis-power-bank-20k.jpg',
    },
    {
      name: 'Vantage VR Headset',
      sku: 'VANTAGE-VR-HEADSET',
      slug: 'vantage-vr-headset',
      description:
        'Standalone VR headset with 4K-per-eye resolution and hand tracking.',
      price: 8999.0,
      imageUrl: '/images/vantage-vr-headset.jpg',
    },
    {
      name: 'Orbit Robot Vacuum',
      sku: 'ORBIT-ROBOT-VACUUM',
      slug: 'orbit-robot-vacuum',
      description:
        'Self-emptying robot vacuum with laser mapping and app-controlled zones.',
      price: 7499.0,
      imageUrl: '/images/orbit-robot-vacuum.jpg',
    },
    {
      name: 'Solace E-Reader',
      sku: 'SOLACE-E-READER',
      slug: 'solace-e-reader',
      description:
        'Glare-free e-ink reader with adjustable warm light and weeks of battery life.',
      price: 2499.0,
      imageUrl: '/images/solace-e-reader.jpg',
    },
    {
      name: 'Apex Tablet Air',
      sku: 'APEX-TABLET-AIR',
      slug: 'apex-tablet-air',
      description:
        'Slim aluminium tablet with a 11-inch Liquid Retina-class display.',
      price: 9999.0,
      imageUrl: '/images/apex-tablet-air.jpg',
    },
    {
      name: 'Beam Mini Projector',
      sku: 'BEAM-MINI-PROJECTOR',
      slug: 'beam-mini-projector',
      description:
        'Pocket-sized 1080p projector with built-in battery and auto keystone correction.',
      price: 4499.0,
      imageUrl: '/images/beam-mini-projector.jpg',
    },
    {
      name: 'PulseFit Tracker Band',
      sku: 'PULSEFIT-TRACKER-BAND',
      slug: 'pulsefit-tracker-band',
      description:
        'Lightweight fitness band with heart-rate, sleep, and SpO2 tracking.',
      price: 1299.0,
      imageUrl: '/images/pulsefit-tracker-band.jpg',
    },
    {
      name: 'Guardian Smart Doorbell',
      sku: 'GUARDIAN-SMART-DOORBELL',
      slug: 'guardian-smart-doorbell',
      description:
        'HD video doorbell with two-way audio and motion-triggered alerts.',
      price: 2199.0,
      imageUrl: '/images/guardian-smart-doorbell.jpg',
    },
    {
      name: 'Zephyr Action Camera',
      sku: 'ZEPHYR-ACTION-CAMERA',
      slug: 'zephyr-action-camera',
      description: 'Waterproof 4K action camera with in-body stabilization.',
      price: 3999.0,
      imageUrl: '/images/zephyr-action-camera.jpg',
    },
    {
      name: 'Halo Wireless Charging Pad',
      sku: 'HALO-WIRELESS-CHARGING-PAD',
      slug: 'halo-wireless-charging-pad',
      description:
        'Minimalist 15W wireless charging pad for phones and earbuds.',
      price: 599.0,
      imageUrl: '/images/halo-wireless-charging-pad.jpg',
    },
  ];

  // audio (15 items)
  const audioProducts = [
    {
      name: 'Aero-Pulse Earbuds',
      sku: 'AERO-PULSE-EARBUDS',
      slug: 'aero-pulse-earbuds',
      description:
        'True wireless earbuds with active noise cancellation and a compact charging case.',
      price: 2299.0,
      imageUrl: '/images/aero-pulse-earbuds.jpg',
    },
    {
      name: 'Resonate Soundbar 500',
      sku: 'RESONATE-SOUNDBAR-500',
      slug: 'resonate-soundbar-500',
      description: 'Slim soundbar with virtual surround sound and HDMI ARC.',
      price: 3499.0,
      imageUrl: '/images/resonate-soundbar-500.jpg',
    },
    {
      name: 'Bass Orbit Subwoofer',
      sku: 'BASS-ORBIT-SUBWOOFER',
      slug: 'bass-orbit-subwoofer',
      description:
        'Compact wireless subwoofer that pairs with any Bluetooth speaker system.',
      price: 2799.0,
      imageUrl: '/images/bass-orbit-subwoofer.jpg',
    },
    {
      name: 'Cadence Portable Speaker',
      sku: 'CADENCE-PORTABLE-SPEAKER',
      slug: 'cadence-portable-speaker',
      description: 'Waterproof cylindrical speaker with 24-hour battery life.',
      price: 1499.0,
      imageUrl: '/images/cadence-portable-speaker.jpg',
    },
    {
      name: 'StudioTone Monitor Speakers',
      sku: 'STUDIOTONE-MONITOR-SPEAKERS',
      slug: 'studiotone-monitor-speakers',
      description: 'Active studio monitor pair for accurate near-field mixing.',
      price: 4999.0,
      imageUrl: '/images/studiotone-monitor-speakers.jpg',
    },
    {
      name: 'Whisper ANC Sleep Earbuds',
      sku: 'WHISPER-ANC-SLEEP-EARBUDS',
      slug: 'whisper-anc-sleep-earbuds',
      description:
        'Ultra-small noise-masking earbuds designed for comfortable overnight wear.',
      price: 1799.0,
      imageUrl: '/images/whisper-anc-sleep-earbuds.jpg',
    },
    {
      name: 'Vinyl Revival Turntable',
      sku: 'VINYL-REVIVAL-TURNTABLE',
      slug: 'vinyl-revival-turntable',
      description:
        'Belt-drive turntable with built-in preamp and Bluetooth output.',
      price: 5999.0,
      imageUrl: '/images/vinyl-revival-turntable.jpg',
    },
    {
      name: 'Drift Wireless Earbuds Mini',
      sku: 'DRIFT-WIRELESS-EARBUDS-MINI',
      slug: 'drift-wireless-earbuds-mini',
      description:
        'Compact everyday earbuds with a pocket-sized charging case.',
      price: 999.0,
      imageUrl: '/images/drift-wireless-earbuds-mini.jpg',
    },
    {
      name: 'Apex Home Theater 5.1',
      sku: 'APEX-HOME-THEATER-5-1',
      slug: 'apex-home-theater-5-1',
      description:
        '5.1 channel home theater system with wireless rear speakers.',
      price: 8999.0,
      imageUrl: '/images/apex-home-theater-5-1.jpg',
    },
    {
      name: 'RoadTrip Car Speaker',
      sku: 'ROADTRIP-CAR-SPEAKER',
      slug: 'roadtrip-car-speaker',
      description:
        'Rugged strap-handle speaker built for travel and outdoor use.',
      price: 1299.0,
      imageUrl: '/images/roadtrip-car-speaker.jpg',
    },
    {
      name: 'Podcast Pro USB Microphone',
      sku: 'PODCAST-PRO-USB-MICROPHONE',
      slug: 'podcast-pro-usb-microphone',
      description:
        'Studio-grade USB condenser microphone with a desktop stand.',
      price: 1599.0,
      imageUrl: '/images/podcast-pro-usb-microphone.jpg',
    },
    {
      name: 'Clarity Hearing Amplifier',
      sku: 'CLARITY-HEARING-AMPLIFIER',
      slug: 'clarity-hearing-amplifier',
      description: 'Discreet in-ear sound amplifier for everyday clarity.',
      price: 3299.0,
      imageUrl: '/images/clarity-hearing-amplifier.jpg',
    },
    {
      name: 'Nightfall Bone Conduction Headphones',
      sku: 'NIGHTFALL-BONE-CONDUCTION-HEADPHONES',
      slug: 'nightfall-bone-conduction-headphones',
      description: 'Open-ear sport headphones that leave your ear canal free.',
      price: 2499.0,
      imageUrl: '/images/nightfall-bone-conduction-headphones.jpg',
    },
    {
      name: 'Echo Smart Speaker',
      sku: 'ECHO-SMART-SPEAKER',
      slug: 'echo-smart-speaker',
      description: 'Fabric-covered smart speaker with rich 360-degree sound.',
      price: 1699.0,
      imageUrl: '/images/echo-smart-speaker.jpg',
    },
    {
      name: 'Apex Elite Wireless Headphones',
      sku: 'APEX-ELITE-WIRELESS-HEADPHONES',
      slug: 'apex-elite-wireless-headphones',
      description:
        'Over-ear wireless headphones with adaptive noise cancellation and 40-hour battery life.',
      price: 3799.0,
      imageUrl: '/images/apex-elite-wireless-headphones.jpg',
    },
  ];

  // computing (13 items)
  const computingProducts = [
    {
      name: 'Vertex Ultrawide Monitor',
      sku: 'VERTEX-ULTRAWIDE-MONITOR',
      slug: 'vertex-ultrawide-monitor',
      description:
        'Curved 34-inch ultrawide monitor for immersive multitasking.',
      price: 11999.0,
      imageUrl: '/images/vertex-ultrawide-monitor.jpg',
    },
    {
      name: 'Precision Mechanical Keyboard',
      sku: 'PRECISION-MECHANICAL-KEYBOARD',
      slug: 'precision-mechanical-keyboard',
      description:
        'Compact mechanical keyboard with hot-swappable switches and subtle backlighting.',
      price: 1899.0,
      imageUrl: '/images/precision-mechanical-keyboard.jpg',
    },
    {
      name: 'Glide Wireless Mouse',
      sku: 'GLIDE-WIRELESS-MOUSE',
      slug: 'glide-wireless-mouse',
      description:
        'Ergonomic wireless mouse with silent clicks and a 2-year battery life.',
      price: 799.0,
      imageUrl: '/images/glide-wireless-mouse.jpg',
    },
    {
      name: 'Apex Mini Desktop Tower',
      sku: 'APEX-MINI-DESKTOP-TOWER',
      slug: 'apex-mini-desktop-tower',
      description:
        'Compact desktop tower with a full-size CPU and dedicated graphics.',
      price: 18999.0,
      imageUrl: '/images/apex-mini-desktop-tower.jpg',
    },
    {
      name: 'Voyager External SSD',
      sku: 'VOYAGER-EXTERNAL-SSD',
      slug: 'voyager-external-ssd',
      description:
        'Rugged 1TB portable SSD with USB-C transfer speeds up to 1050MB/s.',
      price: 2299.0,
      imageUrl: '/images/voyager-external-ssd.jpg',
    },
    {
      name: 'Focal Webcam 4K',
      sku: 'FOCAL-WEBCAM-4K',
      slug: 'focal-webcam-4k',
      description:
        '4K webcam with auto-framing and a built-in privacy shutter.',
      price: 1499.0,
      imageUrl: '/images/focal-webcam-4k.jpg',
    },
    {
      name: 'Cascade Laptop Stand',
      sku: 'CASCADE-LAPTOP-STAND',
      slug: 'cascade-laptop-stand',
      description:
        'Adjustable aluminium laptop stand for better posture and airflow.',
      price: 699.0,
      imageUrl: '/images/cascade-laptop-stand.jpg',
    },
    {
      name: 'Nexus USB-C Dock',
      sku: 'NEXUS-USB-C-DOCK',
      slug: 'nexus-usb-c-dock',
      description:
        '8-in-1 USB-C docking station with HDMI, Ethernet, and fast charging passthrough.',
      price: 1599.0,
      imageUrl: '/images/nexus-usb-c-dock.jpg',
    },
    {
      name: 'Ember Gaming Chair',
      sku: 'EMBER-GAMING-CHAIR',
      slug: 'ember-gaming-chair',
      description: 'Ergonomic gaming chair with 4D armrests and full recline.',
      price: 5499.0,
      imageUrl: '/images/ember-gaming-chair.jpg',
    },
    {
      name: 'Apex Graphics Tablet',
      sku: 'APEX-GRAPHICS-TABLET',
      slug: 'apex-graphics-tablet',
      description:
        'Pressure-sensitive drawing tablet with a battery-free stylus.',
      price: 3299.0,
      imageUrl: '/images/apex-graphics-tablet.jpg',
    },
    {
      name: 'Signal Mesh Router',
      sku: 'SIGNAL-MESH-ROUTER',
      slug: 'signal-mesh-router',
      description:
        'Whole-home mesh wifi system covering up to 500 square metres.',
      price: 2999.0,
      imageUrl: '/images/signal-mesh-router.jpg',
    },
    {
      name: 'Sentinel External Backup Drive',
      sku: 'SENTINEL-EXTERNAL-BACKUP-DRIVE',
      slug: 'sentinel-external-backup-drive',
      description: '4TB desktop backup drive with automatic scheduled backups.',
      price: 1899.0,
      imageUrl: '/images/sentinel-external-backup-drive.jpg',
    },
    {
      name: 'Aurora Desk Monitor Light',
      sku: 'AURORA-DESK-MONITOR-LIGHT',
      slug: 'aurora-desk-monitor-light',
      description:
        'Clip-on monitor light bar with adjustable warmth and auto-dimming.',
      price: 899.0,
      imageUrl: '/images/aurora-desk-monitor-light.jpg',
    },
  ];

  // home-living (15 items)
  const homeLivingProducts = [
    {
      name: 'Hearth Ceramic Vase Set',
      sku: 'HEARTH-CERAMIC-VASE-SET',
      slug: 'hearth-ceramic-vase-set',
      description: 'Set of three matte beige ceramic vases in varying heights.',
      price: 899.0,
      imageUrl: '/images/hearth-ceramic-vase-set.jpg',
    },
    {
      name: 'Meridian Linen Bedding Set',
      sku: 'MERIDIAN-LINEN-BEDDING-SET',
      slug: 'meridian-linen-bedding-set',
      description: 'Stonewashed linen duvet cover and pillowcase set.',
      price: 1899.0,
      imageUrl: '/images/meridian-linen-bedding-set.jpg',
    },
    {
      name: 'Solace Scented Candle Trio',
      sku: 'SOLACE-SCENTED-CANDLE-TRIO',
      slug: 'solace-scented-candle-trio',
      description: 'Three hand-poured soy candles in signature Apex scents.',
      price: 649.0,
      imageUrl: '/images/solace-scented-candle-trio.jpg',
    },
    {
      name: 'Apex Wool Throw Blanket',
      sku: 'APEX-WOOL-THROW-BLANKET',
      slug: 'apex-wool-throw-blanket',
      description:
        'Cream wool throw blanket, soft knit texture for cooler evenings.',
      price: 999.0,
      imageUrl: '/images/apex-wool-throw-blanket.jpg',
    },
    {
      name: 'Nordic Oak Coffee Table',
      sku: 'NORDIC-OAK-COFFEE-TABLE',
      slug: 'nordic-oak-coffee-table',
      description: 'Minimalist round coffee table in solid light oak.',
      price: 4499.0,
      imageUrl: '/images/nordic-oak-coffee-table.jpg',
    },
    {
      name: 'Haven Velvet Cushion Set',
      sku: 'HAVEN-VELVET-CUSHION-SET',
      slug: 'haven-velvet-cushion-set',
      description: 'Set of two sage green velvet cushions with hidden zips.',
      price: 799.0,
      imageUrl: '/images/haven-velvet-cushion-set.jpg',
    },
    {
      name: 'Lumen Table Lamp',
      sku: 'LUMEN-TABLE-LAMP',
      slug: 'lumen-table-lamp',
      description: 'Ceramic table lamp with a natural linen shade.',
      price: 1299.0,
      imageUrl: '/images/lumen-table-lamp.jpg',
    },
    {
      name: 'Terra Indoor Plant Pot',
      sku: 'TERRA-INDOOR-PLANT-POT',
      slug: 'terra-indoor-plant-pot',
      description: 'Terracotta plant pot with a drainage saucer, mid-size.',
      price: 449.0,
      imageUrl: '/images/terra-indoor-plant-pot.jpg',
    },
    {
      name: 'Serene Bath Towel Set',
      sku: 'SERENE-BATH-TOWEL-SET',
      slug: 'serene-bath-towel-set',
      description: 'Set of four combed-cotton bath towels, quick-dry weave.',
      price: 899.0,
      imageUrl: '/images/serene-bath-towel-set.jpg',
    },
    {
      name: 'Apex Cast Iron Cookware Set',
      sku: 'APEX-CAST-IRON-COOKWARE-SET',
      slug: 'apex-cast-iron-cookware-set',
      description:
        'Pre-seasoned cast iron pot and pan set for stovetop and oven.',
      price: 2999.0,
      imageUrl: '/images/apex-cast-iron-cookware-set.jpg',
    },
    {
      name: 'Hearth Dinnerware Set',
      sku: 'HEARTH-DINNERWARE-SET',
      slug: 'hearth-dinnerware-set',
      description: '16-piece matte stoneware dinnerware set for four.',
      price: 1599.0,
      imageUrl: '/images/hearth-dinnerware-set.jpg',
    },
    {
      name: 'Nordic Glass Carafe',
      sku: 'NORDIC-GLASS-CARAFE',
      slug: 'nordic-glass-carafe',
      description: 'Hand-blown glass water carafe with a beechwood lid.',
      price: 449.0,
      imageUrl: '/images/nordic-glass-carafe.jpg',
    },
    {
      name: 'Meridian Rattan Storage Basket',
      sku: 'MERIDIAN-RATTAN-STORAGE-BASKET',
      slug: 'meridian-rattan-storage-basket',
      description: 'Hand-woven rattan storage basket for blankets or toys.',
      price: 699.0,
      imageUrl: '/images/meridian-rattan-storage-basket.jpg',
    },
    {
      name: 'Solace Diffuser & Essential Oil Set',
      sku: 'SOLACE-DIFFUSER-ESSENTIAL-OIL-SET',
      slug: 'solace-diffuser-essential-oil-set',
      description:
        'Ceramic aroma diffuser with two signature essential oil blends.',
      price: 999.0,
      imageUrl: '/images/solace-diffuser-essential-oil-set.jpg',
    },
    {
      name: 'Haven Bamboo Cutting Board Set',
      sku: 'HAVEN-BAMBOO-CUTTING-BOARD-SET',
      slug: 'haven-bamboo-cutting-board-set',
      description: 'Set of three graduated bamboo cutting boards.',
      price: 549.0,
      imageUrl: '/images/haven-bamboo-cutting-board-set.jpg',
    },
  ];

  const unbrandedGroups: Array<{
    categoryId: string;
    items: typeof electronicsProducts;
  }> = [
    { categoryId: electronics.id, items: electronicsProducts },
    { categoryId: audio.id, items: audioProducts },
    { categoryId: computing.id, items: computingProducts },
    { categoryId: homeLiving.id, items: homeLivingProducts },
  ];

  for (const group of unbrandedGroups) {
    for (const item of group.items) {
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
          categoryId: group.categoryId,
        },
      });
    }
  }

  console.log({
    electronics: electronicsProducts.length,
    audio: audioProducts.length,
    computing: computingProducts.length,
    homeLiving: homeLivingProducts.length,
  });

  console.log({ meridian, productCount: clothingProducts.length });

  await prisma.legalPage.upsert({
    where: { slug: 'privacy' },
    update: {},
    create: {
      slug: 'privacy',
      title: 'Privacy Policy',
      sections: [
        {
          title: 'Information We Collect',
          body: 'We collect the information you provide directly to us, such as your name, email address, shipping address, and payment details when you create an account, place an order, or contact our support team. We also collect limited technical information — like device type and browser — to keep the marketplace secure and reliable.',
        },
        {
          title: 'How We Use Your Information',
          body: 'Your information is used to process orders, communicate with you about purchases, personalize your shopping experience, and improve our platform. We do not sell your personal information to third parties.',
        },
        {
          title: 'Sharing Your Information',
          body: 'We share order details with the vendors fulfilling your purchase and with payment and delivery partners strictly as needed to complete a transaction. We require every partner to handle your data responsibly.',
        },
        {
          title: 'Your Choices',
          body: 'You can review and update your account details at any time from your profile, and you may request deletion of your account by contacting our support team.',
        },
        {
          title: 'Contact Us',
          body: 'If you have questions about this policy, reach out via our Contact page and our team will respond as soon as possible.',
        },
      ],
    },
  });

  await prisma.legalPage.upsert({
    where: { slug: 'terms' },
    update: {},
    create: {
      slug: 'terms',
      title: 'Terms of Service',
      sections: [
        {
          title: 'Acceptance of Terms',
          body: 'By creating an account or placing an order on Apex Marketplace, you agree to be bound by these Terms of Service and our Privacy Policy.',
        },
        {
          title: 'Accounts',
          body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately of any unauthorized use.',
        },
        {
          title: 'Orders & Payment',
          body: 'All prices are listed in South African Rand and are subject to change without notice. Orders are confirmed once payment has been successfully processed. We reserve the right to refuse or cancel any order at our discretion.',
        },
        {
          title: 'Vendors',
          body: 'Products sold through Apex Marketplace may be listed by independent vendors. While we vet every vendor onboarded to the platform, each vendor is responsible for the accuracy of their own listings.',
        },
        {
          title: 'Limitation of Liability',
          body: 'Apex Marketplace is provided on an "as is" basis. We are not liable for indirect or consequential damages arising from your use of the platform, to the fullest extent permitted by law.',
        },
        {
          title: 'Changes to These Terms',
          body: 'We may update these terms from time to time. Continued use of Apex Marketplace after changes take effect constitutes acceptance of the revised terms.',
        },
      ],
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
