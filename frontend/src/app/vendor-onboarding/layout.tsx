"use client";

import VendorHeader from "@/src/app/components/layout/VendorHeader";
import Footer from "@/src/app/components/layout/Footer";
import { useAuth } from "@/src/context/AuthContext";

export default function VendorOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <VendorHeader userName={user ? `${user.firstName} ${user.lastName}` : undefined} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}