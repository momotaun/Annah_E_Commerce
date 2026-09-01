import Image from "next/image";
import { Rocket, Eye, ShieldCheck, Award } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";
import StatBlock from "@/src/app/components/ui/StatBlock";
import InfoCard from "@/src/app/components/shared/InfoCard";
import TeamMemberCard from "@/src/app/components/shared/TeamMemberCard";

const pillars = [
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "Mission",
    description:
      "To empower global consumers by providing direct access to premium, verified goods through a transparent and frictionless marketplace interface.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Vision",
    description:
      "To become the world's most trusted ecosystem for high-end commerce, setting the gold standard for quality control and customer experience.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Values",
    description:
      "Integrity in our sourcing, precision in our logistics, and an relentless obsession with the success of our community members and partners.",
  },
];

const team = [
  { name: "Elena Vance", role: "Chief Executive Officer", image: "/images/about/team_1.png" },
  { name: "Marcus Thorne", role: "Head of Product", image: "/images/about/team_2.png" },
  { name: "Sarah Jenkins", role: "Operations Director", image: "/images/about/team_3.png" },
  { name: "David Chen", role: "CTO & Founder", image: "/images/about/team_4.png" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="bg-gray-50 px-6 py-[80px] text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Defining the <span className="text-primary-600">Apex</span> of Commerce.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            We bridge the gap between premium global craftsmanship and the
            modern digital consumer through an uncompromising commitment to
            quality.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 gap-[80px] lg:grid-cols-2 lg:items-center">
            <div>
              <Badge variant="default">Our Story</Badge>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Born from a vision of seamless luxury.
              </h2>
              <p className="mt-4 text-sm text-gray-500">
                Founded in 2018, Apex Marketplace started with a simple
                observation: the digital shopping experience often
                sacrificed trust for convenience. We set out to change that
                by curating a selection of products that represent the
                pinnacle of their respective categories.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Today, we serve a global community of discerning individuals
                who value transparency, authenticity, and design excellence.
                Every item in our catalogue is vetted through a rigorous
                20-point quality check.
              </p>

              <div className="mt-8 flex gap-10">
                <StatBlock value="12k+" label="Premium Products" />
                <StatBlock value="98%" label="Client Retention" />
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
                <Image src="/images/about/banner.png" alt="Apex Marketplace office" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-md bg-primary-600 p-4 text-white shadow-lg">
                <Award className="h-6 w-6" />
                <span className="text-sm font-semibold">Trusted by Leaders</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-[80px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold text-gray-900">The Pillars of Apex</h2>
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

        <section className="mx-auto max-w-7xl px-6 py-[80px]">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-primary-600">
                Our Leadership
              </span>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Meet the architects of the future.
              </h2>
            </div>
            <a href="#" className="text-sm font-medium text-primary-600 hover:underline">
              View full team →
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {team.map((member) => (
              <TeamMemberCard key={member.name} {...member} />
            ))}
          </div>
        </section>

        <section className="px-6 py-[80px]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-md bg-primary-600 p-[80px] text-white md:flex-row">
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Ready to elevate your standards?
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/80">
                Join over 50,000 members who experience the finest global
                products with unparalleled security and service.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <Button variant="secondary" href="/register">
                Join our community
              </Button>
              <span className="text-xs text-white/70">
                No membership fees for the first 1,000 signups.
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}