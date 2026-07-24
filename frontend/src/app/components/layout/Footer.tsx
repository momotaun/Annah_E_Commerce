import Link from "next/link";
import { cn } from "@/src/lib/utils";
import Input from "@/src/app/components/ui/Input";
import Button from "@/src/app/components/ui/Button";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  variant?: "full" | "minimal";
  brandBlurb?: string;
  columns?: FooterColumn[];
  showNewsletter?: boolean;
  legalLinks?: FooterLink[];
  className?: string;
}

const defaultLegalLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

function Footer({
  variant = "full",
  brandBlurb,
  columns = [],
  showNewsletter = false,
  legalLinks = defaultLegalLinks,
  className,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("w-full border-t border-gray-200 bg-white", className)}>
      {variant === "full" && (
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div
            className={cn(
              "grid grid-cols-1 gap-10",
              showNewsletter ? "md:grid-cols-4" : "md:grid-cols-3"
            )}
          >
            <div className="flex flex-col gap-3">
              <span className="text-xl font-bold text-primary-600">
                Apex Marketplace
              </span>
              {brandBlurb && (
                <p className="text-sm text-gray-500">{brandBlurb}</p>
              )}
            </div>

            {columns.map((column) => (
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

            {showNewsletter && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  Newsletter
                </span>
                <p className="text-sm text-gray-500">
                  Get exclusive access to new drops and offers.
                </p>
                <form className="flex flex-col gap-2">
                  <Input type="email" placeholder="Email address" />
                  <Button type="submit" size="sm">
                    Subscribe
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-gray-500 sm:flex-row">
          <span>© {year} Apex Marketplace. All rights reserved.</span>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary-600">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;