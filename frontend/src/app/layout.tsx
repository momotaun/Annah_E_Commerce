import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/src/context/CartContext";
import { AuthProvider } from "@/src/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME } from "@/src/lib/siteConfig";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Elevating everyday life through curated premium essentials. Your destination for high-end lifestyle and tech products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
