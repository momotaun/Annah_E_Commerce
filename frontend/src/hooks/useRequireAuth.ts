"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { withLoginRedirect } from "@/src/lib/loginRedirect";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // Read the query string directly rather than via useSearchParams():
      // this only ever runs client-side inside an effect, and the hook
      // version forces every page that renders this (through any layout)
      // into a Suspense boundary it otherwise has no reason to need.
      router.push(withLoginRedirect(pathname, window.location.search));
    }
  }, [isLoading, user, router, pathname]);

  return { user, isLoading };
}
