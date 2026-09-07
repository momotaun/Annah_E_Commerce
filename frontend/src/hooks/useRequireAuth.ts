"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { withLoginRedirect } from "@/src/lib/loginRedirect";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && !user) {
      const search = searchParams.toString();
      router.push(withLoginRedirect(pathname, search ? `?${search}` : ""));
    }
  }, [isLoading, user, router, pathname, searchParams]);

  return { user, isLoading };
}
