import { CheckCircle2 } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Badge from "@/src/app/components/ui/Badge";

const services = [
  "Storefront & Browsing",
  "Search",
  "Checkout & Payments",
  "Order Fulfillment",
  "Vendor Portal",
];

export default function StatusPage() {
  const today = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16">
          <div className="flex items-center gap-3 rounded-2xl border border-success-500/20 bg-success-500/10 p-6">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-success-500" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">All Systems Operational</h1>
              <p className="text-sm text-gray-500">Last checked: {today}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col divide-y divide-gray-200 rounded-2xl border border-gray-200">
            {services.map((service) => (
              <div key={service} className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-medium text-gray-900">{service}</span>
                <Badge variant="success">Operational</Badge>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Experiencing an issue that isn&apos;t reflected here?{" "}
            <a href="/contact" className="text-primary-600 hover:underline">Let us know</a>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
