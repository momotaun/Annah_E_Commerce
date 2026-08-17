"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export function useRequireRole(role: 'VENDOR' | 'ADMIN') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== role) {
      router.push("/profile"); // logged in, but wrong role — send somewhere sane, not a dead end
    }
  }, [isLoading, user, role, router]);

  return { user, isLoading: isLoading || !user || user.role !== role };
}