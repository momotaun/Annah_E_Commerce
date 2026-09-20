import { Apple, PlaySquare } from "lucide-react";
import HuaweiIcon from "@/src/app/components/ui/icons/HuaweiIcon";
import { SITE_NAME } from "@/src/lib/siteConfig";

// The mobile app (annah-ecommerce-mobile) isn't published to any store yet
// — badges are static, non-clickable placeholders until real listing URLs
// exist, rather than linking anywhere or pretending to be a real download.
const stores = [
  { name: "Apple App Store", icon: Apple, primaryLabel: "Download on the", secondaryLabel: "App Store" },
  { name: "Google Play", icon: PlaySquare, primaryLabel: "GET IT ON", secondaryLabel: "Google Play" },
  { name: "Huawei AppGallery", icon: HuaweiIcon, primaryLabel: "Explore it on", secondaryLabel: "AppGallery" },
];

function AppDownloadBadges() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col items-center gap-6 rounded-md border border-gray-200 bg-primary-50 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Get the {SITE_NAME} app</h2>
          <p className="mt-1 text-sm text-gray-500">Shop faster on the go — coming soon to these stores.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {stores.map(({ name, icon: Icon, primaryLabel, secondaryLabel }) => (
            <div
              key={name}
              aria-disabled="true"
              title={`${name} — coming soon`}
              className="relative flex cursor-not-allowed items-center gap-2 rounded-md border border-gray-900 bg-gray-900 px-4 py-2 opacity-60"
            >
              <Icon className="h-6 w-6 shrink-0 text-white" />
              <div className="text-left leading-tight">
                <p className="text-[9px] uppercase tracking-wide text-gray-300">{primaryLabel}</p>
                <p className="text-sm font-semibold text-white">{secondaryLabel}</p>
              </div>
              <span className="absolute -right-2 -top-2 rounded-full bg-danger-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AppDownloadBadges;
