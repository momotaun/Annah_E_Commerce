import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/src/context/CartContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { SiteSettingsProvider } from "@/src/context/SiteSettingsContext";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME } from "@/src/lib/siteConfig";
import { getSiteSettings } from "@/src/lib/api/site-settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Elevating everyday life through curated premium essentials. Your destination for high-end lifestyle and tech products.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // A backend hiccup here shouldn't break every page — SiteSettingsProvider
  // falls back to static defaults when initialSettings is null.
  const siteSettings = await getSiteSettings().catch(() => null);

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <SiteSettingsProvider initialSettings={siteSettings}>
            <CartProvider>{children}</CartProvider>
          </SiteSettingsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
