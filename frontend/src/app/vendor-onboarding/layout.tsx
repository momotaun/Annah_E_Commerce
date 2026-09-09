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
      <Footer />
    </div>
  );
}