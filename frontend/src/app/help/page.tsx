import { Truck, RotateCcw, UserCircle, Store } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import Accordion from "@/src/app/components/ui/Accordion";

const topics = [
  { icon: <Truck className="h-5 w-5" />, title: "Shipping & Delivery", description: "Delivery times, tracking, and costs.", href: "/shipping" },
  { icon: <RotateCcw className="h-5 w-5" />, title: "Returns & Refunds", description: "How to return an item and get refunded.", href: "/returns" },
  { icon: <UserCircle className="h-5 w-5" />, title: "Account & Orders", description: "Managing your profile and order history.", href: "/profile" },
  { icon: <Store className="h-5 w-5" />, title: "Selling on Apex", description: "Vendor onboarding and support.", href: "/support" },
];

const faqs = [
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive a tracking link by email. You can also view order status anytime from your profile.",
  },
  {
    question: "Can I change or cancel an order after placing it?",
    answer: "Reach out to our support team as soon as possible — we can amend or cancel orders that haven't shipped yet.",
  },
  {
    question: "How do I become a vendor on Apex Marketplace?",
    answer: "Start the vendor onboarding flow from your account, or contact us and our vendor success team will guide you through verification.",
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes. All transactions are encrypted end-to-end and processed through PCI-compliant payment partners — we never store your card details.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Find answers to common questions, or browse a topic below to get started.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => (
              <a
                key={topic.title}
                href={topic.href}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 hover:border-primary-600"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  {topic.icon}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{topic.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 pb-16">
          <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-6">
            <Accordion items={faqs} />
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">Still need a hand? Our team is here to help.</p>
            <Button variant="primary" href="/contact">Contact Support</Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
