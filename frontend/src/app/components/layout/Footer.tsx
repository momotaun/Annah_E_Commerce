import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { SITE_NAME } from "@/src/lib/siteConfig";
import Logo from "@/src/app/components/layout/Logo";
import SocialIcon from "@/src/app/components/ui/SocialIcon";
import InstagramIcon from "@/src/app/components/ui/icons/InstagramIcon";
import FacebookIcon from "@/src/app/components/ui/icons/FacebookIcon";
import YoutubeIcon from "@/src/app/components/ui/icons/YoutubeIcon";
import TikTokIcon from "@/src/app/components/ui/icons/TikTokIcon";
import LinkedInIcon from "@/src/app/components/ui/icons/LinkedInIcon";

export interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

const BRAND_TAGLINE = "Better products. A brighter everyday.";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Categories", href: "/categories" },
      { label: "Special Offers", href: "/collections/limited-edition" },
      { label: "New Arrivals", href: "/catalogue?sort=newest" },
      { label: "Best Sellers", href: "/catalogue" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Your Order", href: "/orders" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Shipping Information", href: "/shipping" },
      { label: "FAQs", href: "/help" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
      { label: "Become a Vendor", href: "/vendor-onboarding/business-info" },
    ],
  },
];

const socialIconClassName = "bg-white/10 text-primary-100 hover:bg-white/20 hover:text-white";

function Footer({ variant = "full", className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("w-full bg-primary-600 text-white", className)}>
      {variant === "full" && (
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-8">
            <div className="flex flex-col gap-3 pb-2 md:pb-0">
              <Logo theme="dark" size="sm" />
              <p className="text-sm text-primary-100">{BRAND_TAGLINE}</p>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="border-t border-white/10 md:border-0">
                {/* Mobile: each column collapses into an accordion — three
                    always-expanded link lists is a lot of scroll to get
                    past on a phone. <details>/<summary> gives us this with
                    no JS/client component needed. Desktop keeps the
                    original always-expanded column (hidden md:flex below),
                    since there's no scroll problem to solve there. */}
                <details className="group md:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                    {column.title}
                    <ChevronDown className="h-4 w-4 text-primary-100 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="flex flex-col gap-2 pb-4">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-primary-100 hover:text-white">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="hidden flex-col gap-3 md:flex">
                  <span className="text-sm font-semibold text-white">{column.title}</span>
                  <ul className="flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-primary-100 hover:text-white">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-4 md:border-0 md:pt-0">
              <span className="text-sm font-semibold text-white">Follow Us</span>
              <div className="flex gap-3">
                <SocialIcon icon={<InstagramIcon className="h-4 w-4" />} label="Instagram" className={socialIconClassName} />
                <SocialIcon icon={<FacebookIcon className="h-4 w-4" />} label="Facebook" className={socialIconClassName} />
                <SocialIcon icon={<YoutubeIcon className="h-4 w-4" />} label="YouTube" className={socialIconClassName} />
                <SocialIcon icon={<TikTokIcon className="h-4 w-4" />} label="TikTok" className={socialIconClassName} />
                <SocialIcon icon={<LinkedInIcon className="h-4 w-4" />} label="LinkedIn" className={socialIconClassName} />
              </div>
              <p className="mt-2 text-xs text-primary-100">
                © {year} {SITE_NAME}. All rights reserved.
                <br />
                A brighter everyday. Together.
              </p>
            </div>
          </div>
        </div>
      )}

      {variant === "minimal" && (
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-primary-100">
          © {year} {SITE_NAME}. All rights reserved.
        </div>
      )}
    </footer>
  );
}

export default Footer;
