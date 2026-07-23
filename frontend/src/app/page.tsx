"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Award, Headset } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import RatingStars from "@/src/app/components/ui/RatingStars";
import Avatar from "@/src/app/components/ui/Avatar";
import InfoCard from "@/src/app/components/shared/InfoCard";
import ProductCard from "@/src/app/components/shared/ProductCard";
import NewsletterBand from "@/src/app/components/shared/NewsletterBand";

const essentials = [
  { title: "Aero-Pulse ANC Headphones", category: "Electronics", price: "R4,299", image: "/images/home/essentials/headphones.png", badge: { label: "Bestseller" } },
  { title: "Apex Barista Pro", category: "Home & Living", price: "R12,499", image: "/images/home/essentials/coffe_maker.png" },
  { title: "Horologer Series IV", category: "Fashion", price: "R8,950", image: "/images/home/essentials/watch.png" },
  { title: "Terra-Guard 4P Tent", category: "Outdoor", price: "R3,199", image: "/images/home/essentials/tent.png" },
  { title: "Omni-Key Wireless", category: "Electronics", price: "R2,450", image: "/images/home/essentials/keyboard.png" },
  { title: "Slate Dinnerware Set", category: "Home", price: "R1,299", image: "/images/home/essentials/dishes.png" },
  { title: "Vantage 4K Cam", category: "Electronics", price: "R5,800", image: "/images/home/essentials/go_pro.png" },
  { title: "Hydro-Core Flask", category: "Outdoor", price: "R550", image: "/images/home/essentials/flask.png" },
];

const testimonials = [
  { name: "Thandi Mthembu", role: "Interior Designer, Joburg", quote: "The curated selection at Apex is unmatched. I recently refurbished my studio and every piece exceeded expectations. Delivery was prompt even in Sandton traffic.", rating: 4, avatar: "/images/home/testimonials/testimonial_1.png" },
  { name: "Johan de Beer", role: "Tech Lead", quote: "Apex is my go-to for tech gear. Their service is elite and the products are always authentic. The Aero-Pulse headphones changed my work-from-home life.", rating: 5, avatar: "/images/home/testimonials/testimonial_2.png" },
  { name: "Lwazi Nkosi", role: "Outdoor Enthusiast", quote: "The camping gear is top-tier. Finally a marketplace that understands the quality needed for South African trails. Exceptional stock.", rating: 5, avatar: "/images/home/testimonials/testimonial_3.png" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        announcementText="FREE SHIPPING ON ORDERS OVER R1000!"
        showSearch
        cartCount={0}
      />

      <main className="flex-1">
        <HeroSection />
        <CuratedCategories />
        <TopRatedEssentials />
        <PromoBanner />
        <TrustBadges />
        <Testimonials />
        <NewsletterBand />
      </main>

      <Footer
        brandBlurb="Elevating everyday life through curated premium essentials. Your destination for high-end lifestyle and tech products."
        columns={[
          { title: "Shop", links: [{ label: "Catalogue", href: "/catalogue" }, { label: "Featured Items", href: "/featured" }, { label: "New Arrivals", href: "/new" }, { label: "Promotions", href: "/promotions" }] },
          { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Sustainability", href: "/sustainability" }, { label: "Contact", href: "/contact" }, { label: "Careers", href: "/careers" }] },
        ]}
      />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[420px] items-center overflow-hidden bg-gray-100 py-[154px] ">
      <Image src="/images/home/Home_Banner.png" alt="Hero Image" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Badge variant="primary" className="mb-6 py-1">SPRING COLLECTION 2024</Badge>
        <h1 className="max-w-lg text-5xl font-bold leading-tight text-gray-900">
          Elevate Your <span className="text-primary-600">Everyday</span>
        </h1>
        <p className="py-6 max-w-md text-gray-500">
          Discover curated premium essentials for a modern lifestyle. From
          technical excellence to aesthetic perfection.
        </p>
        <div className="mt-6 flex gap-4">
          <Button size="lg" href="/catalogue">Shop Now</Button>
          <Button size="lg" variant="outline" href="/lookbook">View Lookbook</Button>
        </div>
      </div>
    </section>
  );
}

function CuratedCategories() {
  const categories = [
    { title: "Electronics", subtitle: "Precision gear for the digital nomad", href: "/categories/electronics", image: "/images/home/categories_1.png", span: "col-span-2 row-span-1" },
    { title: "Home & Living", href: "/categories/home-living", image: "/images/home/categories_2.png", span: "row-span-2" },
    { title: "Fashion", href: "/categories/fashion", image: "/images/home/categories_3.png", span: "" },
    { title: "Outdoor", href: "/categories/outdoor", image: "/images/home/categories_4.png", span: "" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Curated Categories</h2>
          <p className="text-sm text-gray-500">Explore our specialized collections</p>
        </div>
        <Link href="/categories" className="text-sm font-medium text-primary-600 hover:underline">
          Explore All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
        {categories.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className={`relative min-h-[200px] overflow-hidden rounded-md ${cat.span}`}
          >
            <Image src={cat.image} alt={cat.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-lg font-semibold">{cat.title}</span>
              {cat.subtitle && <p className="text-sm">{cat.subtitle}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TopRatedEssentials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Top-Rated Essentials</h2>
        <p className="text-sm text-gray-500">Voted by our community of enthusiasts</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {essentials.map((item) => (
          <ProductCard
            key={item.title}
            href={`/products/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
            image={item.image}
            title={item.title}
            category={item.category}
            price={item.price}
            badge={item.badge}
            onAddToCart={() => {}}
          />
        ))}
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="relative flex min-h-[220px] items-center overflow-hidden rounded-md bg-gray-900">
        <Image src="/images/home/galaxy.png" alt="" fill className="object-cover opacity-60" />
        <div className="relative flex w-full items-center justify-between px-10">
          <div>
            <span className="text-sm uppercase tracking-wide text-gray-300">
              Limited Edition Collection
            </span>
            <h3 className="mt-1 text-3xl font-bold text-white">Up to 30% Off</h3>
          </div>
          <Button variant="primary" href="/collections/limited-edition">Claim Offer</Button>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <InfoCard icon={<Truck className="h-6 w-6" />} title="Fast Delivery" description="Same-day shipping in major SA metros." />
        <InfoCard icon={<ShieldCheck className="h-6 w-6" />} title="Secure Payment" description="Encrypted transactions via PayFast." />
        <InfoCard icon={<Award className="h-6 w-6" />} title="Quality Guarantee" description="Curated products with full warranties." />
        <InfoCard icon={<Headset className="h-6 w-6" />} title="24/7 Support" description="Local experts ready to assist you." />
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Trusted by Experts</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="flex flex-col gap-4 rounded-md border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Avatar src={t.avatar} alt={t.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">&ldquo;{t.quote}&rdquo;</p>
            <RatingStars rating={t.rating} showValue={false} showCount={false} />
          </div>
        ))}
      </div>
    </section>
  );
}