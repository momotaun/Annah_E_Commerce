"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Truck, Lock, Leaf } from "lucide-react";
import Button from "@/src/app/components/ui/Button";
import { getCategoryTheme } from "@/src/lib/categoryTheme";

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
  /** Ties this slide to a real category's colour theme — omitted for the
      flagship and adventure/outdoor slides, which aren't a real category
      and stay the default brand green. */
  categorySlug?: string;
}

const heroValueProps = [
  { icon: Truck, title: "Free shipping", subtitle: "on orders over R1000" },
  { icon: Lock, title: "Secure payment", subtitle: "100% safe & encrypted" },
  { icon: Leaf, title: "A greener choice", subtitle: "For a brighter future" },
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
  const theme = getCategoryTheme(slide.categorySlug);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <div className="group relative flex min-h-[520px] items-center overflow-hidden rounded-md">
        <Image
          key={slide.image}
          src={slide.image}
          alt=""
          fill
          priority
          className="object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-110"
        />
        {/* Two stacked overlays: a full colour tint (brand green by default,
            or the slide's category colour) so the whole banner reads as one
            block, plus a left-to-right fade so the copy on the left has a
            solid backdrop while the photo on the right stays visible
            through the tint. */}
        <div className={`absolute inset-0 ${theme.heroOverlay}`} />
        <div
          className={`absolute inset-0 bg-gradient-to-r ${theme.heroGradientFrom} ${theme.heroGradientVia} to-transparent md:w-2/3`}
        />

        <div className="relative z-10 flex w-full flex-col gap-10 px-6 py-12 md:w-3/5 md:px-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-100">
              {slide.eyebrow}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {slide.headlineBefore} <span className={theme.highlightText}>{slide.highlight}</span>{" "}
              {slide.headlineAfter}
            </h1>
            <p className="mt-6 max-w-md text-lg text-primary-50">{slide.subheading}</p>
            <Button
              size="lg"
              href={slide.cta.href}
              className={`mt-8 bg-white hover:bg-gray-100 ${theme.text}`}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              {slide.cta.label}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {heroValueProps.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-2">
                <Icon className="h-5 w-5 shrink-0 text-primary-300" />
                <div className="text-sm leading-tight">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-primary-100">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-8 top-8 z-10 hidden h-32 w-32 flex-col items-center justify-center rounded-full border border-primary-100/40 text-center md:flex">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100">Up to</span>
          <span className="text-3xl font-extrabold leading-tight text-white">{slide.badgeValue}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-100">Off</span>
          <span className="mt-1 text-[10px] text-primary-100/80">{slide.badgeCaption}</span>
        </div>

        <div className="absolute bottom-6 right-8 z-10 hidden gap-2 md:flex">
          {slides.map((s, index) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeSlide}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
