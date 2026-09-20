import Image from "next/image";
import { Rocket, Eye, ShieldCheck } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import InfoCard from "@/src/app/components/shared/InfoCard";
import { SITE_NAME } from "@/src/lib/siteConfig";

const pillars = [
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "Mission",
    description:
      "To connect shoppers with independent local sellers through a transparent, easy-to-trust marketplace.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Vision",
    description:
      "To become the marketplace South African shoppers and sellers rely on for a fair, reliable buying experience.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Values",
    description:
      "Verified sellers, honest pricing, and a relentless focus on getting orders to you as promised.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="bg-gray-50 px-6 py-[80px] text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Local sellers. <span className="text-primary-600">Real trust.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            {SITE_NAME} connects shoppers with independent local sellers,
            backed by verified sellers, transparent pricing and reliable
            delivery.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-[80px] lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="default">Our Story</Badge>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Built for shoppers and sellers alike.
              </h2>
              <p className="mt-4 text-sm text-gray-500">
                {SITE_NAME} started with a simple observation: the digital
                shopping experience often sacrifices trust for convenience.
                We set out to change that by giving every seller a
                verification process, and every shopper clear delivery,
                pricing and return information before they buy.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                {`Every seller on ${SITE_NAME} goes through onboarding and verification, so you always know who you're buying from and who stands behind your order.`}
              </p>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                <Image src="/images/about/banner.png" alt={`${SITE_NAME} office`} fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-[80px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold text-gray-900">Our Pillars</h2>
            <p className="mt-2 text-base text-gray-500">
              Our guiding principles dictate every decision we make, from
              partner selection to final delivery.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <InfoCard
                key={pillar.title}
                icon={pillar.icon}
                title={pillar.title}
                description={pillar.description}
              />
            ))}
          </div>
        </section>

        <section className="px-6 py-[80px]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-md bg-primary-600 p-[80px] text-white md:flex-row">
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Ready to shop local?
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/80">
                Discover verified local sellers and shop with confidence on{" "}
                {SITE_NAME}.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <Button variant="secondary" href="/register">
                Join our community
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}