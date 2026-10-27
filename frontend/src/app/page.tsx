import { Truck, BadgeCheck, ShieldCheck, Star } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import PromoCard from "@/src/app/components/shared/PromoCard";
import NewsletterBand from "@/src/app/components/shared/NewsletterBand";
import AppDownloadBadges from "@/src/app/components/shared/AppDownloadBadges";
import CategoryCarousel from "@/src/app/components/shared/CategoryCarousel";
import { getProducts } from "@/src/lib/api/products";
import { getCategories } from "@/src/lib/api/categories";
import { getHeroSlides } from "@/src/lib/api/hero-slides";
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
        <PromoCards />
        <CategoryCarousel categories={categories} />
        <TopRatedEssentials products={essentials.data} />
        <AppDownloadBadges />
        <TrustBadges />
        <NewsletterBand />
      </main>

      <Footer />
    </div>
  );
}

function PromoCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PromoCard
          tone="orange"
          eyebrow="Fashion deals"
          headline={
            <>
              Up to <PromoCard.Accent>70% off</PromoCard.Accent>
            </>
          }
          cta={{ label: "Shop Fashion", href: "/categories/fashion" }}
          image="/images/cat-fashion.jpg"
        />
        <PromoCard
          tone="neutral"
          eyebrow="Everyday essentials"
          headline="Take 2 & save"
          cta={{ label: "Shop now", href: "/categories/home-living" }}
          image="/images/cat-home.jpg"
        />
        <PromoCard
          tone="pink"
          eyebrow="Beauty favourites"
          headline={
            <>
              Up to <PromoCard.Accent>50% off</PromoCard.Accent>
            </>
          }
          cta={{ label: "Shop Beauty", href: "/categories/beauty-health" }}
          image="/images/solace-diffuser-essential-oil-set.jpg"
        />
      </div>
    </section>
  );
}

const trustProps = [
  { icon: BadgeCheck, title: "Verified sellers", subtitle: "Vetted for trust and quality" },
  { icon: Truck, title: "Fast & reliable delivery", subtitle: "Get it when you need it" },
  { icon: ShieldCheck, title: "Secure checkout", subtitle: "Shop with confidence" },
  { icon: Star, title: "Rated by real customers", subtitle: "Real reviews, real feedback" },
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

