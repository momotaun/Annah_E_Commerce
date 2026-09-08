"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { withLoginRedirect } from "@/src/lib/loginRedirect";

export function useRequireRole(role: 'VENDOR' | 'ADMIN') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      // Read the query string directly rather than via useSearchParams():
      // this only ever runs client-side inside an effect, and the hook
      // version forces every page that renders this (through any layout)
      // into a Suspense boundary it otherwise has no reason to need.
      router.push(withLoginRedirect(pathname, window.location.search));
      return;
    }
    if (user.role !== role) {
      router.push("/profile"); // logged in, but wrong role — send somewhere sane, not a dead end
    }
  }, [isLoading, user, role, router, pathname]);

  return { user, isLoading: isLoading || !user || user.role !== role };
}
