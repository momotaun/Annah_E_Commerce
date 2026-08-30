import Link from "next/link";
import { FileText } from "lucide-react";

const pages = [
  { slug: "privacy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
];

export default function AdminLegalPagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
      <p className="mt-1 text-sm text-gray-500">
        Edit the copy shown on the public Privacy Policy and Terms of Service pages.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/legal-pages/${page.slug}`}
            className="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-4 hover:border-primary-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-gray-900">{page.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
