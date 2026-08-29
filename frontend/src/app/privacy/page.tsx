import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";

const sections = [
  {
    title: "Information We Collect",
    body: "We collect the information you provide directly to us, such as your name, email address, shipping address, and payment details when you create an account, place an order, or contact our support team. We also collect limited technical information — like device type and browser — to keep the marketplace secure and reliable.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process orders, communicate with you about purchases, personalize your shopping experience, and improve our platform. We do not sell your personal information to third parties.",
  },
  {
    title: "Sharing Your Information",
    body: "We share order details with the vendors fulfilling your purchase and with payment and delivery partners strictly as needed to complete a transaction. We require every partner to handle your data responsibly.",
  },
  {
    title: "Your Choices",
    body: "You can review and update your account details at any time from your profile, and you may request deletion of your account by contacting our support team.",
  },
  {
    title: "Contact Us",
    body: "If you have questions about this policy, reach out via our Contact page and our team will respond as soon as possible.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
