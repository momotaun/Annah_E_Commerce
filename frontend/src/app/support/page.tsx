import { Mail, MessageCircle, Clock, Store } from "lucide-react";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Button from "@/src/app/components/ui/Button";
import InfoCard from "@/src/app/components/shared/InfoCard";

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Have a question about an order, your account, or selling on Apex Marketplace?
            Here&apos;s how to reach us.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title="Email Us"
              description="support@apexmarketplace.co.za — we reply within one business day."
            />
            <InfoCard
              icon={<Clock className="h-5 w-5" />}
              title="Response Times"
              description="Mon–Fri 08:00–18:00, Sat 09:00–14:00 (SAST). Closed Sundays."
            />
            <InfoCard
              icon={<MessageCircle className="h-5 w-5" />}
              title="Contact Form"
              description="Send us the details of your issue and we'll follow up by email."
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-16">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Vendor Support</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Already selling on Apex? Our vendor success team can help with
                  onboarding, payouts, and listing questions.
                </p>
              </div>
            </div>
            <Button variant="outline" href="/contact">Contact Vendor Team</Button>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-6 pb-16 text-center">
          <p className="text-sm text-gray-500">
            Looking for quick answers instead? Check our{" "}
            <a href="/help" className="text-primary-600 hover:underline">Help Center</a>{" "}
            for common questions, or use the full{" "}
            <a href="/contact" className="text-primary-600 hover:underline">Contact form</a>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
