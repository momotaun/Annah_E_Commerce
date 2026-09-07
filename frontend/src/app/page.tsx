import Image from "next/image";
import { ArrowRight, Truck, Leaf, ShieldCheck, Star } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import NewsletterBand from "@/src/app/components/shared/NewsletterBand";
import { getProducts } from "@/src/lib/api/products";
import TopRatedEssentials from "@/src/app/TopRatedEssentials";
import HeroSection from "@/src/app/HeroSection";

export default async function LandingPage() {
  const essentials = await getProducts({ limit: 6 });

  return (
    <div className="flex min-h-screen flex-col">
      <Header announcementText="FREE SHIPPING ON ORDERS OVER R1000!" showSearch />

      <main className="flex-1">
        <HeroSection />
        <TopRatedEssentials products={essentials.data} />
        <PromoBanner />
        <TrustBadges />
        <NewsletterBand />
      </main>

      <Footer />
    </div>
  );
}

const promoCards = [
  {
    eyebrow: "Home Essentials",
    headline: "Make home a happier place",
    subtext: "Stylish. Practical. Made for everyday living",
    cta: "Shop Home & Living",
    href: "/categories/home-living",
    discount: "40%",
    image: "/images/cat-home.jpg",
  },
  {
    eyebrow: "Tech For A Brighter Tomorrow",
    headline: "Smarter tech. Greener choices.",
    subtext: "Innovation for a better everyday.",
    cta: "Shop Electronics",
    href: "/categories/electronics",
    discount: "30%",
    image: "/images/cat-electronics.jpg",
  },
];

function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {promoCards.map((card) => (
          <div
            key={card.href}
            className="group relative min-h-[260px] overflow-hidden rounded-md"
          >
            <Image
              src={card.image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent" />

            <div className="relative flex h-full w-3/4 flex-col justify-center gap-3 px-8 py-8">
              <span className="text-xs font-bold uppercase tracking-widest text-primary-500">
                {card.eyebrow}
              </span>
              <h3 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                {card.headline}
              </h3>
              <p className="text-sm text-gray-500">{card.subtext}</p>
              <Button
                href={card.href}
                className="mt-2 w-fit"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                {card.cta}
              </Button>
            </div>

            <div className="absolute right-6 top-6 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary-100 text-center leading-none text-primary-600">
              <span className="text-[10px] font-bold uppercase">Up to</span>
              <span className="text-xl font-extrabold">{card.discount}</span>
              <span className="text-[10px] font-bold uppercase">Off</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const trustProps = [
  { icon: Leaf, title: "Sustainable products", subtitle: "A cleaner, greener future" },
  { icon: Truck, title: "Fast & reliable delivery", subtitle: "Get it when you need it" },
  { icon: ShieldCheck, title: "Secure checkout", subtitle: "Shop with confidence" },
  { icon: Star, title: "Rated by real customers", subtitle: "Trusted by thousands" },
];

function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl border-t border-gray-200 px-6 py-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustProps.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

