import { Truck, Clock, MapPin, PackageCheck } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import InfoCard from "@/src/app/components/shared/InfoCard";

const highlights = [
  { icon: <Truck className="h-5 w-5" />, title: "Same-Day Dispatch", description: "Orders placed before 2pm ship the same business day." },
  { icon: <Clock className="h-5 w-5" />, title: "1–3 Business Days", description: "Standard delivery to major South African metros." },
  { icon: <MapPin className="h-5 w-5" />, title: "Nationwide Coverage", description: "We deliver to every province, including outlying areas." },
  { icon: <PackageCheck className="h-5 w-5" />, title: "Tracked & Insured", description: "Every order ships with tracking and delivery insurance." },
];

export default function ShippingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">Shipping & Delivery</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            We partner with trusted couriers to get your order to you quickly and safely, wherever
            you are in South Africa.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {highlights.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Delivery Times</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Major metros (Johannesburg, Cape Town, Durban, Pretoria) typically receive orders
                within 1–3 business days. Outlying areas may take 3–5 business days. Delivery
                estimates are shown at checkout based on your address.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Shipping Costs</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Shipping is free on orders over R1000. Orders below this threshold incur a flat
                shipping fee calculated at checkout.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Tracking</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Once your order ships, you&apos;ll receive a tracking link by email. You can also
                view order status anytime from your profile.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
