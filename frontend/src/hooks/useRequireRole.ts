"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { withLoginRedirect } from "@/src/lib/loginRedirect";

export function useRequireRole(role: 'VENDOR' | 'ADMIN') {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      const search = searchParams.toString();
      router.push(withLoginRedirect(pathname, search ? `?${search}` : ""));
      return;
    }
    if (user.role !== role) {
      router.push("/profile"); // logged in, but wrong role — send somewhere sane, not a dead end
    }
  }, [isLoading, user, role, router, pathname, searchParams]);

  return { user, isLoading: isLoading || !user || user.role !== role };
}
