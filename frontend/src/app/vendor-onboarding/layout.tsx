import VendorHeader from "@/src/app/components/layout/VendorHeader";
import Footer from "@/src/app/components/layout/Footer";

export default function VendorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <VendorHeader />
      <main className="flex-1">{children}</main>
      <Footer
        brandBlurb="The global standard for premium B2B e-commerce and professional vendor partnerships."
        columns={[
          { title: "Platform", links: [{ label: "Home", href: "/" }, { label: "Catalogue", href: "/catalogue" }, { label: "About", href: "/about" }] },
          { title: "Support", links: [{ label: "Contact", href: "/contact" }, { label: "FAQ", href: "/faq" }, { label: "Shipping", href: "/shipping" }] },
          { title: "Legal", links: [{ label: "Privacy Policy", href: "/privacy" }, { label: "Terms of Service", href: "/terms" }] },
        ]}
      />
    </div>
  );
}