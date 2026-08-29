import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By creating an account or placing an order on Apex Marketplace, you agree to be bound by these Terms of Service and our Privacy Policy.",
  },
  {
    title: "Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately of any unauthorized use.",
  },
  {
    title: "Orders & Payment",
    body: "All prices are listed in South African Rand and are subject to change without notice. Orders are confirmed once payment has been successfully processed. We reserve the right to refuse or cancel any order at our discretion.",
  },
  {
    title: "Vendors",
    body: "Products sold through Apex Marketplace may be listed by independent vendors. While we vet every vendor onboarded to the platform, each vendor is responsible for the accuracy of their own listings.",
  },
  {
    title: "Limitation of Liability",
    body: "Apex Marketplace is provided on an \"as is\" basis. We are not liable for indirect or consequential damages arising from your use of the platform, to the fullest extent permitted by law.",
  },
  {
    title: "Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of Apex Marketplace after changes take effect constitutes acceptance of the revised terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-3 text-sm text-gray-500">Last updated: January 2026</p>

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
