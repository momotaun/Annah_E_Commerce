import { notFound } from "next/navigation";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import { ApiError } from "@/src/lib/api-client";
import { getLegalPage } from "@/src/lib/api/legal-pages";

export default async function TermsPage() {
  const page = await getLegalPage("terms").catch((error) => {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  });

  if (!page) {
    notFound();
  }

  const lastUpdated = new Date(page.updatedAt).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          <p className="mt-3 text-sm text-gray-500">Last updated: {lastUpdated}</p>

          <div className="mt-10 flex flex-col gap-8">
            {page.sections.map((section) => (
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
