// Maps each product (by name) to a "gallery bucket" — a folder of 3
// royalty-free stock photos under prisma/seed-images/stock/<bucket>-N.jpg
// used to top every catalogue product up to a real, non-placeholder,
// 3+ image gallery for demo purposes. Photos are representative of the
// product type, not literal photography of that exact fictional SKU —
// there is no real product photography for this demo catalogue.
//
// Consumed by backfillProductGalleryImages (runs on every boot). Products
// not listed here (e.g. one-off walkthrough/test fixtures) are left alone.
export const PRODUCT_GALLERY_BUCKETS: Record<string, string> = {
  // Audio
  'Aero-Pulse Earbuds': 'wireless-earbuds',
  'Apex Elite Wireless Headphones': 'over-ear-headphones',
  'Apex Home Theater 5.1': 'soundbar-home-theater',
  'Bass Orbit Subwoofer': 'subwoofer',
  'Cadence Portable Speaker': 'bluetooth-speaker',
  'Clarity Hearing Amplifier': 'bluetooth-speaker',
  'Drift Wireless Earbuds Mini': 'wireless-earbuds',
  'Echo Smart Speaker': 'bluetooth-speaker',
  'Nightfall Bone Conduction Headphones': 'over-ear-headphones',
  'Podcast Pro USB Microphone': 'usb-microphone',
  'Resonate Soundbar 500': 'soundbar-home-theater',
  'RoadTrip Car Speaker': 'bluetooth-speaker',
  'StudioTone Monitor Speakers': 'turntable-studio',
  'Vinyl Revival Turntable': 'turntable-studio',
  'Whisper ANC Sleep Earbuds': 'wireless-earbuds',

  // Camping & hiking
  'Basecamp 2-Person Tent': 'camping-tent',
  'Ember Portable Camp Stove': 'camping-stove',
  'Northstar Sleeping Bag -5°C': 'sleeping-bag',
  'TrailLite Hiking Backpack 40L': 'hiking-backpack',

  // Computing
  'Apex Graphics Tablet': 'computer-desk-accessories',
  'Apex Mini Desktop Tower': 'laptop-computing',
  'Apex ProBook M3 Max': 'laptop-computing',
  'Aurora Desk Monitor Light': 'computer-desk-accessories',
  'Cascade Laptop Stand': 'computer-desk-accessories',
  'Ember Gaming Chair': 'gaming-chair',
  'Focal Webcam 4K': 'computer-desk-accessories',
  'Glide Wireless Mouse': 'computer-desk-accessories',
  'Nexus USB-C Dock': 'computer-desk-accessories',
  'Precision Mechanical Keyboard': 'computer-desk-accessories',
  'Sentinel External Backup Drive': 'computer-desk-accessories',
  'Signal Mesh Router': 'computer-desk-accessories',
  'SonicMaster Elite G2': 'computer-desk-accessories',
  'Vertex Ultrawide Monitor': 'laptop-computing',
  'Voyager External SSD': 'computer-desk-accessories',

  // Electronics
  'Aegis Power Bank 20K': 'power-bank-charger',
  'Apex Chrono Smartwatch': 'smartwatch-fitness-band',
  'Apex Tablet Air': 'laptop-computing',
  'Beam Mini Projector': 'mini-projector',
  'Guardian Smart Doorbell': 'smart-home-gadgets',
  'Halo Wireless Charging Pad': 'power-bank-charger',
  'Hearth Smart Home Hub': 'smart-home-gadgets',
  'Lumina Mirrorless Camera': 'mirrorless-camera',
  'NovaPlay Handheld Console': 'handheld-console',
  'Orbit Robot Vacuum': 'robot-vacuum',
  'PulseFit Tracker Band': 'smartwatch-fitness-band',
  'SkyDrift Pro Drone': 'drone',
  'Solace E-Reader': 'e-reader',
  'Vantage VR Headset': 'vr-headset',
  'Zephyr Action Camera': 'mirrorless-camera',

  // Fashion
  'Apex Chelsea Boots': 'mens-boots',
  'Apex Leather Belt': 'leather-belt-gloves',
  'Apex Merino Wool Overcoat': 'mens-outerwear-shirts',
  'Apex Signature Oxford Shirt': 'mens-outerwear-shirts',
  'Apex Silk Pocket Square': 'silk-tie-pocket-square',
  'Apex Wool Trousers': 'mens-trousers',
  'Meridian Denim Jacket': 'womens-jacket',
  'Meridian Leather Gloves': 'leather-belt-gloves',
  'Meridian Linen Shirt': 'mens-outerwear-shirts',
  'Meridian Silk Tie': 'silk-tie-pocket-square',
  'Meridian Tailored Blazer': 'womens-blazer',
  'Solstice Cashmere Sweater': 'womens-sweater',
  'Solstice Merino Polo': 'mens-polo',
  'Solstice Wool Scarf': 'wool-scarf',
  'TerraFlex Performance Chinos': 'mens-trousers',

  // Fitness equipment
  'Apex Yoga Mat Pro': 'home-gym-equipment',
  'Ridgeline Adjustable Dumbbell Set': 'home-gym-equipment',
  'Summit Resistance Band Kit': 'home-gym-equipment',
  'Vertex Foam Roller': 'home-gym-equipment',

  // Home & living
  'Apex Cast Iron Cookware Set': 'kitchenware-cookware',
  'Apex Wool Throw Blanket': 'home-textiles-blanket',
  'Haven Bamboo Cutting Board Set': 'kitchenware-cookware',
  'Haven Velvet Cushion Set': 'home-textiles-blanket',
  'Hearth Ceramic Vase Set': 'home-decor-vase-candle',
  'Hearth Dinnerware Set': 'kitchenware-cookware',
  'Lumen Table Lamp': 'table-lamp',
  'Meridian Linen Bedding Set': 'home-textiles-blanket',
  'Meridian Rattan Storage Basket': 'storage-basket',
  'Nordic Glass Carafe': 'kitchenware-cookware',
  'Nordic Oak Coffee Table': 'living-room-furniture',
  'Serene Bath Towel Set': 'home-textiles-blanket',
  'Solace Diffuser & Essential Oil Set': 'essential-oil-diffuser',
  'Solace Scented Candle Trio': 'home-decor-vase-candle',
  'Terra Indoor Plant Pot': 'home-decor-vase-candle',

  // Personal care & skincare
  'Breeze Hair Dryer 2200W': 'hair-dryer',
  'Calm Aromatherapy Diffuser': 'essential-oil-diffuser',
  'Precision Grooming Kit': 'grooming-kit',
  'Silk Touch Electric Toothbrush': 'electric-toothbrush',
  'Aloe Fresh Hydrating Moisturizer': 'skincare-products',
  'Glow Clay Face Mask': 'skincare-products',
  'Lumière Vitamin C Serum': 'skincare-products',
  'Pure Radiance Facial Cleanser': 'skincare-products',
};

// Each bucket has exactly 3 local files, named <bucket>-1.jpg .. <bucket>-3.jpg,
// under prisma/seed-images/stock/.
export const GALLERY_BUCKET_IMAGE_COUNT = 3;
