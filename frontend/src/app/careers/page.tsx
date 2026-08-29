import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Badge from "@/src/app/components/ui/Badge";
import Button from "@/src/app/components/ui/Button";

const openRoles = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "Cape Town · Hybrid" },
  { title: "Vendor Success Manager", team: "Operations", location: "Johannesburg · On-site" },
  { title: "Product Designer", team: "Design", location: "Remote · South Africa" },
  { title: "Customer Support Specialist", team: "Support", location: "Cape Town · Hybrid" },
];

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">Careers at Apex Marketplace</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            We&apos;re a small team building a premium marketplace for South African shoppers and
            vendors. If you care about craft, speed, and customer experience, we&apos;d love to
            hear from you.
          </p>

          <div className="mt-10 flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200">
            {openRoles.map((role) => (
              <div
                key={role.title}
                className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{role.title}</span>
                    <Badge variant="outline">{role.team}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{role.location}</p>
                </div>
                <Button variant="outline" size="sm" href="/contact">
                  Apply
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Don&apos;t see a role that fits? Reach out via our{" "}
            <a href="/contact" className="text-primary-600 hover:underline">
              Contact page
            </a>{" "}
            — we&apos;re always open to meeting great people.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
