import Link from "next/link";
import { Banknote, CreditCard, Landmark } from "lucide-react";
import { cn } from "@/src/lib/utils";
import SocialIcon from "@/src/app/components/ui/SocialIcon";
import TwitterIcon from "@/src/app/components/ui/icons/TwitterIcon";
import InstagramIcon from "@/src/app/components/ui/icons/InstagramIcon";
import FacebookIcon from "@/src/app/components/ui/icons/FacebookIcon";

export interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

const BRAND_BLURB =
  "Elevating everyday life through curated premium essentials. Your destination for high-end lifestyle and tech products.";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Catalogue", href: "/catalogue" },
      { label: "Categories", href: "/categories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

function Footer({ variant = "full", className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("w-full border-t border-gray-200 bg-white", className)}>
      {variant === "full" && (
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="flex flex-col gap-3">
              <span className="text-xl font-bold text-primary-600">
                Apex Marketplace
              </span>
              <p className="text-sm text-gray-500">{BRAND_BLURB}</p>
              <div className="mt-2 flex gap-3">
                <SocialIcon icon={<TwitterIcon className="h-4 w-4" />} label="Twitter" />
                <SocialIcon icon={<InstagramIcon className="h-4 w-4" />} label="Instagram" />
                <SocialIcon icon={<FacebookIcon className="h-4 w-4" />} label="Facebook" />
              </div>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {column.title}
                </span>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 hover:text-primary-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-gray-500 sm:flex-row">
          <span>© {year} Apex Marketplace. All rights reserved.</span>
          <div className="flex items-center gap-4 text-gray-400">
            <Banknote className="h-4 w-4" aria-label="Cash on delivery" />
            <CreditCard className="h-4 w-4" aria-label="Card payments" />
            <Landmark className="h-4 w-4" aria-label="EFT / bank transfer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;