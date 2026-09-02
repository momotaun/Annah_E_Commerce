import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, Award, Headset } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import Avatar from "@/src/app/components/ui/Avatar";
import InfoCard from "@/src/app/components/shared/InfoCard";
import NewsletterBand from "@/src/app/components/shared/NewsletterBand";
import { getProducts } from "@/src/lib/api/products";
import TopRatedEssentials from "@/src/app/TopRatedEssentials";

const testimonials = [
  { name: "Thandi Mthembu", role: "Interior Designer, Joburg", quote: "The curated selection at Apex is unmatched. I recently refurbished my studio and every piece exceeded expectations. Delivery was prompt even in Sandton traffic.", rating: 4, avatar: "/images/thandi.jpg" },
  { name: "Johan de Beer", role: "Tech Lead", quote: "Apex is my go-to for tech gear. Their service is elite and the products are always authentic. The Aero-Pulse headphones changed my work-from-home life.", rating: 5, avatar: "/images/johan.jpg" },
  { name: "Lwazi Nkosi", role: "Outdoor Enthusiast", quote: "The camping gear is top-tier. Finally a marketplace that understands the quality needed for South African trails. Exceptional stock.", rating: 5, avatar: "/images/lwazi.jpg" },
];

export default async function LandingPage() {
  const essentials = await getProducts({ limit: 8 });

  return (
    <div className="flex min-h-screen flex-col">
      <Header announcementText="FREE SHIPPING ON ORDERS OVER R1000!" showSearch />

      <main className="flex-1">
        <HeroSection />
        <CuratedCategories />
        <TopRatedEssentials products={essentials.data} />
        <PromoBanner />
        <TrustBadges />
        <Testimonials />
        <NewsletterBand />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="group relative flex min-h-[420px] items-center overflow-hidden bg-gray-100 py-[154px]">
      <Image
        src="/images/hero-desk.jpg"
        alt=""
        fill
        priority
        className="object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        <Badge variant="primary" className="mb-4">SPRING COLLECTION 2024</Badge>
        <h1 className="max-w-lg text-5xl font-extrabold leading-tight text-gray-900">
          Elevate Your <span className="text-primary-600">Everyday</span>
        </h1>
        <p className="mt-4 max-w-md text-gray-500">
          Discover curated premium essentials for a modern lifestyle. From
          technical excellence to aesthetic perfection.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button size="lg" href="/catalogue" className="w-full sm:w-auto">Shop Now</Button>
          <Button size="lg" variant="outline" href="/lookbook" className="w-full sm:w-auto">View Lookbook</Button>
        </div>
      </div>
    </section>
  );
}

function CuratedCategories() {
  const categories = [
    { title: "Electronics", subtitle: "Precision gear for the digital nomad", href: "/categories/electronics", image: "/images/cat-electronics.jpg", span: "col-span-2 row-span-1" },
    { title: "Home & Living", href: "/categories/home-living", image: "/images/cat-home.jpg", span: "row-span-2" },
    { title: "Fashion", href: "/categories/fashion", image: "/images/cat-fashion.jpg", span: "" },
    { title: "Outdoor", href: "/categories/outdoor", image: "/images/cat-outdoor.jpg", span: "" },
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
            className={`group relative min-h-[200px] overflow-hidden rounded-md ${cat.span}`}
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
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

function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="group relative flex min-h-[220px] items-center overflow-hidden rounded-md bg-gray-900">
        <Image
          src="/images/promo-abstract.jpg"
          alt=""
          fill
          className="object-cover opacity-60 transition-transform duration-700 ease-out group-hover:scale-110"
        />
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
          </div>
        ))}
      </div>
    </section>
  );
}