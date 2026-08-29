import { Leaf, Recycle, Handshake } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import StatBlock from "@/src/app/components/ui/StatBlock";
import InfoCard from "@/src/app/components/shared/InfoCard";

const stats = [
  { value: "40%", label: "Recycled packaging materials" },
  { value: "120+", label: "Vendors vetted for ethical sourcing" },
  { value: "18K", label: "Trees supported through offset programs" },
];

const commitments = [
  { icon: <Leaf className="h-5 w-5" />, title: "Responsible Sourcing", description: "We work with vendors who share our commitment to ethical, sustainable manufacturing." },
  { icon: <Recycle className="h-5 w-5" />, title: "Reduced Packaging", description: "Recyclable and minimal packaging across our fulfillment centers." },
  { icon: <Handshake className="h-5 w-5" />, title: "Community First", description: "Partnering with local South African makers and small businesses." },
];

export default function SustainabilityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">Sustainability</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Curating premium products shouldn&apos;t come at the planet&apos;s expense. Here&apos;s
            how we&apos;re working to make Apex Marketplace more responsible, one order at a time.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <StatBlock key={stat.label} {...stat} />
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {commitments.map((item) => (
              <InfoCard key={item.title} {...item} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
