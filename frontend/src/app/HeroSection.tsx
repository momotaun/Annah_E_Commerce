"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Percent, ShieldCheck, Store, Truck } from "lucide-react";
import Button from "@/src/app/components/ui/Button";

export interface Slide {
  eyebrow: string;
  headlineBefore: string;
  highlight: string;
  headlineAfter: string;
  subheading: string;
  image: string;
  cta: { label: string; href: string };
  badgeValue: string;
  badgeCaption: string;
  /** Kept so admin-set slides keep their category link; the redesigned hero
      uses one brand look for every slide rather than per-category colours. */
  categorySlug?: string;
}

// Shown beside the hero on desktop and as an icon row beneath it on mobile.
// The subtitles stay with claims the site already makes elsewhere (the
// announcement bar, the trust badges) rather than new marketing copy.
const heroValueProps = [
  { icon: Truck, title: "Free shipping", subtitle: "On orders over R1000", href: undefined },
  { icon: ShieldCheck, title: "Secure payments", subtitle: "100% safe & encrypted", href: undefined },
  { icon: Store, title: "Trusted sellers", subtitle: "Verified South African vendors", href: undefined },
  { icon: Percent, title: "Daily deals", subtitle: "Save more", href: "/collections/limited-edition" },
];

const SLIDE_INTERVAL_MS = 6000;

export default function HeroSection({ slides }: { slides: Slide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance, but re-armed from whatever slide a dot click landed on —
  // otherwise a manual click would just get overwritten by the next tick of
  // an interval still counting from the old slide.
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeSlide, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[activeSlide];
  const hasPercentSign = slide.badgeValue.endsWith("%");
  const badgeNumber = hasPercentSign ? slide.badgeValue.slice(0, -1) : slide.badgeValue;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative flex min-h-[340px] items-center overflow-hidden rounded-lg bg-brand-lime sm:min-h-[440px] lg:min-h-[500px]">
          <div className="absolute inset-y-0 right-0 w-1/2 sm:w-3/5">
            <Image
              key={slide.image}
              src={slide.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 60vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-lime via-brand-lime/50 to-transparent" />
          </div>

          <div className="relative z-10 flex w-full max-w-xl flex-col px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
            <span className="text-[11px] font-bold uppercase tracking-widest text-ink sm:text-xs">
              {slide.eyebrow}
            </span>
            <h1 className="mt-2 text-sm font-semibold leading-snug text-ink sm:text-lg">
              {slide.headlineBefore} <span className="text-sale">{slide.highlight}</span>{" "}
              {slide.headlineAfter}
            </h1>

            <div className="mt-3 sm:mt-5">
              <p className="text-3xl font-extrabold uppercase leading-none text-ink sm:text-5xl lg:text-6xl">
                Up to
              </p>
              <p className="flex items-baseline gap-2 leading-none">
                <span className="text-7xl font-extrabold text-sale sm:text-8xl lg:text-9xl">
                  {badgeNumber}
                  {hasPercentSign && "%"}
                </span>
                <span className="text-3xl font-extrabold uppercase text-ink sm:text-5xl lg:text-6xl">
                  Off
                </span>
              </p>
              {slide.badgeCaption && (
                <p className="mt-1 text-xs font-medium text-ink/70 sm:text-sm">{slide.badgeCaption}</p>
              )}
            </div>

            <p className="mt-3 max-w-xs text-sm text-ink sm:mt-4 sm:text-base">{slide.subheading}</p>

            <Button
              variant="dark"
              size="lg"
              href={slide.cta.href}
              className="mt-5 w-fit rounded-md uppercase sm:mt-6"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              {slide.cta.label}
            </Button>
          </div>

          <div className="absolute bottom-4 left-5 z-10 flex gap-2 sm:left-10 lg:left-14">
            {slides.map((s, index) => (
              <button
                key={`${s.image}-${index}`}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeSlide}
                className={`h-2 rounded-full transition-all ${
                  index === activeSlide ? "w-6 bg-ink" : "w-2 bg-ink/30 hover:bg-ink/50"
                }`}
              />
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-gray-200 lg:rounded-lg lg:border lg:border-gray-200 lg:bg-white">
          {heroValueProps.map(({ icon: Icon, title, subtitle, href }) => {
            const content = (
              <>
                <Icon className="h-7 w-7 shrink-0 text-ink lg:h-8 lg:w-8" strokeWidth={1.5} />
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold text-ink lg:text-sm">{title}</p>
                  <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">{subtitle}</p>
                </div>
              </>
            );
            const classes =
              "flex flex-col items-center gap-2 px-1 py-3 text-center lg:flex-row lg:gap-4 lg:px-5 lg:py-5 lg:text-left";
            return (
              <li key={title}>
                {href ? (
                  <Link href={href} className={`${classes} hover:opacity-70`}>
                    {content}
                  </Link>
                ) : (
                  <div className={classes}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
