"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, getMe, AuthUser } from "@/src/lib/api/auth";
import { tokenStore } from "@/src/lib/api-client";
import { ApiError } from "@/src/lib/api-client";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ACCESS_KEY = "apex_access_token";
const REFRESH_KEY = "apex_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem(ACCESS_KEY);
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    tokenStore.setAccessToken(accessToken);
    getMe(accessToken)
      .then(setUser)
      .catch(() => {
        // Access token expired and refresh (handled inside apiClient) also
        // failed — clear stale tokens rather than leaving the UI stuck
        // thinking it's still logged in.
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        tokenStore.setAccessToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await apiLogin({ email, password });
    localStorage.setItem(ACCESS_KEY, result.accessToken);
    localStorage.setItem(REFRESH_KEY, result.refreshToken);
    tokenStore.setAccessToken(result.accessToken);
    setUser(result.user);
  }

  async function register(data: { email: string; password: string; firstName: string; lastName: string }) {
    const result = await apiRegister(data);
    localStorage.setItem(ACCESS_KEY, result.accessToken);
    localStorage.setItem(REFRESH_KEY, result.refreshToken);
    tokenStore.setAccessToken(result.accessToken);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    tokenStore.setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}