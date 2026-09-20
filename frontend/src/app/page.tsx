import Image from "next/image";
import { ArrowRight, Truck, Leaf, ShieldCheck, Star } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import NewsletterBand from "@/src/app/components/shared/NewsletterBand";
import AppDownloadBadges from "@/src/app/components/shared/AppDownloadBadges";
import CategoryCarousel from "@/src/app/components/shared/CategoryCarousel";
import { getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import { getHeroSlides } from "@/src/lib/api/hero-slides";
import { getCategoryTheme } from "@/src/lib/categoryTheme";
import TopRatedEssentials from "@/src/app/TopRatedEssentials";
import HeroSection, { Slide } from "@/src/app/HeroSection";

export default async function LandingPage() {
  const [essentials, categories, heroSlides] = await Promise.all([
    // "newest" would be dominated entirely by whichever category was most
    // recently seeded (they're inserted in one batch per category) — sorting
    // by price instead gives a natural mix of vendor and marketplace-owned
    // products across the row, like a real storefront's picks would.
    getProducts({ limit: 12, sort: "price-asc" }),
    getCategories(),
    getHeroSlides(),
  ]);

  const slides: Slide[] = heroSlides.map((slide) => ({
    eyebrow: slide.eyebrow,
    headlineBefore: slide.headlineBefore,
    highlight: slide.highlight,
    headlineAfter: slide.headlineAfter,
    subheading: slide.subheading,
    image: slide.imageUrl,
    cta: { label: slide.ctaLabel, href: slide.ctaHref },
    badgeValue: slide.badgeValue,
    badgeCaption: slide.badgeCaption,
    categorySlug: slide.categorySlug ?? undefined,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <HeroSection slides={slides} />
        <AppDownloadBadges />
        <CategoryCarousel categories={categories} />
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
    slug: "home-living",
    eyebrow: "Home Essentials",
    headline: "Make home a happier place",
    subtext: "Stylish. Practical. Made for everyday living",
    cta: "Shop Home & Living",
    href: "/categories/home-living",
    discount: "40%",
    image: "/images/cat-home.jpg",
  },
  {
    slug: "electronics",
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
        {promoCards.map((card) => {
          const theme = getCategoryTheme(card.slug);
          return (
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
                <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
                  {card.eyebrow}
                </span>
                <h3 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  {card.headline}
                </h3>
                <p className="text-sm text-gray-500">{card.subtext}</p>
                <Button
                  href={card.href}
                  className={`mt-2 w-fit ${theme.button}`}
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                >
                  {card.cta}
                </Button>
              </div>

              <div
                className={`absolute right-6 top-1/2 flex h-44 w-44 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center leading-none ${theme.bgSoft} ${theme.text}`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">Up to</span>
                <span className="text-5xl font-extrabold">{card.discount}</span>
                <span className="text-xs font-bold uppercase tracking-widest">Off</span>
              </div>
            </div>
          );
        })}
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

