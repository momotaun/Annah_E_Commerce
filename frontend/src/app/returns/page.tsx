import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";

const sections = [
  {
    title: "30-Day Return Window",
    body: "Most items can be returned within 30 days of delivery for a full refund, provided they're unused and in their original packaging.",
  },
  {
    title: "How to Start a Return",
    body: "Head to your order history from your profile and select \"Request a Return\" on the relevant order. Our support team will confirm the return and send you a prepaid shipping label.",
  },
  {
    title: "Refunds",
    body: "Once we receive and inspect your return, we'll process your refund to the original payment method. Refunds typically reflect within 5–7 business days.",
  },
  {
    title: "Exchanges",
    body: "Need a different size or colour instead? Let us know when you request your return and we'll prioritize getting the replacement out to you.",
  },
  {
    title: "Non-Returnable Items",
    body: "For hygiene and safety reasons, certain items — such as earphones and intimate apparel — can only be returned if faulty.",
  },
];

export default function ReturnsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">Returns & Refunds</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Not quite right? We want you to love what you ordered — here&apos;s how returns and
            refunds work at Apex Marketplace.
          </p>

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
